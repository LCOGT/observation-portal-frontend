<template>
  <b-container v-show="resultCount > 0">
    <h3>
      <i class="fas fa-info fa-2x fa-border fa-pull-left" />
      <a :href="guiLink" target="_blank">
        {{ resultCount }}
      </a>
      existing frames that you have access to have been found on the LCO science archive covering this RA/Dec.
    </h3>
  </b-container>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

export default {
  props: {
    ra: {
      type: [String, Number],
      required: true
    },
    dec: {
      type: [String, Number],
      required: true
    }
  },
  data: function() {
    return {
      resultCount: 0
    };
  },
  computed: {
    guiLink: function() {
      return this.$store.state.urls.archiveClient + '/?OBSTYPE=EXPOSE&start=2014-05-01&covers=POINT(' + this.ra + ' ' + this.dec + ')';
    },
    archiveApiUrl: function() {
      return this.$store.state.urls.archiveApi;
    }
  },
  watch: {
    ra: function(val) {
      if (val && this.dec) {
        this.setResultCount();
      }
    },
    dec: function(val) {
      if (val && this.ra) {
        this.setResultCount();
      }
    }
  },
  mounted: function() {
    this.setResultCount();
  },
  methods: {
    setResultCount: _.debounce(function() {
      let that = this;
      $.getJSON(this.archiveApiUrl + '/frames/?configuration_type=EXPOSE&covers=POINT(' + that.ra + ' ' + that.dec + ')', function(data) {
        that.resultCount = data.count;
      });
    }, 500)
  }
};
</script>
