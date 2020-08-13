<template>
  <b-col>
    <h2>Account removal request</h2>
    <p>Please let us know why you would like your account removed.</p>
    <b-form @submit="submitRemovalRequest">
      <b-form-group>
        <b-form-textarea
          id="textarea"
          v-model="formData.reason"
          placeholder="Enter the reason for your request"
          required
        ></b-form-textarea>
      </b-form-group>
      <b-button type="submit" class="variant-info">Submit request</b-button>
    </b-form>
  </b-col>
</template>
<script>
import $ from 'jquery';

export default {
  name: "AccountRemovalRequest",
  data: function() {
    return {
      formData: {
        reason: ''
      }
    }
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
          // TODO: Add success message
          let homePath = that.$router.resolve({ name: "profile" });
          window.location.pathname = homePath.href;
        },
        error: function() {
          // TODO: Add error message
        }
      })
    }
  }
}
</script>
