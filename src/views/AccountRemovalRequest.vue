<template>
  <b-col>
    <h2>Account removal request</h2>
    <p>Please let us know why you would like your account removed.</p>
    <b-form @submit="submitRemovalRequest">
      <b-form-group>
        <b-form-textarea id="textarea" v-model="formData.reason" placeholder="Enter the reason for your request" :state="error.state" required />
        <b-form-invalid-feedback id="input-reason-state">
          <span v-for="msg in error.messages" :key="msg">{{ msg }}</span>
        </b-form-invalid-feedback>
      </b-form-group>
      <b-button type="submit" variant="info">
        Submit request
      </b-button>
    </b-form>
  </b-col>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'AccountRemovalRequest',
  data: function() {
    return {
      formData: {
        reason: ''
      },
      error: {
        state: null,
        messages: []
      }
    };
  },
  computed: {
    url: function() {
      return this.$store.state.urls.observationPortalApi + '/api/account_removal_request/';
    }
  },
  methods: {
    submitRemovalRequest: function(evt) {
      evt.preventDefault();
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.url,
        data: this.formData,
        success: function() {
          that.$store.commit('clearAllMessages');
          that.$store.commit('addMessage', { text: 'Account removal request successfully submitted', variant: 'success' });
          that.$router.push({ name: 'profile', params: { persistMessage: true } });
        },
        error: function(response) {
          if (response.status === 400) {
            that.error = { state: false, messages: response.responseJSON.reason };
          } else {
            that.$store.commit('addMessage', { text: 'Account removal request submission was not successful, please try again', variant: 'danger' });
          }
        }
      });
    }
  }
};
</script>
