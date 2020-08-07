<template>
  <b-row>
    <b-col>
      <div id="loaded-content"></div>
      <b-form @submit="submitForm">
        <b-form-group id="input-group-username" label="Username" label-for="input-username">
          <b-form-input
            id="input-username"
            v-model="formData.username"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group id="input-group-password" label="Password" label-for="input-password">
          <b-form-input
            id="input-password"
            v-model="formData.password"
            type="password"
            required
          ></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">Login</b-button>

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
      formElementSelector: '#obs-portal-log-in-form',
      formData: {
        username: '',
        password: ''
      }
    }
  },
  mounted: function() {
    // let that = this;
    // let loadedContentElement = $('#loaded-content');
    // loadedContentElement.submit(function(evt) {
    //   evt.preventDefault();
    //   that.submitForm();
    // });
    // loadedContentElement.load(this.observationPortalLoginUrl + ' ' + this.formElementSelector);
  },
  computed: {
    observationPortalLoginUrl: function() {
      return 'http://127.0.0.1:3000/accounts/login/';
      //       return this.$config.portalUrl + '/accounts/login/';

    }
  },
  methods: {
    submitForm: function(evt) {
      evt.preventDefault();
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
