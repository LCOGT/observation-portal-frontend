<template>
  <b-row>
    <b-col id="form-content">
      <div id="form-alert"></div>
      <b-form id="obs-portal-log-in-form">
        <b-form-group id="input-group-login-username" label="Username" label-for="input-login-username">
          <b-form-input
            id="input-login-username"
            v-model="formData.username"
            name="username"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-login-password" label="Password" label-for="input-login-password">
          <b-form-input
            id="input-login-password"
            v-model="formData.password"
            name="password"
            type="password"
            required
          ></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Log in</b-button>
      </b-form>
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
      formData: {
        username: '',
        password: ''
      },
      // Both the element ID of this form and the ID of the form that is returned
      // from the login procedure when there are errors
      formElementSelector: '#obs-portal-log-in-form'
    }
  },
  mounted: function() {
    let that = this;
    $('#form-content').submit(function(evt) {
      evt.preventDefault();
      that.submitForm();
    });
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
