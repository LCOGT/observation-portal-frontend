<template>
  <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
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
            <router-link :to="{ name: 'requestDetail', params: { id: data.request } }">
              {{ data.request }}
            </router-link>
          </td>
          <td>{{ data.site }}</td>
          <td>{{ data.enclosure }}</td>
          <td>{{ data.telescope }}</td>
          <td>{{ data.start | formatDate }}</td>
          <td>{{ data.end | formatDate }}</td>
          <td>{{ data.state }}</td>
          <td>{{ data.priority }}</td>
          <td>{{ data.modified | formatDate }}</td>
          <td>{{ data.created | formatDate }}</td>
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
        <tr v-for="c_status in data.configuration_statuses" :key="c_status.id">
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
  </data-loader>
</template>
<script>
import { OCSUtil } from 'ocs-component-lib';

import DataLoader from '@/components/DataLoader.vue';
import { getDataMixin } from '@/components/util/getDataMixins.js';

export default {
  name: 'ObservationDetail',
  components: {
    DataLoader
  },
  filters: {
    formatDate(value) {
      return OCSUtil.formatDate(value);
    }
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
