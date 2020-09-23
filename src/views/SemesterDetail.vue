<template>
  <b-row>
    <template v-if="dataLoadError">
      <p class="text-center my-2">
        Oops, there was a problem getting your data, please try again
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
    <template v-else>
      <div class="row">
        <div class="col-md-12">
          <h1>{{ id }} proposals</h1>
          <template v-if="semesterProposals.length < 1">
            There are no active proposals for this semester.
          </template>
          <template v-else>
            <div v-for="scaProposals in proposalsBySca" :key="scaProposals.id">
              <h2>{{ getScaName(scaProposals) }}</h2>
              <table class="table">
                <colgroup>
                  <col style="width: 15%" />
                  <col style="width: 15%" />
                  <col style="width: 35%" />
                  <col style="width: 10%" />
                  <col style="width: 5%" />
                  <col style="width: 5%" />
                  <col style="width: 5%" />
                  <col style="width: 5%" />
                  <col style="width: 5%" />
                  <col style="width: 5%" />
                </colgroup>
                <thead>
                  <tr>
                    <th>PI Name</th>
                    <th>PI Institution</th>
                    <th>Title</th>
                    <th>Semesters</th>
                    <th>FLOYDS (2m)</th>
                    <th>Spectral (2m)</th>
                    <th>Muscat (2m)</th>
                    <th>NRES (1m)</th>
                    <th>Sinistro (1m)</th>
                    <th>SBIG (0.4m)</th>
                    <th>GHTS REDCAM (4.0m)</th>
                    <th>GHTS REDCAM IMAGER (4.0m)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="proposal in scaProposals" :key="proposal.id">
                    <td>
                      <div v-for="(pi, idx) in proposal.pis" :key="pi.first_name + pi.last_name + idx">
                        {{ pi.last_name }} {{ pi.first_name | initial }}
                      </div>
                    </td>
                    <td>
                      <div v-for="(pi, idx) in proposal.pis" :key="pi.first_name + pi.last_name + idx">
                        {{ pi.institution }}
                      </div>
                    </td>

                    <td>
                      <b-link v-b-modal="'modal' + proposal.id" href="#">
                        {{ proposal.title }}
                      </b-link>
                      <b-modal :id="'modal' + proposal.id" :title="proposal.title" ok-only ok-title="Close" ok-variant="white">
                        <p class="abstract">{{ proposal.abstract }}</p>
                      </b-modal>
                    </td>
                    <td>
                      <div v-for="semester in proposal.semesters" :key="semester">
                        {{ semester }}
                      </div>
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, '2M0FLOYDSSCICAM') | formatFloat(0) }}
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, '2M0SCICAMSPECTRAL') | formatFloat(0) }}
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, '2M0SCICAMMUSCAT') | formatFloat(0) }}
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, '1M0NRESSCICAM') | formatFloat(0) }}
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, '1M0SCICAMSINISTRO') | formatFloat(0) }}
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, '0M4SCICAMSBIG') | formatFloat(0) }}
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, 'SOAR_GHTS_REDCAM') | formatFloat(0) }}
                    </td>
                    <td>
                      {{ getAllocationForInstrument(proposal.allocation, 'SOAR_GHTS_REDCAM_IMAGER') | formatFloat(0) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </template>
  </b-row>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { formatFloat } from '@/utils.js';
import NotFound from '@/components/NotFound.vue';

export default {
  name: 'SemesterDetail',
  components: {
    NotFound
  },
  filters: {
    formatFloat: function(value, precision) {
      return formatFloat(value, precision);
    },
    initial: function(value) {
      return value.charAt(0);
    }
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      dataLoaded: false,
      dataLoadError: false,
      dataNotFound: false,
      semesterProposals: []
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    proposalsBySca: function() {
      return _.groupBy(this.semesterProposals, 'sca_id');
    }
  },
  created: function() {
    this.getSemesterProposals();
  },
  methods: {
    getSemesterProposals: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/semesters/' + this.id + '/proposals/'
      })
        .done(function(response) {
          that.semesterProposals = response;
        })
        .fail(function(response) {
          if (response.status === 404) {
            that.dataNotFound = true;
          } else {
            that.dataLoadError = true;
          }
        })
        .always(function() {
          that.dataLoaded = true;
        });
    },
    getAllocationForInstrument: function(allocation, instrumentType) {
      let hours = 0;
      if (instrumentType in allocation) {
        hours += allocation[instrumentType].std;
        hours += allocation[instrumentType].tc;
        hours += allocation[instrumentType].rr;
      }
      return hours;
    },
    getScaName: function(scaProposals) {
      return _.get(scaProposals, [0, 'sca_name'], '');
    }
  }
};
</script>
