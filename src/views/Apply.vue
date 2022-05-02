<template>
  <b-row>
    <b-col class="p-0">
      <h1>Active Calls for Proposals</h1>
      <b-table :items="nonCollabCalls" :fields="nonCollabCallsFields" :busy="!dataLoaded" show-empty>
        <template #empty>
          <div v-if="dataLoadError" class="text-center text-muted my-2">Oops, there was a problem getting your data. Please try again.</div>
          <div v-else class="text-center text-muted my-2">No active calls at this time.</div>
        </template>
        <template #table-busy>
          <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
        </template>
        <template #cell(deadline)="data">
          <span v-if="data.item.proposal_type === 'DDT'">N/A</span>
          <span v-else>{{ data.item.deadline | formatDate }}</span>
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
        <a href="https://lco.global/documents/1505/GettingStartedontheLCONetwork.latest.pdf">"Getting Started" Guide.</a> Information about the
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
        <b-table :items="collabCalls" :fields="collabCallsFields" :busy="!dataLoaded" show-empty>
          <template #table-busy>
            <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
          </template>
          <template #empty>
            <div v-if="dataLoadError" class="text-center text-muted my-2">Oops, there was a problem getting your data. Please try again.</div>
            <div v-else class="text-center text-muted my-2">No active collaboration calls at this time.</div>
          </template>
          <template #head(allocations)>
            <b-row>
              <b-col v-for="allocation in allocations" :key="allocation.telescope_name">
                {{ allocation.raw_telescope_name }}
              </b-col>
            </b-row>
          </template>
          <template #cell(deadline)="data">
            {{ data.item.deadline | formatDate }}
          </template>
          <template #cell(allocations)="data">
            <b-row>
              <b-col v-for="allocation in allocations" :key="allocation.telescope_name">
                {{ getTimeRequested(data.item.id, allocation.telescope_name) }}/{{ allocation.allocation }}
              </b-col>
            </b-row>
          </template>
          <template #cell(addProposal)="data">
            <router-link :to="{ name: 'createApp', params: { callId: data.item.id } }" class="btn btn-primary">Apply</router-link>
          </template>
        </b-table>
        <sci-applications :is-sci-collab="true" :sci-collab-allocations="allocations"></sci-applications>
      </template>
      <h1>Your Proposals</h1>
      <sci-applications :is-sci-collab="false" :open-call-types="openCallTypes"></sci-applications>
    </b-col>
  </b-row>
</template>
<script>
import _ from 'lodash';
import { OCSUtil, OCSMixin } from 'ocs-component-lib';

import SciApplications from '@/components/SciApplications.vue';

export default {
  name: 'Apply',
  components: {
    SciApplications
  },
  filters: {
    formatDate: function(value) {
      if (value) {
        return OCSUtil.formatDate(value, 'YYYY-MM-DD HH:mm:ss');
      } else {
        return value;
      }
    }
  },
  mixins: [OCSMixin.getDataListWithCountMixin],
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
    openCallTypes: function() {
      return _.uniqBy(_.map(this.data.results, 'proposal_type'));
    },
    sciencecollaborationallocation: function() {
      return this.$store.state.profile.profile.sciencecollaborationallocation;
    },
    allocations: function() {
      return _.get(this.sciencecollaborationallocation, 'collaborationallocation_set', []);
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/calls/?only_open=true';
    },
    getTimeRequested: function(callId, telescopeName) {
      for (let call of this.data.results) {
        if (call.id === callId) {
          return _.get(call, ['time_requested', telescopeName], 0);
        }
      }
      return 0;
    }
  }
};
</script>
