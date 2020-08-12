import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    profile: {
      profile: {},
      tokens: {},
      proposals: [],
      available_instrument_types: []
    },
    userIsAuthenticated: false,
    userAcceptedTerms: false,
    urls: {}
  },
  mutations: {
    setProfileData (state, payload) {
      state.profile = payload;
      if (payload.username) {
        state.userIsAuthenticated = true;
      }
      if (payload.profile.terms_accepted) {
        state.userAcceptedTerms = true;
      }
    },
    setRuntimeConfig (state, payload) {
      state.urls = payload;
    }
  },
  actions: {
  },
  modules: {
  }
})
