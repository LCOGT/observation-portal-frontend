<template>
  <div class="thumbnail-container">
    <span v-if="error" class="error">
      {{ error }}
    </span>
    <i v-show="!src && !error" class="fa fa-spinner fa-spin" />
    <img v-show="src" class="thumbnail img-fluid img-thumbnail" :src="src" @click="generateLarge" />
    <span v-show="loadLarge"><i class="fa fa-spin fa-spinner" /> Generating high resolution image...</span>
  </div>
</template>
<script>
import $ from 'jquery';

export default {
  props: {
    frame: {
      type: Object,
      default: function() {
        return null;
      }
    },
    width: {
      type: [Number, String],
      default: 200
    },
    height: {
      type: [Number, String],
      default: 200
    }
  },
  data: function() {
    return {
      src: '',
      error: null,
      loadLarge: false
    };
  },
  computed: {
    thumbnailServiceUrl: function() {
      return this.$store.state.urls.thumbnailService;
    },
    url: function() {
      return this.thumbnailServiceUrl + '/' + this.frame.id + '/?width=' + this.width + '&height=' + this.height + '&label=' + this.frame.filename;
    },
    largeUrl: function() {
      if (this.frame) {
        return this.thumbnailServiceUrl + '/' + this.frame.id + '/?width=4000&height=4000';
      } else {
        return '';
      }
    }
  },
  watch: {
    frame: function() {
      this.updateFrame();
    }
  },
  created: function() {
    this.updateFrame();
  },
  methods: {
    updateFrame: function() {
      if (this.frame) {
        this.src = '';
        this.fetch();
      }
    },
    fetch: function() {
      let that = this;
      $.getJSON(this.url, function(data) {
        that.src = data.url;
      }).fail(function() {
        that.error = 'Could not load thumbnail for this image';
      });
    },
    generateLarge: function() {
      let that = this;
      this.loadLarge = true;
      $.getJSON(this.largeUrl, function(data) {
        that.loadLarge = false;
        window.open(data['url'], '_blank');
      });
    }
  }
};
</script>
<style>
.thumbnail {
  cursor: pointer;
}
</style>
