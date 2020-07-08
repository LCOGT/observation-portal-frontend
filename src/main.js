import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap';

import '@/assets/css/main.css';

Vue.config.productionTip = false

const getRuntimeConfig = async () => {
  const runtimeConfig = await fetch('/config.json');
  return await runtimeConfig.json();
}

getRuntimeConfig().then(function(json) {

  Vue.mixin({
    data() {
      return {
        // Distribute configs into every Vue component.
        observationPortalApiUrl: process.env.VUE_APP_OBSERVATION_PORTAL_API_URL || json.observationPortalApiUrl,
        archiveApiUrl: process.env.VUE_APP_ARCHIVE_API_URL || json.archiveApiUrl,
        simbadServiceUrl: process.env.VUE_APP_SIMBAD_SERVICE_URL || json.simbadServiceUrl,
      }
    },
  });

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')

});
