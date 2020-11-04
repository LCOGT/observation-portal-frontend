<template>
  <div>
    <h1>Your Proposals</h1>
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
      <template #cell(call)="data"> {{ data.item.call.proposal_type_display }} call for {{ data.item.call.semester }} </template>
      <template #cell(deadline)="data">
        <span v-if="data.item.call.proposal_type === 'DDT'">N/A</span>
        <span v-else>{{ data.item.call.deadline }}</span>
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
      <template #cell(delete)="data">
        <b-link
          href="#"
          title="Delete draft"
          @click="confirm(getDeleteConfirmationMessage(data.item.title), deleteDraftApplication, { appId: data.item.id })"
        >
          <span class="text-danger mx-auto"><i class="far fa-trash-alt"></i></span>
        </b-link>
      </template>
    </b-table>
    <h4>Submitted Proposals</h4>
    <b-table :items="submittedApplications" :fields="submittedFields" :busy="!dataLoaded" show-empty>
      <template #table-busy>
        <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
      </template>
      <template #empty>
        <div class="text-center text-muted my-2">You have not started any proposals.</div>
      </template>
      <template #cell(call)="data"> {{ data.item.call.proposal_type_display }} call for {{ data.item.call.semester }} </template>
      <template #cell(deadline)="data">
        <span v-if="data.item.call.proposal_type === 'DDT'">N/A</span>
        <span v-else>{{ data.item.call.deadline }}</span>
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
  name: 'NonSciCollabApplications',
  mixins: [getDataListWithCountMixin, confirmMixin],
  data: function() {
    return {
      draftFields: [{ key: 'title' }, { key: 'call' }, { key: 'deadline' }, { key: 'status' }, { key: 'preview' }, { key: 'delete' }],
      submittedFields: [{ key: 'title' }, { key: 'call' }, { key: 'deadline' }, { key: 'status' }, { key: 'view' }],
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
      return '/api/scienceapplications/?exclude_proposal_type=COLAB&only_authored=true&limit=500';
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
