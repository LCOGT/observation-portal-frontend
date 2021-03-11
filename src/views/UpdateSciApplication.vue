<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
    <edit-sci-application v-if="data.call" :call-id="data.call.id" :initial-sci-app="data"> </edit-sci-application>
  </ocs-data-loader>
</template>
<script>
import { OCSMixin } from 'ocs-component-lib';

import EditSciApplication from '@/components/EditSciApplication.vue';
import NotFound from '@/components/NotFound.vue';

export default {
  name: 'UpdateSciApplication',
  components: {
    EditSciApplication,
    NotFound
  },
  mixins: [OCSMixin.getDataMixin],
  props: {
    sciAppId: {
      type: [String, Number],
      required: true
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/scienceapplications/' + this.sciAppId + '/?status=DRAFT';
    }
  }
};
</script>
