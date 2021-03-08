<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
  </ocs-data-loader>
</template>
<script>
import moment from 'moment';
import { OCSMixin } from 'ocs-component-lib';

import { datetimeFormat } from '@/utils.js';
import NotFound from '@/components/NotFound.vue';

export default {
  name: 'SemesterDetailCurrent',
  components: {
    NotFound
  },
  mixins: [OCSMixin.getDataListWithCountMixin],
  methods: {
    initializeDataEndpoint: function() {
      let datetimeNow = moment.utc().format(datetimeFormat);
      return '/api/semesters/?semester_contains=' + datetimeNow;
    },
    initializeSetNotFoundOnEmptyList: function() {
      return true;
    },
    onSuccessfulRetrieval: function(response) {
      this.$router.replace({ name: 'semesterDetail', params: { id: response.results[0].id } });
    }
  }
};
</script>
