<template>
  <div id="form-container">
    <b-form></b-form>
  </div>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'PassthroughForm',
  props: {
    endpoint: String,
    retrievedFormElementSelector: {
      type: String,
      default: 'form'
    },
    successRedirectViewName: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      formElementSelector: 'form',
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
      return this.$store.state.urls.observationPortalApi + this.endpoint + '?passthrough=true';
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
          let updatedForm = that.readFormFromResponse(response);
          if (updatedForm.length == 1) {
            // If the form is in the response, that means there was an error logging in. Replace with
            // the new form to display it and its error messages.
            that.replaceForm(updatedForm);
          } else if (that.successRedirectViewName) {
            // Successful submission, and a redirect has been set. Navigate to the specified view name.
            let successPathname = that.$router.resolve({ name: that.successRedirectViewName});
            window.location.pathname = successPathname.href;
          } else {
              // Successful submission, and no redirect has been set. Replace the contents with the main content
              // of the response. This allows us to let the POST to the backend dictate what is displayed on the page.
              let reponseContent = $(response).find('.content-container');
              $('#form-container').replaceWith(reponseContent);
          }
        },
        error: function(response) {
          // TODO: Display an error message asking the user to try again
          console.log('there was a problem!', response)
        }
      })
    }
  }
};
</script>
