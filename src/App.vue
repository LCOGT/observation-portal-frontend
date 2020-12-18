<template>
  <div v-if="isPlainPage">
    <router-view />
  </div>
  <div v-else id="app" class="d-flex flex-column h-100">
    <div>
      <b-navbar toggleable="lg" variant="lco-dark-blue" type="dark">
        <b-navbar-brand href="https://lco.global">
          <b-img
            class="brand-image-small d-inline-block align-top d-lg-none"
            src="https://cdn.lco.global/mainstyle/img/LCO_logo_transparent_with_coords.png"
            alt="Las Cumbres Observatory"
          ></b-img>
          <b-img
            class="brand-image-large align-top d-none d-lg-inline-block"
            src="https://cdn.lco.global/mainstyle/img/LCO_logo_transparent_with_coords.png"
            alt="Las Cumbres Observatory"
          ></b-img>
          <div id="lco-name-large" class="lco-name text-left pl-2 align-top d-none d-lg-inline-block">Observation<br />Portal</div>
          <div id="lco-name-small" class="lco-name text-left pl-2 align-top d-inline-block d-lg-none">
            Observation<br />Portal <span v-if="simpleInterface" class="d-lg-none green basic-small">Basic Mode</span>
          </div>
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item :to="{ name: 'home' }">Home</b-nav-item>
            <b-nav-item :to="{ name: 'create' }">Submit Observation</b-nav-item>
            <b-nav-item :to="{ name: 'proposals' }">Manage Proposals</b-nav-item>
            <b-nav-item href="https://lco.global/observatory/tools/">Planning Tools</b-nav-item>
            <b-nav-item :to="{ name: 'help' }">Help</b-nav-item>
            <template v-if="userIsAuthenticated">
              <hr class="w-100 d-lg-none border-light" />
              <b-nav-text class="d-lg-none"
                ><i class="fas fa-user-alt"></i> <span class="font-weight-bold">{{ profile.username }}</span></b-nav-text
              >
              <b-nav-item class="d-lg-none" :to="{ name: 'profile' }">Profile</b-nav-item>
              <passthrough-get
                class="d-lg-none"
                endpoint="/accounts/logout/"
                :as-link="true"
                link-text="Logout"
                success-redirect-path="/"
                link-classes="nav-link"
                error-message="Oops, there was an error logging out, please try again."
              />
            </template>
            <template v-else>
              <b-nav-item class="d-lg-none" :to="{ name: 'login' }">Login</b-nav-item>
            </template>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-text class="d-none d-lg-block"><span v-if="simpleInterface" class="green mx-1">Basic Mode</span></b-nav-text>
            <b-nav-item-dropdown v-if="userIsAuthenticated" class="d-none d-lg-block" right>
              <template #button-content>
                <i class="fas fa-user-alt"></i>
              </template>
              <b-dropdown-text
                >Logged in as <span class="font-weight-bold">{{ profile.username }}</span></b-dropdown-text
              >
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item :to="{ name: 'profile' }">Profile</b-dropdown-item>
              <passthrough-get
                endpoint="/accounts/logout/"
                :as-link="true"
                link-text="Logout"
                success-redirect-path="/"
                link-classes="dropdown-item"
                error-message="Oops, there was an error logging out, please try again."
              />
            </b-nav-item-dropdown>
            <b-nav-item v-else :to="{ name: 'login' }" class="d-none d-lg-block">Login</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <b-container :fluid="isFluidPage" class="flex-shrink-0 p-0">
      <b-row>
        <b-col md="12">
          <b-alert
            v-for="message in messages"
            :key="message.text"
            :variant="message.variant"
            class="m-1"
            dismissible
            show
            @dismissed="deleteMessage(message.text)"
          >
            {{ message.text }}
          </b-alert>
        </b-col>
      </b-row>
      <router-view class="my-3" />
    </b-container>
    <div class="footer text-center mt-auto pt-2">
      Copyright <span class="align-top"><i class="far fa-copyright fa-xs"></i></span> {{ year }} Las Cumbres Observatory. All rights reserved.
      <ul>
        <li><a class="black" title="terms of service" href="https://lco.global/observatory/termsofservice/">Terms of Service</a></li>
        <li><a class="black" title="privacy policy" href="https://lco.global/observatory/privacy-policy/">Privacy Policy</a></li>
        <li>
          <a class="black" title="github" href="https://github.com/observatorycontrolsystem/observation-portal">
            <i class="fab fa-github"></i> View API on Github
          </a>
        </li>
      </ul>
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
    },
    isFluidPage: function() {
      // A fluid page is a page where the contents take up the entire width of the page.
      return this.$route.meta.isFluidPage;
    },
    isPlainPage: function() {
      // A plain page is a page that has minimal styling and that does not have the usual
      // page header and footer.
      return this.$route.meta.isPlainPage;
    }
  },
  watch: {
    isPlainPage: function() {
      this.updatePageStyles();
    }
  },
  created: function() {
    this.updatePageStyles();
  },
  methods: {
    deleteMessage: function(messageText) {
      this.$store.commit('deleteMessage', messageText);
    },
    updatePageStyles: function() {
      // Disable all styles on the page if this route is marked as plain.
      for (let styleSheet of document.styleSheets) {
        if (this.isPlainPage) {
          styleSheet.disabled = true;
        } else {
          styleSheet.disabled = false;
        }
      }
    }
  }
};
</script>
<style scoped>
.brand-image-large {
  max-height: 50px;
}
.brand-image-small {
  max-height: 45px;
}
.lco-name {
  font-family: 'Heebo', sans-serif;
}
#lco-name-large {
  font-size: 1.2rem;
}
#lco-name-small {
  font-size: 1rem;
}
.basic-small {
  font-size: 0.6rem;
}
</style>
