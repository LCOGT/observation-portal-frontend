<template>
  <b-row class="requestgroup" :class="request.state | stateToBsClass('requestgroup')">
    <b-col md="10">
      <b-row>
        <b-col md="4" class="requestgroup-block border-right">
          <router-link v-if="link" class="requestgroup-title" :to="{ name: 'requestDetail', params: { id: request.id } }"
            ># {{ request.id }}</router-link
          >
          <span v-else class="requestgroup-title"># {{ request.id }}</span>
          <p>
            <i class="far fa-clock"></i>
            <span title="Total exposure time + observing overhead">Duration: {{ request.duration }} seconds</span>
          </p>
          <p>
            <i class="fa fa-camera"></i>
            Instrument: {{ instrumentName }}
          </p>
        </b-col>
        <b-col md="4" class="requestgroup-block border-right">
          <p>
            <span :class="request.state | stateToBsClass('text')">
              <i :class="request.state | stateToIcon"></i>
              {{ request.state }}
            </span>
          </p>
          <p>
            <i class="fa fa-clipboard-check"></i>
            Acceptability Threshold: {{ request.acceptability_threshold }}%
          </p>
          <p>
            <i class="fa fa-calendar"></i>
            {{ request.modified | formatDate }}
          </p>
        </b-col>
        <b-col md="4" class="requestgroup-block">
          <br />
          <b-row class="margin-top-md border-right mx-auto">
            <div>
              <div class="btn-group mr-2" role="group" aria-label="button group">
                <a :href="requestApiUrl" class="btn btn-outline-secondary btn-sm"> <i class="fa fa-fw fa-code"></i> View in API </a>
                <button
                  v-if="request.state === 'COMPLETED'"
                  class="btn btn-outline-secondary btn-sm"
                  type="button"
                  @click="downloadAllData"
                  :disabled="!archiveDataIsAvailable"
                >
                  <i class="fa fa-fw fa-download"></i> Download
                </button>
              </div>
            </div>
          </b-row>
        </b-col>
      </b-row>
    </b-col>
    <b-col md="2" class="text-center">
      <template v-if="request.state == 'COMPLETED'">
        <b-img v-if="thumbnailUrl" :src="thumbnailUrl" fluid :alt="frame.filename" :title="frame.filename"></b-img>
        <div v-else-if="thumbnailError">{{ thumbnailError }}</div>
        <div v-else-if="archiveError">{{ archiveError }}</div>
        <i v-else class="fa fa-spinner fa-spin"></i>
      </template>
      <template v-else-if="request.state == 'PENDING'">
        <div>
          <template v-if="schedulingInformation.found">
            <div>
              <strong>{{ schedulingInformation.site }}</strong>
              <br />
              {{ schedulingInformation.start | formatDate }} to
              {{ schedulingInformation.end | formatDate }}
            </div>
          </template>
          <div v-else-if="schedulingInformation.error">
            {{ schedulingInformation.error }}
          </div>
          <i v-else class="fa fa-spinner fa-spin"></i>
        </div>
      </template>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { stateToBsClass, stateToIcon, formatDate } from '@/utils.js';
import { downloadAll } from '@/archive.js';

export default {
  name: 'RequestRow',
  props: {
    request: {
      type: Object,
    },
    instruments: {
      type: Object,
    },
    link: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      thumbnailUrl: '',
      thumbnailError: '',
      archiveError: '',
      frame: {},
      schedulingInformation: {
        found: false,
        error: '',
      },
    };
  },
  filters: {
    stateToBsClass: function (state, prefix) {
      return stateToBsClass(state, prefix);
    },
    stateToIcon: function (state) {
      return stateToIcon(state);
    },
    formatDate(value) {
      return formatDate(value);
    },
  },
  computed: {
    userIsAuthenticated: function () {
      return this.$store.state.userIsAuthenticated;
    },
    observationPortalApiUrl: function () {
      return this.$store.state.urls.observationPortalApi;
    },
    archiveApiUrl: function () {
      return this.$store.state.urls.archiveApi;
    },
    thumbnailServiceUrl: function () {
      return this.$store.state.urls.thumbnailService;
    },
    archiveClientUrl: function () {
      return this.$store.state.urls.archiveClient;
    },
    archiveToken: function () {
      return this.$store.state.archiveToken;
    },
    requestApiUrl: function () {
      return this.$store.state.urls.observationPortalApi + '/api/requests/' + this.request.id + '/';
    },
    instrumentName: function () {
      let instrumentType = _.get(this.request, ['configurations', 0, 'instrument_type']);
      if (instrumentType && instrumentType in this.instruments) {
        return this.instruments[instrumentType].name;
      } else {
        return instrumentType;
      }
    },
    archiveDataIsAvailable: function () {
      return this.frame.id ? true : false;
    },
  },
  created: function () {
    let that = this;
    this.$store.dispatch('getArchiveToken').then(() => {
      that.loadThumbnail();
    });
    if (this.request.state === 'PENDING') {
      this.getPendingDetails();
    }
  },
  methods: {
    downloadAllData: function () {
      downloadAll(this.request.id, this.archiveApiUrl, this.archiveClientUrl, this.archiveToken);
    },
    loadThumbnail: function () {
      const thumbnailSize = 75;
      let that = this;
      $.ajax({
        method: 'GET',
        dataType: 'json',
        url: this.archiveApiUrl + '/frames/?ordering=-id&limit=1&REQNUM=' + this.request.id,
        success: function (response) {
          if (response.results.length === 0) {
            that.archiveError = 'Waiting on data to become available';
          } else {
            that.frame = response.results[0];
            $.ajax({
              url: that.thumbnailServiceUrl + '/' + that.frame.id + '/?height=' + thumbnailSize,
              dataType: 'json',
              success: function (response) {
                that.thumbnailUrl = response.url;
              },
              error: function () {
                that.thumbnailError = 'Could not load thumbnail for this file';
              },
            });
          }
        },
      });
    },
    getPendingDetails: function () {
      let that = this;
      $.getJSON(this.observationPortalApiUrl + '/api/requests/' + this.request.id + '/observations/?exclude_canceled=true', function (data) {
        if (data.length > 0) {
          data = data.reverse(); // get the latest non canceled block
          that.schedulingInformation = {
            found: true,
            site: data[0].site,
            start: data[0].start,
            end: data[0].end,
          };
        } else {
          that.schedulingInformation = {
            found: false,
            error: 'No scheduling information found',
          };
        }
      });
    },
  },
};
</script>
