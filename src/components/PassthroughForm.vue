<template>
  <div id="passthrough-content">
    <div id="form-help-text-container">
      <p></p>
    </div>
    <div id="form-container">
      <b-form />
      <slot />
    </div>
  </div>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'PassthroughForm',
  props: {
    endpoint: {
      type: String,
      required: true
    },
    retrievedFormElementSelector: {
      type: String,
      default: 'form',
      help: 'The selector for the form element to extract from the retrieved HTML'
    },
    retrievedHelpTextElementSelector: {
      type: String,
      default: 'p',
      help: 'The selector for the paragraph element with help text to extract from the retrieved HTML'
    },
    successRedirectViewName: {
      type: String,
      default: ''
    },
    successRedirectPath: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      formElementSelector: 'form',
      formHelpTextSelector: '#form-help-text-container p'
    };
  },
  computed: {
    url: function() {
      let endpoint = this.endpoint.endsWith('/') ? this.endpoint : this.endpoint + '/';
      // make sure we include any URL params, too.
      let url = this.$store.state.urls.observationPortalApi + endpoint;
      // Django backend handles the next query param on the login view, but it has no knowledge
      // of the frontend url we are actually redirecting to so it fails. We want to keep the next
      // param handling for login purely on the frontend.
      if (!this.endpoint.includes('login')) {
        let params = this.$route.query;
        params.passthrough = true;
        return url + '?' + new URLSearchParams(params).toString();
      }
      return url;
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
  methods: {
    replaceElements(formElement, helpTextElement) {
      $(this.formElementSelector).replaceWith(formElement);
      $(this.formHelpTextSelector).replaceWith(helpTextElement);
    },
    readFormFromResponse(response) {
      return $(response).find(this.retrievedFormElementSelector);
    },
    readHelpTextFromResponse(response) {
      // Only extract any help text. These are elements that do not have any children and whose parent is not a form.
      return $(response)
        .find(this.retrievedHelpTextElementSelector)
        .filter(function(i, element) {
          let hasNoChildren = $(element).children().length == 0;
          let parentIsNotAForm = $(element).parents('form').length == 0;
          return hasNoChildren && parentIsNotAForm;
        });
    },
    getInitialForm: function() {
      let that = this;
      $.ajax({
        method: 'GET',
        url: this.url,
        success: function(response) {
          let form = that.readFormFromResponse(response);
          let helpText = that.readHelpTextFromResponse(response);
          that.replaceElements(form, helpText);
        }
      });
    },
    submitForm: function() {
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.url,
        data: $(this.formElementSelector).serialize(),
        success: function(response) {
          let updatedForm = that.readFormFromResponse(response);
          let updatedHelpText = that.readHelpTextFromResponse(response);
          if (updatedForm.length == 1) {
            that.$emit("formUpdated", updatedForm);

            // If the form is in the response, that means there was an error logging in. Replace with
            // the new form to display it and its error messages.
            that.replaceElements(updatedForm, updatedHelpText);
          } else if (that.successRedirectViewName) {
            // Successful submission, and a redirect has been set. Navigate to the specified view name.
            let successPathname = that.$router.resolve({ name: that.successRedirectViewName });
            window.location = successPathname.href;
          } else if (that.successRedirectPath) {
            // Successful submission, and a redirect has been set using a path. Navigate to the path.
            window.location = that.successRedirectPath;
          } else {
            // Successful submission, and no redirect has been set. Replace the contents with the main content
            // of the response, if there is anything to show.
            let reponseContent = $(response).find('div, p');
            $('#passthrough-content').replaceWith(reponseContent);
          }
        },
        error: function(response) {
          // TODO: Display an error message asking the user to try again
          console.log('there was a problem!', response);
        }
      });
    }
  }
};
</script>
