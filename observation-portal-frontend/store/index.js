import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default function() {
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    state: {
      profile: {
        profile: {},
        tokens: {},
        proposals: [],
        available_instrument_types: []
      },
      userIsAuthenticated: false
    },
    mutations: {
      setProfileData (state, payload) {
        state.profile = payload;
        if (payload.username) {
          state.userIsAuthenticated = true;
        }
      }
    },
    actions: {
    },
    modules: {
    }
  })
}
