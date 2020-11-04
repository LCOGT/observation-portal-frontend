<template>
  <b-row>
    <b-col>
      <h1>Active Calls for Proposals</h1>
      <!-- TODO: Handle case where there was an error loading -->
      <b-table :items="nonCollabCalls" :fields="nonCollabCallsFields" :busy="!dataLoaded" show-empty>
        <template #empty>
          <h4>No active calls at this time</h4>
        </template>
        <template #table-busy>
          <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
        </template>
        <template #cell(deadline)="data">
          <span v-if="data.item.proposal_type === 'DDT'">N/A</span>
          <span v-else>{{ data.item.deadline }}</span>
        </template>
        <template #cell(applyButton)="data">
          <router-link :to="{ name: 'createApp', params: { callId: data.item.id } }" class="btn btn-primary">Apply</router-link>
        </template>
      </b-table>
      <p>
        For information about submitting proposals, including definitions of terms and timescales, please see our web pages on
        <a href="https://lco.global/observatory/process/">Time Allocation Process</a>.
      </p>
      <p>
        If you are composing a proposal for the LCO network for the first time, we recommend that you consult our
        <a href="https://lco.global/observatory/proposal/guidelines/">guidelines for writing proposals,</a> as well as the
        <a href="https://lco.global/documents/713/GettingStartedontheLCONetwork.latest.pdf">"Getting Started" Guide.</a> Information about the
        <a href="//lco.global/observatory/telescopes">telescopes</a>, <a href="//lco.global/observatory/instruments">instruments</a>,
        <a href="//lco.global/observatory/data">data handling and quality</a>, <a href="//lco.global/observatory/scheduling">scheduling</a> and other
        technical aspects of the network is available on the <a href="https://lco.global/observatory/">observatory capabilities</a> pages.
      </p>
      <template v-if="sciencecollaborationallocation">
        <h1>{{ sciencecollaborationallocation.name }} Proposals</h1>
        <p>
          You are the admin of the {{ sciencecollaborationallocation.id }} collaboration group. Here you will be able to review, edit and submit
          proposals to LCO.
        </p>
        <b-table :items="collabCalls" :fields="collabCallsFields">
          <template #head(allocations)>
            <b-row>
              <b-col v-for="allocation in allocations" :key="allocation.telescope_name">
                {{ allocation.raw_telescope_name }}
              </b-col>
            </b-row>
          </template>
          <template #cell(allocations)="data">
            <b-row>
              <b-col v-for="allocation in allocations" :key="allocation.telescope_name">
                {{ getTimeRequested(data.item.semester, allocation.telescope_name) }}/{{ allocation.allocation }}
              </b-col>
            </b-row>
          </template>
          <template #cell(addProposal)="data">
            <router-link :to="{ name: 'createApp', params: { callId: data.item.id } }" class="btn btn-primary">Apply</router-link>
          </template>
        </b-table>
        <sci-applications :is-sci-collab="true"></sci-applications>
      </template>
      <h1>Your Proposals</h1>
      <sci-applications :is-sci-collab="false"></sci-applications>
    </b-col>
  </b-row>
</template>
<script>
import _ from 'lodash';

import SciApplications from '@/components/SciApplications.vue';
import { getDataListWithCountMixin } from '@/components/util/getDataMixins.js';

export default {
  name: 'Apply',
  components: {
    SciApplications
  },
  mixins: [getDataListWithCountMixin],
  data: function() {
    return {
      collabCallsFields: [{ key: 'semester' }, { key: 'allocations' }, { key: 'deadline' }, { key: 'addProposal', label: '' }],
      nonCollabCallsFields: [
        { key: 'proposal_type_display', label: 'Type' },
        { key: 'semester' },
        { key: 'eligibility_short', label: 'Eligibility' },
        { key: 'deadline' },
        { key: 'applyButton', label: '' }
      ]
    };
  },
  computed: {
    nonCollabCalls: function() {
      return _.filter(this.data.results, call => {
        return call.proposal_type !== 'COLAB';
      });
    },
    collabCalls: function() {
      return _.filter(this.data.results, call => {
        return call.proposal_type === 'COLAB';
      });
    },
    sciencecollaborationallocation: function() {
      return this.$store.state.profile.sciencecollaborationallocation;
    },
    allocations: function() {
      return _.get(this.sciencecollaborationallocation, 'allocations', []);
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/calls/';
    },
    getTimeRequested: function(semester, telescopeName) {
      return _.get(this.sciencecollaborationallocation, ['time_requested_for_open_calls', semester, telescopeName], 0);
    }
  }
};
</script>
