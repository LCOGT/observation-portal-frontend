<template>
  <div>
    <a v-if="asLink" :class="linkClasses" @click="performGet">{{ linkText }}</a>
    <div v-else id="passthrough-container" />
  </div>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'PassthroughGet',
  props: {
    endpoint: {
      type: String,
      required: true
    },
    successRedirectViewName: {
      type: String,
      default: ''
    },
    successRedirectPath: {
      type: String,
      default: ''
    },
    asLink: {
      type: Boolean,
      default: false
    },
    linkText: {
      type: String,
      default: ''
    },
    linkClasses: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: 'There was a problem with your request.'
    }
  },
  computed: {
    url: function() {
      let endpoint = this.endpoint.endsWith('/') ? this.endpoint : this.endpoint + '/';
      return this.$store.state.urls.observationPortalApi + endpoint + '?passthrough=true';
    }
  },
  mounted: function() {
    if (!this.asLink) {
      this.performGet();
    }
  },
  methods: {
    addMessage: function(text, variant) {
      this.$store.commit('addMessage', { text: text, variant: variant, namespace: 'passthrough-get' });
    },
    clearMessages: function() {
      this.$store.commit('clearNamespacedMessages', 'passthrough-get');
    },
    performGet: function() {
      this.clearMessages();
      let that = this;
      $.ajax({
        method: 'GET',
        url: this.url,
        success: function(response) {
          if (that.successRedirectViewName) {
            // Successful submission, and a redirect has been set. Navigate to the specified view name.
            let successPathname = that.$router.resolve({ name: that.successRedirectViewName });
            window.location.pathname = successPathname.href;
          } else if (that.successRedirectPath) {
            // Successful submission, and a redirect path has been set. Navigate to the specified path.
            window.location = that.successRedirectPath;
          } else {
            // Successful submission, and no redirect has been set. Replace the contents with
            // the main content of the response.
            let reponseContent = $(response).find('.content-container');
            $('#passthrough-container').replaceWith(reponseContent);
          }
        },
        error: function(response) {
          if (!that.asLink && response.status === 404) {
            that.$router.replace({ name: 'notFound' });
          }
          that.addMessage(that.errorMessage, 'danger');
        }
      });
    }
  }
};
</script>
