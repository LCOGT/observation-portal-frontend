<template>
  <b-row>
    <b-col id="form-container">
      <b-form></b-form>
      <br/>
      <!-- TODO: Translate this -->
      <p>Forgot your password?<router-link :to="{name: 'passwordReset'}"> Reset it</router-link>.</p>
      <!-- TODO: Translate this -->
      <p>Not a member?<router-link :to="{name: 'register'}"> Register</router-link>.</p>
      <p>Use of any LCO facilities and/or data implies acceptance of the <a href="https://lco.global/observatory/termsofservice/"> Terms of Service</a>.</p>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'Login',
  data: function() {
    return {
      formElementSelector: 'form',
      retrievedFormElementSelector: '#obs-portal-log-in-form',
      endpoint: '/accounts/login/?passthrough=true',
      successRedirectViewName: 'home'
    }
  },
  mounted: function() {
    let that = this;
    $('#form-container').submit(function(evt) {
      evt.preventDefault();
      that.submitForm();
    });
    this.getInitialForm();
  },
  computed: {
    url: function() {
      return this.observationPortalApiUrl + this.endpoint;
    }
  },
  methods: {
    replaceForm(form) {
      $(this.formElementSelector).replaceWith(form);
    },
    readFormFromResponse(response) {
      return $(response).find(this.retrievedFormElementSelector);
    },
    getInitialForm: function() {
      let that = this;
      $.ajax({
        method: 'GET',
        url: this.url,
        success: function(response) {
          let form = that.readFormFromResponse(response);
          that.replaceForm(form);
        }
      })
    },
    submitForm: function() {
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.url,
        data: $(this.formElementSelector).serialize(),
        success: function(response) {
          // If the form is in the response, that means there was an error logging in. Replace with
          // the new form to display error messages.
          let updatedForm = that.readFormFromResponse(response);
          if (updatedForm.length == 1) {
            that.replaceForm(updatedForm);
          } else {
            // Successful log in
            let successPathname = that.$router.resolve({ name: that.successRedirectViewName});
            window.location.pathname = successPathname.href;
          }
        },
        error: function(response) {
          // TODO: Display an error message asking the user to try again
          console.log('there was a problem!', response)
        }
      })
    }
  }
}
</script>
