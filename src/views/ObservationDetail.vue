<template>
  <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <h1>Observation {{ id }}</h1>
    <ocs-observation-detail
      :observation="data"
      :request-link="{ to: { name: 'requestDetail', params: { id: data.request } } }"
    ></ocs-observation-detail>
  </data-loader>
</template>
<script>
import DataLoader from '@/components/DataLoader.vue';
import { getDataMixin } from '@/components/util/getDataMixins.js';

export default {
  name: 'ObservationDetail',
  components: {
    DataLoader
  },
  mixins: [getDataMixin],
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/observations/' + this.id + '/';
    }
  }
};
</script>
