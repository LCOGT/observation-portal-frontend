<template>
  <b-row>
    <b-col>
      <template v-if="dataLoadError">
        <p class="text-center my-2">
          Oops, there was a problem getting the current semester, please try again
        </p>
      </template>
      <template v-else-if="!dataLoaded">
        <div class="text-center my-2">
          <i class="fa fa-spin fa-spinner" />
        </div>
      </template>
      <template v-else-if="dataLoaded && dataNotFound">
        <not-found />
      </template>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';
import moment from 'moment';

import { datetimeFormat } from '@/utils.js';

export default {
  name: 'SemesterDetailCurrent',
  data: function() {
    return {
      dataLoadError: false,
      dataLoaded: false,
      dataNotFound: false
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  created: function() {
    this.getCurrentSemester();
  },
  methods: {
    getCurrentSemester: function() {
      let datetimeNow = moment.utc().format(datetimeFormat);
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/semesters/?semester_contains=' + datetimeNow
      })
        .done(function(response) {
          if (response.results.length > 0) {
            that.$router.replace({ name: 'semesterDetail', params: { id: response.results[0].id } });
          } else {
            that.dataNotFound = true;
          }
        })
        .fail(function() {
          that.dataLoadError = true;
        })
        .always(function() {
          that.dataLoaded = true;
        });
    }
  }
};
</script>
