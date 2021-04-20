<template>
  <div>
    <h4>Draft Proposals</h4>
    <b-table :items="draftApplications" :fields="draftApplicationFields" :busy="!dataLoaded" show-empty>
      <template #table-busy>
        <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
      </template>
      <template #empty>
        <div v-if="dataLoadError" class="text-center text-muted my-2">Oops, there was a problem getting your data. Please try again.</div>
        <div v-else class="text-center text-muted my-2">You have not started any proposals.</div>
      </template>
      <template #cell(title)="data">
        <router-link :to="{ name: 'updateApp', params: { sciAppId: data.item.id } }">{{ data.item.title }}</router-link>
      </template>
      <template #cell(call)="data"> {{ data.item.call.proposal_type_display }} call for {{ data.item.call.semester }} </template>
      <template #cell(semester)="data">{{ data.item.call.semester }}</template>
      <template #cell(deadline)="data">
        <span v-if="data.item.call.proposal_type === 'DDT'">N/A</span>
        <span v-else>{{ data.item.call.deadline | formatDate }}</span>
      </template>
      <template #head(allocations)>
        <b-row>
          <b-col v-for="allocation in sciCollabAllocations" :key="allocation.telescope_name">
            {{ allocation.raw_telescope_name }}
          </b-col>
        </b-row>
      </template>
      <template #cell(allocations)="data">
        <b-row>
          <b-col v-for="allocation in sciCollabAllocations" :key="allocation.telescope_name">
            {{ getTimeRequested(data.item, allocation.telescope_name) }}
          </b-col>
        </b-row>
      </template>
      <template #cell(preview)="data">
        <router-link :to="{ name: 'appDetail', params: { sciAppId: data.item.id } }" class="px-1">
          <span class="text-primary mx-auto"><i class="fa fa-print"></i></span>
        </router-link>
        <router-link :to="{ name: 'appCombinedPdf', params: { sciAppId: data.item.id } }" class="px-1" target="_blank">
          <span class="text-primary mx-auto"><i class="far fa-file-pdf"></i></span>
        </router-link>
      </template>
      <template #cell(delete)="data">
        <b-link
          href="#"
          title="Delete draft"
          :disabled="deleteDraftIsBusy"
          @click="confirm(getDeleteConfirmationMessage(data.item.title), deleteDraftApplication, { appId: data.item.id })"
        >
          <span class="text-danger mx-auto"><i class="far fa-trash-alt"></i></span>
        </b-link>
      </template>
    </b-table>
    <h4>Submitted Proposals</h4>
    <b-table :items="submittedApplications" :fields="submittedApplicationFields" :busy="!dataLoaded" show-empty>
      <template #table-busy>
        <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
      </template>
      <template #empty>
        <div v-if="dataLoadError" class="text-center text-muted my-2">Oops, there was a problem getting your data. Please try again.</div>
        <div v-else class="text-center text-muted my-2">You have not started any proposals.</div>
      </template>
      <template #cell(call)="data"> {{ data.item.call.proposal_type_display }} call for {{ data.item.call.semester }} </template>
      <template #cell(semester)="data">{{ data.item.call.semester }}</template>
      <template #cell(deadline)="data">
        <span v-if="data.item.call.proposal_type === 'DDT'">N/A</span>
        <span v-else>{{ data.item.call.deadline | formatDate }}</span>
      </template>
      <template #head(allocations)>
        <b-row>
          <b-col v-for="allocation in sciCollabAllocations" :key="allocation.telescope_name">
            {{ allocation.raw_telescope_name }}
          </b-col>
        </b-row>
      </template>
      <template #cell(allocations)="data">
        <b-row>
          <b-col v-for="allocation in sciCollabAllocations" :key="allocation.telescope_name">
            {{ getTimeRequested(data.item, allocation.telescope_name) }}
          </b-col>
        </b-row>
      </template>
      <template #cell(view)="data">
        <router-link :to="{ name: 'appDetail', params: { sciAppId: data.item.id } }">
          <span class="text-primary mx-auto"><i class="fa fa-print"></i></span>
        </router-link>
        <router-link :to="{ name: 'appCombinedPdf', params: { sciAppId: data.item.id } }" target="_blank">
          <span class="text-primary mx-auto"><i class="far fa-file-pdf"></i></span>
        </router-link>
      </template>
    </b-table>
  </div>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';
import { OCSUtil, OCSMixin } from 'ocs-component-lib';

export default {
  name: 'SciApplications',
  filters: {
    formatDate: function(value) {
      if (value) {
        return OCSUtil.formatDate(value, 'YYYY-MM-DD HH:mm:ss');
      } else {
        return value;
      }
    }
  },
  mixins: [OCSMixin.getDataListWithCountMixin, OCSMixin.confirmMixin],
  props: {
    isSciCollab: {
      type: Boolean,
      required: true
    },
    sciCollabAllocations: {
      type: Array,
      required: false,
      default: function() {
        return [];
      }
    }
  },
  data: function() {
    let draftApplicationFields;
    let submittedApplicationFields;
    if (this.isSciCollab) {
      draftApplicationFields = [
        { key: 'title' },
        { key: 'tac_rank', label: 'Rank' },
        { key: 'allocations' },
        { key: 'semester' },
        { key: 'deadline' },
        { key: 'status' },
        { key: 'preview' },
        { key: 'delete' }
      ];
      submittedApplicationFields = [
        { key: 'title' },
        { key: 'tac_rank', label: 'Rank' },
        { key: 'allocations' },
        { key: 'semester' },
        { key: 'deadline' },
        { key: 'status' },
        { key: 'view' }
      ];
    } else {
      draftApplicationFields = [{ key: 'title' }, { key: 'call' }, { key: 'deadline' }, { key: 'status' }, { key: 'preview' }, { key: 'delete' }];
      submittedApplicationFields = [{ key: 'title' }, { key: 'call' }, { key: 'deadline' }, { key: 'status' }, { key: 'view' }];
    }
    return {
      draftApplicationFields: draftApplicationFields,
      submittedApplicationFields: submittedApplicationFields,
      deleteDraftIsBusy: false
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
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
      let endpoint = this.$store.state.urls.observationPortalApi + '/api/scienceapplications/?only_authored=true&limit=1000&ordering=-call__semester';
      if (this.isSciCollab) {
        return endpoint + '&proposal_type=COLAB';
      } else {
        return endpoint + '&exclude_proposal_type=COLAB';
      }
    },
    getTimeRequested: function(sciApp, telescopeName) {
      let timeRequested = 0;
      for (let timeRequest of _.get(sciApp, 'timerequest_set', [])) {
        if (timeRequest.telescope_name === telescopeName) {
          timeRequested += timeRequest.std_time;
          timeRequested += timeRequest.rr_time;
          timeRequested += timeRequest.tc_time;
        }
      }
      return timeRequested;
    },
    addMessage: function(text, variant) {
      this.$store.commit('addMessage', { text: text, variant: variant, namespace: 'scicollab-applications' });
    },
    clearMessages: function() {
      this.$store.commit('clearNamespacedMessages', 'scicollab-applications');
    },
    getDeleteConfirmationMessage: function(title) {
      return 'Are you sure you want to delete "' + title + '"?';
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
              'The draft application that you tried to delete does not exist, please try refreshing your page to get an updated list',
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
