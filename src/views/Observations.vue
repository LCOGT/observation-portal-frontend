<template>
  <ocs-observations-table
    :observation-portal-api-base-url="observationPortalApiUrl"
    :observation-detail-link="generateObservationLink"
    :request-link="generateRequestLink"
    @onSuccessfulDataRetrieval="clearErrors"
    @onErrorRetrievingData="setErrorsOnFailedAJAXCall"
  />
</template>
<script>
import { clearAndSetErrorsMixin } from '@/components/util/utilMixins.js';
export default {
  name: 'ObservationsList',
  mixins: [clearAndSetErrorsMixin],
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  methods: {
    generateObservationLink: function(observationId) {
      return { to: { name: 'observationDetail', params: { id: observationId } } };
    },
    generateRequestLink: function(requestId) {
      return { to: { name: 'requestDetail', params: { id: requestId } } };
    }
  }
};
</script>
