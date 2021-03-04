<template>
  <ocs-request-overview
    :request="request"
    :instruments="instruments"
    :request-link="requestLink"
    :extra-column-attrs="{ cols: 12, md: 6, 'align-self': 'center' }"
    show-extra-column
  >
    <template v-slot:extra-column-content>
      <b-row>
        <b-col align-self="center" class="border-right">
          <b-row align-h="center">
            <b-button-group>
              <b-button :href="requestApiUrl" variant="outline-secondary">View in API</b-button>
              <b-button v-if="requestIsComplete" variant="outline-secondary" :disabled="!archiveDataIsAvailable" @click="downloadAllData">
                <i class="fa fa-fw fa-download" /> Download
              </b-button>
            </b-button-group>
          </b-row>
        </b-col>
        <b-col align-self="center" class="text-center">
          <template v-if="requestIsComplete">
            <b-img v-if="thumbnailUrl" :src="thumbnailUrl" fluid :alt="frame.filename" :title="frame.filename" />
            <div v-else-if="thumbnailError">
              {{ thumbnailError }}
            </div>
            <div v-else-if="archiveError">
              {{ archiveError }}
            </div>
            <i v-else class="fa fa-spin fa-spinner" />
          </template>
          <template v-else-if="requestIsPending">
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
  </ocs-request-overview>
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
    },
    requestLink: function() {
      if (this.link) {
        return { to: { name: 'requestDetail', params: { id: this.request.id } } };
      } else {
        return {};
      }
    },
    requestIsComplete: function() {
      return this.request.state === 'COMPLETED';
    },
    requestIsPending: function() {
      return this.request.state === 'PENDING';
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
