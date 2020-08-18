import Vue from 'vue';
import Vuex from 'vuex';
import $ from 'jquery';

Vue.use(Vuex);

const EMPTY_PROFILE_DATA = {
  profile: {},
  tokens: {},
  proposals: [],
  available_instrument_types: []
}

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    profile: EMPTY_PROFILE_DATA,
    userIsAuthenticated: false,
    userAcceptedTerms: false,
    messages: [],
    urls: {}
  },
  mutations: {
    setProfileData (state, profileData) {
      state.profile = profileData;
      this.commit('setUserIsAuthenticated', profileData);
      this.commit('setUserAcceptedTerms', profileData);
    },
    setUserIsAuthenticated (state, profileData) {
      let authenticated = profileData.username ? true : false;
      state.userIsAuthenticated = authenticated;
    },
    setUserAcceptedTerms (state, profileData) {
      let acceptedTerms = false;
      if (profileData.profile.terms_accepted || profileData.profile.is_staff) {
        acceptedTerms = true
      }
      state.userAcceptedTerms = acceptedTerms;
    },
    setRuntimeConfig (state, payload) {
      state.urls = payload;
    },
    addMessage (state, newMessage) {
      let messageAlreadyInList = false;
      for (let message of state.messages) {
        if (message.text === newMessage.text) {
          messageAlreadyInList = true;
          break;
        }
      }
      if (!messageAlreadyInList) {
        state.messages.push(newMessage);
      }
    },
    clearAllMessages (state) {
      state.messages = [];
    },
    deleteMessage (state, messageText) {
      state.messages = state.messages.filter(
        function(value) { return value.text !== messageText; }
      )
    }
  },
  actions: {
    getProfileData (context) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: context.state.urls.observationPortalApi + '/api/profile/',
          success: function (response) {
            context.commit('setProfileData', response);
            resolve();
          },
          error: function(response) {
            context.commit('setProfileData', EMPTY_PROFILE_DATA);
            if (response.status === 403) {
              // User is not authenticated, but that is ok
              resolve();
            } else {
              reject();
            }
          }
        });
      })
    }
  },
  modules: {
  }
})
