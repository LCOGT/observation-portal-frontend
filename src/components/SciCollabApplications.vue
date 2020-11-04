<template>
  <div>
    <p>Scicollab stuff</p>
    <h1>{{ sciencecollaborationallocation.name }} Proposals</h1>
    <p>
      You are the admin of the {{ sciencecollaborationallocation.id }} collaboration group. Here you will be able to review, edit and submit proposals
      to LCO.
    </p>
    <b-table :items="collabCalls" :fields="collabCallsFields">
      <template #head(allocations)>
        <b-row>
          <b-col v-for="allocation in telescopeAllocations" :key="allocation.key">
            {{ allocation.telescopeNameRaw }}
          </b-col>
        </b-row>
      </template>
      <template #cell(allocations)="data">
        <b-row>
          <b-col v-for="allocation in telescopeAllocations" :key="allocation.key">
            {{ sciencecollaborationallocation.time_requested_for_open_calls[data.item.semester][allocation.telescopeName] }} /
            {{ allocation.allocation }}
          </b-col>
        </b-row>
      </template>
      <template #cell(addProposal)="data">
        <router-link :to="{ name: 'createApp', params: { callId: data.item.id } }">Apply</router-link>
      </template>
    </b-table>
    <h4>Draft Proposals</h4>
    <b-table :items="draftApplications" :fields="draftFields" :busy="!dataLoaded" show-empty>
      <template #table-busy>
        <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
      </template>
      <template #empty>
        <div class="text-center text-muted my-2">You have not started any proposals.</div>
      </template>
      <template #cell(title)="data">
        <router-link :to="{ name: 'updateApp', params: { callId: data.item.id } }">{{ data.item.title }}</router-link>
      </template>
      <template #cell(semester)="data">
        {{ data.item.call.semester }}
      </template>
      <template #cell(deadline)="data">
        {{ data.item.call.deadline }}
      </template>
      <template #head(allocations)>
        <b-row>
          <b-col v-for="allocation in telescopeAllocations" :key="allocation.key">
            {{ allocation.telescopeNameRaw }}
          </b-col>
        </b-row>
      </template>
      <template #cell(allocations)="data">
        <b-row>
          <b-col v-for="allocation in telescopeAllocations" :key="allocation.key">
            {{ data.item.time_requested_by_telescope_name[allocation.telescopeName] }}
          </b-col>
        </b-row>
      </template>
      <template #cell(delete)="data">
        <b-link
          href="#"
          title="Delete draft"
          @click="confirm(getDeleteConfirmationMessage(data.item.title), deleteDraftApplication, { appId: data.item.id })"
        >
          <span class="text-danger mx-auto"><i class="far fa-trash-alt"></i></span>
        </b-link>
      </template>
      <template #cell(preview)>
        <!-- TODO: Make these icons link to their respective targets -->
        <b-link href="#">
          <span class="text-primary mx-auto"><i class="fa fa-print"></i></span>
        </b-link>
        <b-link href="#">
          <span class="text-primary mx-auto"><i class="far fa-file-pdf"></i></span>
        </b-link>
      </template>
    </b-table>
    <h4>Submitted Proposals</h4>
    <b-table :items="submittedApplications" :fields="submittedFields" :busy="!dataLoaded" show-empty>
      <template #table-busy>
        <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
      </template>
      <template #empty>
        <div class="text-center text-muted my-2">You have not submitted any proposals.</div>
      </template>
      <template #cell(semester)="data">
        {{ data.item.call.semester }}
      </template>
      <template #cell(deadline)="data">
        {{ data.item.call.deadline }}
      </template>
      <template #head(allocations)>
        <b-row>
          <b-col v-for="allocation in telescopeAllocations" :key="allocation.key">
            {{ allocation.telescopeNameRaw }}
          </b-col>
        </b-row>
      </template>
      <template #cell(allocations)="data">
        <b-row>
          <b-col v-for="allocation in telescopeAllocations" :key="allocation.key">
            {{ data.item.time_requested_by_telescope_name[allocation.telescopeName] }}
          </b-col>
        </b-row>
      </template>
      <template #cell(view)>
        <!-- TODO: Make these icons link to their respective targets -->
        <b-link href="#">
          <span class="text-primary mx-auto"><i class="fa fa-print"></i></span>
        </b-link>
        <b-link href="#">
          <span class="text-primary mx-auto"><i class="far fa-file-pdf"></i></span>
        </b-link>
      </template>
    </b-table>
  </div>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { getDataListWithCountMixin } from '@/components/util/getDataMixins.js';
import { confirmMixin } from '@/components/util/utilMixins.js';

export default {
  name: 'SciCollabApplications',
  mixins: [getDataListWithCountMixin, confirmMixin],
  props: {
    collabCalls: {
      type: Array,
      required: true
    }
  },
  data: function() {
    let telescopeAllocations = [];
    if (this.$store.state.profile.sciencecollaborationallocation) {
      let allocations = this.$store.state.profile.sciencecollaborationallocation.allocations;
      for (let allocationIdx in allocations) {
        telescopeAllocations.push({
          key: 'telescope' + allocationIdx,
          telescopeNameRaw: allocations[allocationIdx].raw_telescope_name,
          telescopeName: allocations[allocationIdx].telescope_name,
          allocation: allocations[allocationIdx].allocation
        });
      }
    }
    let collabCallsFields = [
      { key: 'semester' },
      { key: 'allocations' },
      { key: 'deadline' },
      { key: 'addProposal', label: '' }
    ];
    let draftFields = [
      { key: 'title' },
      { key: 'tac_rank', label: 'Rank' },
      { key: 'allocations' },
      { key: 'semester' },
      { key: 'deadline' },
      { key: 'status' },
      { key: 'preview' },
      { key: 'delete' }
    ];
    let submittedFields = [
      { key: 'title' },
      { key: 'tac_rank', label: 'Rank' },
      { key: 'allocations' },
      { key: 'semester' },
      { key: 'deadline' },
      { key: 'status' },
      { key: 'view' }
    ];
    return {
      collabCallsFields: collabCallsFields,
      draftFields: draftFields,
      submittedFields: submittedFields,
      telescopeAllocations: telescopeAllocations,
      deleteDraftIsBusy: false
    };
  },
  computed: {
    profile: function() {
      return this.$store.state.profile;
    },
    sciencecollaborationallocation: function() {
      return this.$store.state.profile.sciencecollaborationallocation;
    },
    submittedApplications: function() {
      return _.filter(this.data.results, app => {
        return app.status !== 'DRAFT';
      });
    },
    draftApplications: function() {
      return _.filter(this.data.results, app => {
        return app.status === 'DRAFT';
      });
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      // TODO: Paginate results
      return '/api/scienceapplications/?proposal_type=COLAB&only_authored=true&limit=500';
    },
    getDeleteConfirmationMessage: function(title) {
      return 'Are you sure you want to delete "' + title + '"?';
    },
    addMessage: function(text, variant) {
      this.$store.commit('addMessage', { text: text, variant: variant, namespace: 'scicollab-applications' });
    },
    clearMessages: function() {
      this.$store.commit('clearNamespacedMessages', 'scicollab-applications');
    },
    deleteDraftApplication: function(args) {
      this.clearMessages();
      this.deleteDraftIsBusy = true;
      let that = this;
      $.ajax({
        method: 'DELETE',
        url: this.observationPortalApiUrl + '/api/scienceapplications/' + args.appId + '/'
      })
        .done(function() {
          that.addMessage('Draft deleted', 'success');
          that.getData();
        })
        .fail(function(response) {
          if (response.status === 404) {
            that.addMessage(
              'The application that you tried to delete does not exist, please try refreshing your page to get an updated list',
              'danger'
            );
          } else {
            that.addMessage('There was a problem deleting the draft application, please try again', 'danger');
          }
        })
        .always(function() {
          that.deleteDraftIsBusy = false;
        });
    }
  }
};
</script>
