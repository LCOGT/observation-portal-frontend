<template>
  <div class="row">
    <div class="col-md-12">
      <template v-if="observationLoadError">
        <p class="text-center my-2">
          Oops, there was a problem getting your data, please try again
        </p>
      </template>
      <template v-else-if="!dataLoaded">
        <div class="text-center my-2">
          <i class="fa fa-spin fa-spinner" />
        </div>
      </template>
      <template v-else-if="dataLoaded && !observation.site">
        {{ observation.id }}
        <not-found />
      </template>
      <template v-else>
        <h1>Observation {{ id }}</h1>
        <table class="table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Site</th>
              <th>Enclosure</th>
              <th>Telescope</th>
              <th>Start</th>
              <th>End</th>
              <th>State</th>
              <th>Priority</th>
              <th>Modified</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <router-link :to="{ name: 'requestDetail', params: { id: observation.request } }">
                  {{ observation.request }}
                </router-link>
              </td>
              <td>{{ observation.site }}</td>
              <td>{{ observation.enclosure }}</td>
              <td>{{ observation.telescope }}</td>
              <td>{{ observation.start | formatDate }}</td>
              <td>{{ observation.end | formatDate }}</td>
              <td>{{ observation.state }}</td>
              <td>{{ observation.priority }}</td>
              <td>{{ observation.modified | formatDate }}</td>
              <td>{{ observation.created | formatDate }}</td>
            </tr>
          </tbody>
        </table>
        <table class="table table-striped">
          <thead>
            <tr>
              <th colspan="4" style="border-right: 2px solid black">Config Status</th>
              <th colspan="6">Summary</th>
            </tr>
            <tr>
              <th>Id</th>
              <th>Instrument</th>
              <th>Guider</th>
              <th style="border-right: 2px solid black">State</th>
              <th>State</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Time</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c_status in observation.configuration_statuses" :key="c_status.id">
              <td>{{ c_status.id }}</td>
              <td>{{ c_status.instrument_name }}</td>
              <td>{{ c_status.guide_camera_name }}</td>
              <td style="border-right: 2px solid black">{{ c_status.state }}</td>
              <template v-if="c_status.summary">
                <td>{{ c_status.summary.state }}</td>
                <td>{{ c_status.summary.start | formatDate }}</td>
                <td>{{ c_status.summary.end | formatDate }}</td>
                <td>{{ c_status.summary.reason }}</td>
                <td>{{ c_status.summary.time_completed }}</td>
                <td><a href="#" @click="openEvents(c_status.summary.events)">View</a></td>
              </template>
              <template v-else>
                <td colspan="6">No summary</td>
              </template>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>
<script>
import $ from 'jquery';

import NotFound from '@/components/NotFound.vue';
import { formatDate } from '@/utils.js';

export default {
  name: 'ObservationDetail',
  components: {
    NotFound
  },
  filters: {
    formatDate(value) {
      return formatDate(value);
    }
  },
  data: function() {
    return {
      id: this.$route.params.id,
      observation: {},
      observationLoadError: false,
      dataLoaded: false
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  created: function() {
    this.getObservation();
  },
  methods: {
    getObservation: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/observations/' + this.id
      })
        .done(function(response) {
          that.observation = response;
        })
        .fail(function(response) {
          if (response.status !== 404) {
            that.observationLoadError = true;
          }
        })
        .always(function() {
          that.dataLoaded = true;
        });
    },
    openEvents: function(events_text) {
      var y = window.top.outerHeight / 2 + window.top.screenY - 300;
      var x = window.top.outerWidth / 2 + window.top.screenX - 300;
      var newWin = open(
        '',
        'Events',
        'scrollbars=yes, toolbar=no, location=no, menubar=no, width=' + 600 + ', height=' + 600 + ', top=' + y + ', left=' + x
      );
      newWin.document.write('<pre>' + JSON.stringify(events_text, null, 2) + '</pre>');
    }
  }
};
</script>
