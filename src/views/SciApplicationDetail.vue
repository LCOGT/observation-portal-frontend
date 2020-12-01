<template>
  <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <sci-application-detail-template :sci-app="data"></sci-application-detail-template>
  </data-loader>
</template>
<script>
import DataLoader from '@/components/DataLoader.vue';
import SciApplicationDetailTemplate from '@/components/SciApplicationDetailTemplate.vue';
import { getDataMixin } from '@/components/util/getDataMixins.js';

export default {
  components: {
    DataLoader,
    SciApplicationDetailTemplate
  },
  mixins: [getDataMixin],
  props: {
    sciAppId: {
      type: [String, Number],
      required: true
    }
  },
  watch: {
    dataNotFound: function(value) {
      if (value) {
        this.$store.commit('addMessage', { text: 'science application not found.', variant: 'warning' });
        this.$router.push({ name: 'apply', params: { persistMessage: true } });
      }
    },
    dataLoadError: function(value) {
      if (value) {
        this.$store.commit('addMessage', {
          text: 'failed to load science application. Please try again.',
          variant: 'warning'
        });
        this.$router.push({ name: 'apply', params: { persistMessage: true } });
      }
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/scienceapplications/' + this.sciAppId + '/';
    }
  }
};
</script>
