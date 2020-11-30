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
  methods: {
    initializeDataEndpoint: function() {
      return '/api/scienceapplications/' + this.sciAppId + '/';
    }
  }
};
</script>
