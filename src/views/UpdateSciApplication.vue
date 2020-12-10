<template>
  <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <edit-sci-application v-if="data.call" :call-id="data.call.id" :initial-sci-app="data"> </edit-sci-application>
  </data-loader>
</template>
<script>
import { getDataMixin } from '@/components/util/getDataMixins.js';
import DataLoader from '@/components/DataLoader.vue';
import EditSciApplication from '@/components/EditSciApplication.vue';

export default {
  name: 'UpdateSciApplication',
  components: {
    DataLoader,
    EditSciApplication
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
      return '/api/scienceapplications/' + this.sciAppId + '/?status=DRAFT';
    }
  }
};
</script>
