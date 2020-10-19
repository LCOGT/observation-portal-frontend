<template>
  <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound"></data-loader>
</template>
<script>
import moment from 'moment';

import { datetimeFormat } from '@/utils.js';
import DataLoader from '@/components/DataLoader.vue';
import { getDataListWithCountMixin } from '@/components/util/getDataMixins.js';

export default {
  name: 'SemesterDetailCurrent',
  components: {
    DataLoader
  },
  mixins: [getDataListWithCountMixin],
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
