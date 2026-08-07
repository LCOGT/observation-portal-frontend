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
        this.error = null;
        this.fetch();
      }
    },
    fetch: function() {
      let that = this;
      let frameId = this.frame.id;
      this.$store
        .dispatch('fetchThumbnailsByRequestId', {
          requestId: this.frame.request_id,
          size: 'small'
        })
        .then(function(thumbnails) {
          if (that.frame && String(that.frame.id) === String(frameId)) {
            let thumbnail = that.thumbnailForFrame(thumbnails, frameId);
            if (thumbnail) {
              that.src = thumbnail.url;
            } else {
              that.generateFromService(frameId);
            }
          }
        })
        .catch(function() {
          that.generateFromService(frameId);
        });
    },
    generateFromService: function(frameId) {
      let that = this;
      if (!this.thumbnailServiceUrl) {
        that.error = 'Could not load thumbnail for this image';
        return;
      }
      let url =
        this.thumbnailServiceUrl + '/' + this.frame.id +
        '/?width=' + this.width + '&height=' + this.height + '&label=' + this.frame.filename;
      $.getJSON(url, function(data) {
        if (that.frame && String(that.frame.id) === String(frameId)) {
          that.src = data.url;
        }
      }).fail(function() {
        that.error = 'Could not load thumbnail for this image';
      });
    },
    generateLarge: function() {
      let that = this;
      let frameId = this.frame.id;
      this.loadLarge = true;
      this.$store
        .dispatch('fetchThumbnailsByRequestId', {
          requestId: this.frame.request_id,
          size: 'small'
        })
        .then(function(thumbnails) {
          let thumbnail = that.thumbnailForFrame(thumbnails, frameId);
          that.loadLarge = false;
          if (thumbnail) {
            window.open(thumbnail.url, '_blank');
          }
        });
    },
    thumbnailForFrame: function(thumbnails, frameId) {
      for (let index in thumbnails) {
        if (String(thumbnails[index].frame) === String(frameId)) {
          return thumbnails[index];
        }
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
