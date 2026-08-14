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
      validator: function(value) {
        return value === null || typeof value === 'object';
      },
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
    hasLargeThumbnail: function() {
      const thumbnails = this.frame && Array.isArray(this.frame.thumbnails) ? this.frame.thumbnails : [];
      return thumbnails.some(t => t.size === 'large' && t.url);
    },
    largeUrl: function() {
      if (!this.frame) {
        return null;
      }

      const thumbnails = Array.isArray(this.frame.thumbnails) ? this.frame.thumbnails : [];
      const largeThumbnail = thumbnails.find(t => t.size === 'large' && t.url);
      if (largeThumbnail) {
        return largeThumbnail.url;
      }

      return this.thumbnailServiceUrl + '/' + this.frame.id + '/?width=4000&height=4000';
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
      const frame = that.frame;
      const thumbnails = Array.isArray(frame.thumbnails) ? frame.thumbnails : [];
      if (thumbnails.length > 0) {
        const smallThumbnail = thumbnails.find(t => t.size === 'small');
        if (smallThumbnail && smallThumbnail.url) {
          that.src = smallThumbnail.url;
          return;
        }
      }

      $.getJSON(this.url, function(data) {
        that.src = data.url;
      }).fail(function() {
        that.error = 'Could not load thumbnail for this image';
      });
    },
    generateLarge: function() {
      let that = this;
      if (!this.largeUrl) {
        return;
      }

      if (this.hasLargeThumbnail) {
        window.open(this.largeUrl, '_blank');
      } else {
        this.loadLarge = true;
        $.getJSON(this.largeUrl, function(data) {
          that.loadLarge = false;
          window.open(data.url, '_blank');
        }).fail(function() {
          that.loadLarge = false;
          that.error = 'Could not generate large thumbnail for this image';
        });
      }
    }
  }
};
</script>
<style>
.thumbnail {
  cursor: pointer;
}
</style>
