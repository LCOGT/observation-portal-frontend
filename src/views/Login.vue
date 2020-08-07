<template>
  <b-row>
    <b-col>
      <div id="loaded-content"></div>
      <!-- TODO: Translate this -->
      <p>Forgot your password?<router-link :to="{name: 'passwordReset'}">Reset it</router-link>.</p>
      <!-- TODO: Translate this -->
      <p>Not a member?<router-link :to="{name: 'register'}">Register</router-link>.</p>
      <p>Use of any LCO facilities and/or data implies acceptance of the <a href="https://lco.global/observatory/termsofservice/"> Terms of Service</a></p>.
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'Login',
  data: function() {
    return {
      formElementSelector: '#obs-portal-log-in-form'
    }
  },
  mounted: function() {
    let that = this;
    let loadedContentElement = $('#loaded-content');
    loadedContentElement.submit(function(evt) {
      evt.preventDefault();
      that.submitForm();
    });
    loadedContentElement.load(this.observationPortalLoginUrl + ' ' + this.formElementSelector);
  },
  computed: {
    observationPortalLoginUrl: function() {
      return this.observationPortalApiUrl + '/accounts/login/';
    }
  },
  methods: {
    submitForm: function() {
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalLoginUrl,
        data: $(this.formElementSelector).serialize(),
        success: function(data) {
          // If the form is in the response, that means there was an error logging in. Replace with
          // the new form to display error messages.
          let updatedForm = $(data).find(that.formElementSelector);
          if (updatedForm.length == 1) {
            $(that.formElementSelector).replaceWith(updatedForm);
          } else {
            // Successful log in
            let homePath = that.$router.resolve({ name: 'home'});
            window.location.pathname = homePath.href;
          }
        },
        error: function(data) {
          // TODO: Display an error message asking the user to try again
          console.log('there was a problem logging in!', data)
        }
      })
    }
  }
}
</script>
