<template>
  <b-row>
    <b-col md="8">
      <h2>Settings</h2>
      <b-form @submit="updateProfileData" @reset="clearProfileForm">
        <b-form-group id="input-group-first-name" label="First Name" label-for="input-first-name">
          <b-form-input id="input-first-name" v-model="formData.first_name" :state="getValidState('first_name')" required />
          <b-form-invalid-feedback id="input-first-name-state">
            <span v-for="msg in getFeedback('first_name')" :key="msg">{{ msg }}</span>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group id="input-group-last-name" label="Last Name" label-for="input-last-name">
          <b-form-input id="input-last-name" v-model="formData.last_name" :state="getValidState('last_name')" required />
          <b-form-invalid-feedback id="input-last-name-state">
            <span v-for="msg in getFeedback('last_name')" :key="msg">{{ msg }}</span>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group id="input-group-username" label="Username" label-for="input-username">
          <b-form-input id="input-username" v-model="formData.username" :state="getValidState('username')" required />
          <b-form-invalid-feedback id="input-username-state">
            <span v-for="msg in getFeedback('username')" :key="msg">{{ msg }}</span>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group id="input-group-email" label="Email" label-for="input-email">
          <b-form-input id="input-email" v-model="formData.email" type="email" :state="getValidState('email')" required />
          <b-form-invalid-feedback id="input-email-state">
            <span v-for="msg in getFeedback('email')" :key="msg">{{ msg }}</span>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group id="input-group-institution" label="Institution" label-for="input-institution">
          <b-form-input id="input-institution" v-model="formData.profile.institution" :state="getValidState('profile.institution')" required />
          <b-form-invalid-feedback id="input-institution-state">
            <span v-for="msg in getFeedback('profile.institution')" :key="msg">{{ msg }}</span>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group id="input-group-title" label="Title" label-for="input-title">
          <b-form-input id="input-title" v-model="formData.profile.title" :state="getValidState('profile.title')" required />
          <b-form-invalid-feedback id="input-title-state">
            <span v-for="msg in getFeedback('profile.title')" :key="msg">{{ msg }}</span>
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group
          id="checkbox-group-simple-interface"
          label-for="checkbox-simple-interface"
          description="Hide advanced fields on the request composition page."
        >
          <b-form-checkbox id="checkbox-simple-interface" v-model="formData.profile.simple_interface" :state="getValidState('simple_interface')">
            Simple interface
          </b-form-checkbox>
        </b-form-group>
        <b-form-group id="checkbox-group-notifications-enabled" label-for="checkbox-notifications-enabled">
          <template slot="description">
            <p>
              Recieve email notifications for every completed observation on all proposals. To recieve email notifications for a single proposal,
              update your preferences on that proposal's detail page.
            </p>
          </template>
          <b-form-checkbox
            id="checkbox-notifications-enabled"
            v-model="formData.profile.notifications_enabled"
            :state="getValidState('notifications_enabled')"
          >
            Notifications enabled
          </b-form-checkbox>
        </b-form-group>
        <b-form-group id="checkbox-group-notifications-on-authored-only" label-for="checkbox-notifications-on-authored-only">
          <template slot="description">
            <p>
              Only recieve email notifications for requests you have submitted yourself. Note this setting alone does not enable any notifications.
              You must either enable the "Notifications enabled" setting above or enable notifications on a specific proposal for this to take effect.
            </p>
          </template>
          <b-form-checkbox
            id="checkbox-notifications-on-authored-only"
            v-model="formData.profile.notifications_on_authored_only"
            :state="getValidState('notifications_on_authored_only')"
          >
            Notifications on authored only
          </b-form-checkbox>
        </b-form-group>
        <b-form-group id="checkbox-group-view-authored-requests-only" label-for="checkbox-view-authored-requests-only">
          <template slot="description">
            <p>Only requests that were authored by you will be visible.</p>
          </template>
          <b-form-checkbox
            id="checkbox-view-authored-requests-only"
            v-model="formData.profile.view_authored_requests_only"
            :state="getValidState('view_authored_requests_only')"
          >
            View authored requests only
          </b-form-checkbox>
        </b-form-group>
        <b-form-group v-if="profile.is_staff" id="checkbox-group-staff-view" label-for="checkbox-staff-view">
          <b-form-checkbox id="checkbox-staff-view" v-model="formData.profile.staff_view" :state="getValidState('staff_view')">
            Staff view
          </b-form-checkbox>
        </b-form-group>
        <b-button type="submit" variant="primary">
          Save
        </b-button>
        <b-button type="reset" variant="primary">
          Cancel
        </b-button>
        <router-link :to="{ name: 'passwordChange' }" class="btn btn-danger pull-right">
          Change Password
        </router-link>
      </b-form>
    </b-col>
    <b-col md="4">
      <h2>API Key</h2>
      <p>
        The following key may be used to authenticate when using the
        <a :href="observationPortalApiUrl + '/api/'">API</a>. This key should be treated like a password.
      </p>
      <input class="form-control" :value="apiToken" onclick="this.select()" readonly />
      <p>
        If you think your API token may have been compromised (by accidentally checking it in to a public source code repository, emailing it out,
        etc) you may revoke the token to obtain a new one using the button below. WARNING: This will cause any applications that use this token to
        stop working!
      </p>
      <b-button variant="danger" @click="performRevokeToken">
        Revoke Token
      </b-button>
      <h2>API Quota</h2>
      <p>
        The observations API is rate limited so that it remains available to all users in the event a single user makes too many requests in too rapid
        a succession, causing denial of service to other clients.
      </p>
      <p>The rate limit is applied on a 24 hour rolling window. Your current quota is:</p>
      <p>
        <strong>{{ apiQuota.used }} out of {{ apiQuota.allowed }}</strong>
      </p>
      <h2>Account Removal</h2>
      <p>You may request that your account be deleted.</p>
      <router-link :to="{ name: 'accountRemovalRequest' }" title="Request account removal">
        Request account removal
      </router-link>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { copyObject } from '@/utils.js';

export default {
  name: 'Profile',
  data: function() {
    return {
      formData: {},
      errors: null
    };
  },
  computed: {
    apiToken: function() {
      return _.get(this.profile, 'tokens.api_token', '');
    },
    apiQuota: function() {
      return _.get(this.profile, 'profile.api_quota', {});
    },
    profile: function() {
      return copyObject(this.$store.state.profile);
    },
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  watch: {
    profile: function() {
      this.setProfileData();
    }
  },
  created: function() {
    this.setProfileData();
  },
  methods: {
    getFeedback: function(key) {
      let feedback = _.get(this.errors, key);
      return feedback || '';
    },
    getValidState(key) {
      if (this.errors === null) {
        return null;
      }
      let errorsForKey = _.get(this.errors, key);
      return errorsForKey ? false : true;
    },
    performRevokeToken: function(evt) {
      evt.preventDefault();
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/revoke_token/',
        success: function(response) {
          that.$store.dispatch('getProfileData');
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
        },
        error: function() {
          that.$store.commit('addMessage', { text: 'There was a problem revoking your token, please try again', variant: 'danger' });
        }
      });
    },
    clearProfileForm: function(evt) {
      evt.preventDefault();
      this.setProfileData();
    },
    setProfileData: function() {
      let profileData = copyObject(this.$store.state.profile.profile);
      let topLevelData = copyObject(this.$store.state.profile);
      topLevelData.profile = profileData;
      this.formData = topLevelData;
    },
    updateProfileData: function(evt) {
      evt.preventDefault();
      let that = this;
      $.ajax({
        method: 'PATCH',
        url: this.observationPortalApiUrl + '/api/profile/',
        data: JSON.stringify(that.formData),
        contentType: 'application/json',
        success: function() {
          that.$store.commit('clearAllMessages');
          that.$store.commit('addMessage', { text: 'Profile successfully updated', variant: 'success' });
          that.$store.dispatch('getProfileData').then(() => {
            that.$router.push({ name: 'home', params: { persistMessage: true } });
          });
        },
        error: function(response) {
          if (response.status === 400) {
            that.errors = response.responseJSON;
          } else {
            that.errors = null;
            that.$store.commit('addMessage', { text: 'There was a problem updating your profile information, please try again', variant: 'danger' });
          }
        }
      });
    }
  }
};
</script>
