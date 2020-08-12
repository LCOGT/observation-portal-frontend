<template>
  <div>
    <a v-if="asLink" @click="performGet" :class="linkClasses">{{ linkText }}</a>
    <div v-else id="passthrough-container">
  </div>
</div>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'PassthroughGet',
  props: {
    endpoint: String,
    successRedirectViewName: {
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
    }
  },
  mounted: function() {
    if (!this.asLink) {
      this.performGet();
    }
  },
  computed: {
    url: function() {
      return this.$store.state.urls.observationPortalApi + this.endpoint + '?passthrough=true';
    }
  },
  methods: {
    performGet: function() {
      let that = this;
      $.ajax({
        method: 'GET',
        url: this.url,
        success: function(response) {
          if (that.successRedirectViewName) {
            // Successful submission, and a redirect has been set. Navigate to the specified view name.
            let successPathname = that.$router.resolve({ name: that.successRedirectViewName});
            window.location.pathname = successPathname.href;
          } else {
            // Successful submission, and no redirect has been set. Replace the contents with the main content
            // of the response. This allows us to let the GET to the backend dictate what is displayed on the page
            // on success.
            let reponseContent = $(response).find('.content-container');
            $('#passthrough-container').replaceWith(reponseContent);
          }
        },
        error: function(response) {
          if (!that.asLink && response.status === 404) {
            that.$router.replace({name: 'notFound'});
          }
          console.log('there was an error');
        }
      })
    }
  }
};
</script>
