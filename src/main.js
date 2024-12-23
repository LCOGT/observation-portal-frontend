// Loads in polyfills for targeted environment
import 'core-js/stable';
import 'regenerator-runtime/runtime';
// Load other dependencies
import Vue from 'vue';
import '@/composition-api.js';
import App from './App.vue';
import router from './router';
import store from './store';
import { BootstrapVue, BIcon, BIconStickies, BootstrapVueIcons } from 'bootstrap-vue';
import 'bootstrap';
import '@/assets/scss/app.scss';
import $ from 'jquery';
import { getCookie, csrfSafeMethod } from '@/utils.js';
import { OCSComponentLib } from 'ocs-component-lib';
import 'ocs-component-lib/dist/ocs-component-lib.css';
import VueKatex from 'vue-katex';
import 'katex/dist/katex.min.css';

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.component('BIcon', BIcon);
Vue.component('BIconStickies', BIconStickies);
Vue.use(OCSComponentLib);
Vue.use(VueKatex, {
  globalOptions: {
    throwOnError: false,
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\begin{equation}', right: '\\end{equation}', display: true },
      { left: '\\begin{align}', right: '\\end{align}', display: true },
      { left: '\\begin{alignat}', right: '\\end{alignat}', display: true },
      { left: '\\begin{gather}', right: '\\end{gather}', display: true },
      { left: '\\begin{CD}', right: '\\end{CD}', display: true },
      { left: '\\[', right: '\\]', display: true }
    ]
  }
});

Vue.config.productionTip = false;

$.ajax({
  method: 'GET',
  url: '/config/urls.json'
}).done(function(json) {
  store.commit('setRuntimeConfig', {
    observationPortalApi: process.env.VUE_APP_OBSERVATION_PORTAL_API_URL || json.observationPortalApiUrl,
    archiveApi: process.env.VUE_APP_ARCHIVE_API_URL || json.archiveApiUrl,
    archiveClient: process.env.VUE_APP_ARCHIVE_CLIENT_URL || json.archiveClientUrl,
    simbadService: process.env.VUE_APP_SIMBAD_SERVICE_URL || json.simbadServiceUrl,
    thumbnailService: process.env.VUE_APP_THUMBNAILS_SERVICE_URL || json.thumbnailServiceUrl
  });

  // Add csrf protection and credentials to requests sent to the observation portal API
  $(document).ajaxSend(function(event, xhr, settings) {
    if (settings.url.startsWith(store.state.urls.observationPortalApi)) {
      if (!csrfSafeMethod(settings.type)) {
        var csrftoken = getCookie('csrftoken');
        xhr.setRequestHeader('X-CSRFToken', csrftoken);
      }
      settings.xhrFields = {
        withCredentials: true
      };
    }
  });

  // Add the archive token to a request being sent to the archive api or the thumbservice
  $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (
      (options.url.startsWith(store.state.urls.archiveApi) || options.url.startsWith(store.state.urls.thumbnailService)) &&
      store.state.profile.tokens.api_token
    ) {
      jqXHR.setRequestHeader('Authorization', 'Token ' + store.state.profile.tokens.api_token);
    }
  });

  store
    .dispatch('getProfileData')
    .then(() => {
      new Vue({
        router,
        store,
        render: h => h(App)
      }).$mount('#app');
    })
    .catch(() => {
      // TODO: Display error page
      console.log('Error getting profile data');
    });
});
