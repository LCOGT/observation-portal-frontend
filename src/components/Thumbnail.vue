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
      let frameId = this.frame.id;
      let thumbnail = this.thumbnailFromFrame(this.frame, 'small');
      if (thumbnail) {
        this.src = thumbnail.url;
      } else {
        // The archive has no pre-generated thumbnail for this frame, so fall
        // back to the thumbnail service to generate one on demand.
        this.generateFromService(frameId);
      }
    },
    generateFromService: function(frameId) {
      let that = this;
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
      this.loadLarge = true;
      let url = this.thumbnailServiceUrl + '/' + this.frame.id + '/?width=4000&height=4000';
      $.getJSON(url, function(data) {
        that.loadLarge = false;
        window.open(data.url, '_blank');
      }).fail(function() {
        that.loadLarge = false;
      });
    },
    thumbnailFromFrame: function(frame, size) {
      // the purpose of using include_thumbnails=true is so that the archive attaches any pre-generated thumbnails to each frame :D
      if (!frame.thumbnails) {
        return null;
      }
      return frame.thumbnails.find(function(thumbnail) {
        // Thumbnail objects have no size field; the size is in the basename (e.g. "...-small_thumbnail").
        return thumbnail.basename && thumbnail.basename.includes(size + '_thumbnail');
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
