<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
    <h1>{{ id }} proposals</h1>
    <template v-if="data.length < 1">
      There are no active proposals for this semester.
    </template>
    <template v-else>
      <div v-for="scaProposals in proposalsBySca" :key="scaProposals.id">
        <h2>{{ getScaName(scaProposals) }}</h2>
        <table class="table table-responsive">
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
              <th>Instrument Types</th>
              <th>Time Allocation</th>
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
                <div v-for="instrument_type in getInstrumentTypes(proposal)" :key="instrument_type">
                  {{ instrument_type }}
                </div>
              </td>
              <td>
                {{ getTotalAllocationForProposal(proposal) | formatFloat(0) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </ocs-data-loader>
</template>
<script>
import _ from 'lodash';
import { OCSUtil, OCSMixin } from 'ocs-component-lib';

import NotFound from '@/components/NotFound.vue';

export default {
  name: 'SemesterDetail',
  filters: {
    formatFloat: function(value, precision) {
      return OCSUtil.formatFloat(value, precision);
    },
    initial: function(value) {
      return value.charAt(0);
    }
  },
  components: {
    NotFound
  },
  mixins: [OCSMixin.getDataListMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    proposalsBySca: function() {
      return _.groupBy(this.data, 'sca_id');
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/semesters/' + this.id + '/proposals/';
    },
    getInstrumentTypes: function(proposal) {
      let instrumentTypesSet = new Set();
      for (let instrumentTypes in proposal['allocation']) {
        let instrumentTypesArray = instrumentTypes.split(',');
        for (let i in instrumentTypesArray) {
          instrumentTypesSet.add(instrumentTypesArray[i]);
        }
      }
      return instrumentTypesSet;
    },
    getTotalAllocationForProposal: function(proposal) {
      let hours = 0;
      for (let instrumentTypes in proposal['allocation']) {
        hours += proposal['allocation'][instrumentTypes].std;
        hours += proposal['allocation'][instrumentTypes].tc;
        hours += proposal['allocation'][instrumentTypes].rr;
      }
      return hours;
    },
    getScaName: function(scaProposals) {
      return _.get(scaProposals, [0, 'sca_name'], '');
    }
  }
};
</script>
