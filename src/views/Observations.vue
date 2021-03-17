<template>
  <ocs-observations-table 
    :observationPortalApiBaseUrl="observationPortalApiUrl"
    :observationDetailLink="generateObservationLink"
    :requestgroupLink="generateRequestgroupLink"
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
    generateRequestgroupLink: function(requestgroupId) {
      return { to: { name: 'requestgroupDetail', params: { id: requestgroupId } } };
    }
  }
};
</script>
