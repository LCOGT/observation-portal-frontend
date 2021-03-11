<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
    <sci-application-detail-template :sci-app="data"></sci-application-detail-template>
  </ocs-data-loader>
</template>
<script>
import { OCSMixin } from 'ocs-component-lib';

import SciApplicationDetailTemplate from '@/components/SciApplicationDetailTemplate.vue';
import NotFound from '@/components/NotFound.vue';

export default {
  components: {
    SciApplicationDetailTemplate,
    NotFound
  },
  mixins: [OCSMixin.getDataMixin],
  props: {
    sciAppId: {
      type: [String, Number],
      required: true
    }
  },
  watch: {
    dataNotFound: function(value) {
      if (value) {
        this.$store.commit('addMessage', { text: 'Science application not found.', variant: 'warning' });
        this.$router.push({ name: 'apply', params: { persistMessage: true } });
      }
    },
    dataLoadError: function(value) {
      if (value) {
        this.$store.commit('addMessage', {
          text: 'Failed to load science application. Please try again.',
          variant: 'warning'
        });
        this.$router.push({ name: 'apply', params: { persistMessage: true } });
      }
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/scienceapplications/' + this.sciAppId + '/';
    }
  }
};
</script>
