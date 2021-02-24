<template>
  <b-row class="m-0 border position-relative">
    <div class="state-color-marker" :class="request.state | stateToBsClass('bg')"></div>
    <b-col md="10">
      <b-row>
        <b-col md="4" class="requestgroup-block border-right">
          <router-link v-if="link" class="requestgroup-title" :to="{ name: 'requestDetail', params: { id: request.id } }">
            # {{ request.id }}
          </router-link>
          <span v-else class="requestgroup-title"># {{ request.id }}</span>
          <p>
            <i class="far fa-clock" />
            <span title="Total exposure time + observing overhead">Duration: {{ request.duration }} seconds</span>
          </p>
          <p>
            <i class="fa fa-camera" />
            Instrument: {{ instrumentName }}
          </p>
        </b-col>
        <b-col md="4" class="requestgroup-block border-right">
          <p>
            <span :class="request.state | stateToBsClass('text')">
              <i :class="request.state | stateToIcon" />
              {{ request.state }}
            </span>
          </p>
          <p>
            <i class="fa fa-clipboard-check" />
            Acceptability Threshold: {{ request.acceptability_threshold }}%
          </p>
          <p>
            <i class="fa fa-calendar" />
            {{ request.modified | formatDate }}
          </p>
        </b-col>
        <b-col md="4" class="requestgroup-block my-auto">
          <b-row class="border-right mx-auto">
            <div>
              <div class="btn-group mr-2" role="group" aria-label="button group">
                <a :href="requestApiUrl" class="btn btn-outline-secondary"> <i class="fa fa-fw fa-code" /> View in API </a>
                <button
                  v-if="request.state === 'COMPLETED'"
                  class="btn btn-outline-secondary"
                  type="button"
                  :disabled="!archiveDataIsAvailable"
                  @click="downloadAllData"
                >
                  <i class="fa fa-fw fa-download" /> Download
                </button>
              </div>
            </div>
          </b-row>
        </b-col>
      </b-row>
    </b-col>
    <b-col md="2" class="text-center my-auto">
      <template v-if="request.state == 'COMPLETED'">
        <b-img v-if="thumbnailUrl" :src="thumbnailUrl" fluid :alt="frame.filename" :title="frame.filename" />
        <div v-else-if="thumbnailError">
          {{ thumbnailError }}
        </div>
        <div v-else-if="archiveError">
          {{ archiveError }}
        </div>
        <i v-else class="fa fa-spin fa-spinner" />
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
          <i v-else class="fa fa-spinner fa-spin" />
        </div>
      </template>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';
import { OCSUtil } from 'ocs-component-lib';

import { downloadAll, getLatestFrame } from '@/archive.js';

export default {
  name: 'RequestRow',
  filters: {
    stateToBsClass: function(state, prefix) {
      return OCSUtil.stateToBsClass(state, prefix);
    },
    stateToIcon: function(state) {
      return OCSUtil.stateToIcon(state);
    },
    formatDate(value) {
      return OCSUtil.formatDate(value);
    }
  },
  props: {
    request: {
      type: Object,
      required: true
    },
    instruments: {
      type: Object,
      required: true
    },
    link: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      thumbnailUrl: '',
      thumbnailError: '',
      archiveError: '',
      frame: {},
      schedulingInformation: {
        found: false,
        error: ''
      }
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    archiveApiUrl: function() {
      return this.$store.state.urls.archiveApi;
    },
    thumbnailServiceUrl: function() {
      return this.$store.state.urls.thumbnailService;
    },
    archiveClientUrl: function() {
      return this.$store.state.urls.archiveClient;
    },
    archiveToken: function() {
      return this.$store.state.archiveToken;
    },
    requestApiUrl: function() {
      return this.$store.state.urls.observationPortalApi + '/api/requests/' + this.request.id + '/';
    },
    instrumentName: function() {
      let instrumentType = _.get(this.request, ['configurations', 0, 'instrument_type']);
      if (instrumentType && instrumentType in this.instruments) {
        return this.instruments[instrumentType].name;
      } else {
        return instrumentType;
      }
    },
    archiveDataIsAvailable: function() {
      return this.frame.id ? true : false;
    }
  },
  created: function() {
    let that = this;
    this.$store.dispatch('getArchiveToken').then(() => {
      that.loadLatestThumbnail();
    });
    if (this.request.state === 'PENDING') {
      this.getPendingDetails();
    }
  },
  methods: {
    downloadAllData: function() {
      downloadAll(this.request.id, this.archiveApiUrl, this.archiveClientUrl, this.archiveToken);
    },
    loadLatestThumbnail: function() {
      const thumbnailSize = 75;
      let that = this;
      getLatestFrame(this.request.id, this.archiveApiUrl, function(frame) {
        if (!frame) {
          that.archiveError = 'Waiting on data to become available';
        } else {
          that.frame = frame;
          $.ajax({
            url: that.thumbnailServiceUrl + '/' + that.frame.id + '/?height=' + thumbnailSize,
            dataType: 'json'
          })
            .done(function(response) {
              that.thumbnailUrl = response.url;
            })
            .fail(function() {
              that.thumbnailError = 'Could not load thumbnail for this file';
            });
        }
      });
    },
    getPendingDetails: function() {
      let that = this;
      $.getJSON(this.observationPortalApiUrl + '/api/requests/' + this.request.id + '/observations/?exclude_canceled=true', function(data) {
        if (data.length > 0) {
          data = data.reverse(); // get the latest non canceled block
          that.schedulingInformation = {
            found: true,
            site: data[0].site,
            start: data[0].start,
            end: data[0].end
          };
        } else {
          that.schedulingInformation = {
            found: false,
            error: 'No scheduling information found'
          };
        }
      });
    }
  }
};
</script>
<style scoped>
.requestgroup-block > p {
  margin: 0px;
  padding-bottom: 0px;
}
.requestgroup-title {
  font-size: 1em;
  margin-left: 4px;
  font-weight: 600;
}
.state-color-marker {
  position: absolute;
  top: 0;
  left: 0;
  max-width: 10px;
  min-width: 10px;
  height: 100%;
}
</style>
