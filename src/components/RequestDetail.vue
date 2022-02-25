<template>
  <div class="row request-details">
    <div class="col-md-12">
      <b-tabs content-class="mt-4" no-fade nav-class="nav-justified mt-3">
        <b-tab active @click="tab = 'details'">
          <template slot="title">
            <span title="Details about the observed request.">Details</span>
          </template>
          <div v-if="request.windows && request.windows.length != 0" class="row">
            <div class="col-md-12">
              <h4>Windows</h4>
              <ocs-request-windows-detail :windows="request.windows"></ocs-request-windows-detail>
            </div>
          </div>
          <div v-if="scheduled && scheduled.start" class="row">
            <div class="col-md-12">
              <h4>Scheduled</h4>
              <table class="table table-sm">
                <thead class="no-top-border">
                  <tr>
                    <td><strong>Start</strong></td>
                    <td><strong>End</strong></td>
                    <td><strong>Location</strong></td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ scheduled.start | formatDate }}</td>
                    <td>{{ scheduled.end | formatDate }}</td>
                    <td>{{ scheduled.location }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <h4>Configurations</h4>
              <div role="tablist">
                <ocs-request-configurations-detail :configurations="request.configurations"></ocs-request-configurations-detail>
              </div>
            </div>
          </div>
        </b-tab>
        <b-tab @click="tab = 'scheduling'">
          <template slot="title">
            <span title="Scheduling history.">Scheduling</span>
          </template>
          <ocs-observation-history-plot
            v-show="observationData.length > 0"
            :data="observationData"
            show-plot-controls
            show-legend
            @observationClicked="onObservationClicked"
          />
          <div v-show="observationData.length < 1" class="text-center">
            <h3>This request has not been scheduled.</h3>
          </div>
        </b-tab>
        <b-tab @click="tab = 'visibility'">
          <template slot="title">
            <span title="Target Visibility.">Visibility</span>
          </template>
          <airmass-telescope-states
            v-show="'airmass_limit' in airmassData"
            :airmass-data="airmassData"
            :telescope-states-data="telescopeStatesData"
            :active-observation="activeObservation"
          />
          <p v-if="!hasTarget" class="text-center text-secondary">
            Visibility data not available
          </p>
        </b-tab>
        <b-tab @click="tab = 'data'">
          <template slot="title">
            <span title="Scheduling history.">Data</span>
          </template>
          <div class="row">
            <div v-if="request.state === 'COMPLETED' && curFrame" class="col-md-4">
              <p class="thumb-help">
                Click a row in the data table to preview the file below. Click preview for a larger version.
              </p>
              <thumbnail v-show="curFrame" :frame="curFrame" width="400" height="400" />
              <p v-show="canViewColor && curFrame">
                RVB frames found.
                <b-link title="Color Image" @click="viewColorImage"> View color image <i class="fas fa-external-link-alt" /> </b-link>
                <br />
                <span v-show="loadingColor"><i class="fa fa-spin fa-spinner" /> Generating color image...</span>
              </p>
            </div>
            <div :class="[request.state === 'COMPLETED' && curFrame ? 'col-md-8' : 'col-md-12']">
              <archive-table :requestid="request.id" @rowClicked="curFrame = $event" @dataLoaded="frames = $event" />
              <br />
            </div>
          </div>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import $ from 'jquery';
import _ from 'lodash';
import { OCSUtil } from 'ocs-component-lib';

import Thumbnail from '@/components/Thumbnail.vue';
import ArchiveTable from '@/components/ArchiveTable.vue';
import AirmassTelescopeStates from '@/components/AirmassTelescopeStates.vue';
import { getLatestFrame } from '@/archive.js';

Vue.filter('formatDate', function(value) {
  return OCSUtil.formatDate(value);
});

export default {
  name: 'App',
  components: {
    Thumbnail,
    ArchiveTable,
    AirmassTelescopeStates
  },
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      scheduled: {},
      frames: [],
      curFrame: null,
      observationData: [],
      activeObservation: {},
      airmassData: {},
      telescopeStatesData: {},
      tab: 'details',
      loadingColor: false
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
    colorImage: function() {
      if (this.curFrame) {
        return this.thumbnailServiceUrl + '/' + this.curFrame.id + '/?width=4000&height=4000&color=true';
      } else {
        return '';
      }
    },
    canViewColor: function() {
      let colorFilters = {
        red: ['R', 'rp'],
        visual: ['V'],
        blue: ['B']
      };
      let filtersUsed = this.frames.map(function(frame) {
        return frame.FILTER;
      });
      let numColors = 0;
      for (let color in colorFilters) {
        for (let filter in colorFilters[color]) {
          if (filtersUsed.includes(colorFilters[color][filter])) {
            numColors += 1;
            break;
          }
        }
      }
      return numColors >= 3 ? true : false;
    },
    hasTarget: function() {
      return this.request.configurations && this.request.configurations.length > 0 && !_.isEmpty(this.request.configurations[0].target);
    }
  },
  watch: {
    tab: function(tab) {
      if (tab === 'scheduling' && this.observationData.length === 0) {
        this.loadObservationData();
      } else if (tab === 'visibility') {
        if ($.isEmptyObject(this.airmassData)) {
          this.loadAirmassData();
        }
        if ($.isEmptyObject(this.telescopeStatesData)) {
          this.loadTelescopeStatesData();
          if (this.observationData.length === 0) {
            this.loadObservationData();
          }
        }
      }
    }
  },
  created: function() {
    let that = this;
    this.$store.dispatch('getProfileData').then(() => {
      if (that.request.state === 'COMPLETED') {
        getLatestFrame(that.request.id, that.archiveApiUrl, function(frame) {
          that.curFrame = frame;
        });
      }
    });
    if (that.request.windows && that.request.windows.length === 0) {
      $.getJSON(that.observationPortalApiUrl + '/api/requests/' + that.request.id + '/observations/', function(observations) {
        let location = observations[0].site + '.' + observations[0].enclosure + '.' + observations[0].telescope;
        that.scheduled = {
          start: observations[0].start,
          end: observations[0].end,
          location: location
        };
      });
    }
  },
  methods: {
    isObjEmpty: function(obj) {
      return $.isEmptyObject(obj);
    },
    loadObservationData: function() {
      let that = this;
      $.getJSON(that.observationPortalApiUrl + '/api/requests/' + this.request.id + '/observations/', function(data) {
        that.observationData = data;
        for (let observationIdx in that.observationData) {
          if (that.observationData[observationIdx].status === 'COMPLETED') {
            that.activeObservation = that.observationData[observationIdx];
            break;
          } else if (that.observationData[observationIdx].status === 'SCHEDULED') {
            that.activeObservation = that.observationData[observationIdx];
          }
        }
        for (let observationIdx in that.observationData) {
          // Add in some top level fields that make plotting easier
          let time_completed = 0.0;
          let total_time = 0.0;
          let fail_reason = '';
          for (let csIndex in that.observationData[observationIdx].configuration_statuses) {
            let configurationStatus = that.observationData[observationIdx].configuration_statuses[csIndex];
            let summaryExists = !_.isEmpty(configurationStatus.summary);
            if (summaryExists) {
              fail_reason = that.getFailReason(fail_reason, configurationStatus.summary.reason);
            }
            // Find the configuration that goes with this configuration status
            let configuration;
            for (let cIndex in that.request.configurations) {
              if (that.request.configurations[cIndex].id === configurationStatus.configuration) {
                configuration = that.request.configurations[cIndex];
                break;
              }
            }
            if (configuration) {
              if (_.startsWith(configuration.type, 'REPEAT') && configuration.repeat_duration) {
                if (summaryExists) {
                  let start = new Date(configurationStatus.summary.start);
                  let end = new Date(configurationStatus.summary.end);
                  time_completed += (end - start) / 1000;
                }
                total_time += configuration.repeat_duration;
              } else {
                if (summaryExists) {
                  time_completed += configurationStatus.summary.time_completed;
                }
                for (let icIndex in configuration.instrument_configs) {
                  let instConfig = configuration.instrument_configs[icIndex];
                  total_time += instConfig.exposure_time * instConfig.exposure_count;
                }
              }
            }
          }
          let percentCompleted;
          if (total_time > 0) {
            percentCompleted = (time_completed / total_time) * 100.0;
          }
          that.observationData[observationIdx].percent_completed = percentCompleted;
          that.observationData[observationIdx].fail_reason = fail_reason;
        }
      });
    },
    getFailReason: function(currentFailReason, newFailReason) {
      let failReason = '';
      if (currentFailReason === '' && newFailReason !== 'N/A') {
        failReason = newFailReason;
      }
      return failReason;
    },
    loadAirmassData: function() {
      if (this.hasTarget) {
        let that = this;
        $.getJSON(that.observationPortalApiUrl + '/api/requests/' + this.request.id + '/airmass/', function(data) {
          that.airmassData = data;
        });
      }
    },
    loadTelescopeStatesData: function() {
      let that = this;
      $.getJSON(that.observationPortalApiUrl + '/api/requests/' + this.request.id + '/telescope_states/', function(data) {
        that.telescopeStatesData = data;
      });
    },
    viewColorImage: function() {
      let that = this;
      this.loadingColor = true;
      $.getJSON(this.colorImage, function(data) {
        that.loadingColor = false;
        window.open(data['url'], '_blank');
      });
    },
    onObservationClicked: function(observationId) {
      this.$router.push({ name: 'observationDetail', params: { id: observationId } });
    }
  }
};
</script>
<style scoped>
.request-details {
  margin-top: 5px;
}
.thumb-help {
  font-style: italic;
  font-size: 0.8em;
}
.no-top-border > tr > td {
  border-top: none;
}
.card-column-two {
  column-count: 2;
}
</style>
