<template>
  <div id="app">
    <nav class="navbar navbar-expand-md navbar-light head downPage">
      <div class="navbar-header branding branding-logo">
        <a href="https://lco.global" title="LCO.global" rel="home">
          <img src="https://cdn.lco.global/mainstyle/img/LCO-logo-web.jpg" alt="Las Cumbres Observatory" />
        </a>
      </div>
      <div class="navbar-header branding pl-md-3">
        <div id="lco-name">
          <router-link :to="{ name: 'home' }" class="grey">
            Observation
            <br />Portal
          </router-link>
          <span v-if="simpleInterface" class="basic">basic mode</span>
        </div>
      </div>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarOptions"
        aria-controls="navbarOptions"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon" />
      </button>
      <div id="navbarOptions" class="navbar-collapse collapse headNav">
        <ul class="nav navbar-nav navbar-main ml-auto">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'home' }">
              Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'create' }">
              Submit Observation
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'proposals', query: { active: true } }">
              Manage Proposals
            </router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="https://lco.global/observatory/tools/">Planning Tools</a>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'help' }">
              Help
            </router-link>
          </li>
        </ul>
        <ul class="nav navbar-nav navbar-right">
          <li v-if="userIsAuthenticated" class="dropdown nav-item">
            <a id="userNavOptions" class="dropdown-toggle nav-link" data-toggle="dropdown" href="#">{{ profile.username }}</a>
            <div class="dropdown-menu" aria-labelledby="userNavOptions">
              <router-link class="dropdown-item" :to="{ name: 'profile' }">
                Profile
              </router-link>
              <passthrough-get
                endpoint="/accounts/logout/"
                :as-link="true"
                link-text="Logout"
                success-redirect-view-name="home"
                link-classes="dropdown-item"
              />
            </div>
          </li>
          <li v-else class="nav-item">
            <router-link class="nav-link" :to="{ name: 'login' }">
              Login
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
    <section>
      <div class="intro downPage blue">
        <br />
      </div>
    </section>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <b-alert
            v-for="message in messages"
            :key="message.text"
            :variant="message.variant"
            dismissible
            show
            @dismissed="deleteMessage(message.text)"
          >
            {{ message.text }}
          </b-alert>
        </div>
      </div>
      <router-view />
    </div>
    <div class="footer">
      Copyright © {{ year }} Las Cumbres Observatory. All rights reserved.
      <br />
      <a title="terms of service" href="https://lco.global/observatory/termsofservice/">Terms of Service</a>&nbsp;
      <a title="privacy policy" href="https://lco.global/privacy-policy/">Privacy Policy</a>&nbsp;
      <a title="github" href="https://github.com/observatorycontrolsystem/observation-portal"> <i class="fab fa-github" /> View on Github </a>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import PassthroughGet from '@/components/PassthroughGet.vue';

export default {
  name: 'App',
  components: {
    PassthroughGet
  },
  data: function() {
    return {
      year: moment.utc().format('YYYY')
    };
  },
  computed: {
    profile: function() {
      return this.$store.state.profile;
    },
    userIsAuthenticated: function() {
      return this.$store.state.userIsAuthenticated;
    },
    simpleInterface: function() {
      return this.profile && this.profile.profile && this.profile.profile.simple_interface;
    },
    messages: function() {
      return this.$store.state.messages;
    }
  },
  methods: {
    deleteMessage: function(messageText) {
      this.$store.commit('deleteMessage', messageText);
    }
  }
};
</script>
