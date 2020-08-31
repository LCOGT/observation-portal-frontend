<template>
  <b-container class="p-0">
    <b-row>
      <b-col md="9" cols="12">
        <p class="title">
          Submitted Observation Requests
        </p>
      </b-col>
      <b-col md="3" cols="12">
        <b-dropdown id="dropdown-rg-query-params" variant="outline-secondary" block>
          <template v-slot:button-content> <i class="fa fa-filter" /> Filter List </template>
          <b-dropdown-form>
            <b-form @submit="onSubmit" @reset="onReset">
              <b-form-group id="input-group-order" label-for="input-order" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fa fa-sort" /> Sort </template>
                <b-form-select id="input-order" v-model="queryParams.order" :options="orderOptions" size="sm" />
              </b-form-group>
              <b-form-group id="input-group-state" label-for="input-state" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fas fa-sync" /> State </template>
                <b-form-select id="input-state" v-model="queryParams.state" :options="stateOptions" size="sm" />
              </b-form-group>
              <b-form-group id="input-group-name" label-for="input-name" label-class="m-0" class="my-2">
                <b-form-input id="input-name" v-model="queryParams.name" placeholder="Name contains" size="sm" />
                <template v-slot:label> <i class="fa fa-paragraph" /> Name Contains </template>
              </b-form-group>
              <b-form-group id="input-group-target" label-for="input-target" label-class="m-0" class="my-2">
                <b-form-input id="input-target" v-model="queryParams.target" placeholder="Target Name Contains" size="sm" />
                <template v-slot:label> <i class="fa fa-crosshairs" /> Target Name Contains </template>
              </b-form-group>
              <b-form-group id="input-group-proposal" label-for="input-proposal" label-class="m-0" class="my-2">
                <template v-slot:label> <i class="fa fa-users" /> Proposal </template>
                <b-form-select id="input-proposal" v-model="queryParams.proposal" :options="proposalOptions" size="sm" />
              </b-form-group>
              <b-form-group id="input-group-created-after" label-for="input-created-after" label-class="m-0" class="my-2">
                <b-form-input id="input-created-after" v-model="queryParams.created_after" type="date" size="sm" />
                <template v-slot:label>
                  <i class="fa fa-calendar"> <i class="fa fa-arrow-right" /> </i> Submitted After
                </template>
              </b-form-group>
              <b-form-group id="input-group-created-before" label-for="input-created-before" label-class="m-0" class="my-2">
                <b-form-input id="input-created-before" v-model="queryParams.created_before" type="date" size="sm" />
                <template v-slot:label> <i class="fa fa-arrow-left" /> <i class="fa fa-calendar" /> Submitted Before </template>
              </b-form-group>
              <div v-if="!viewAuthoredRequestsOnly">
                <b-form-group id="input-group-user" label-for="input-user" label-class="m-0" class="my-2">
                  <b-form-input id="input-user" v-model="queryParams.user" placeholder="Username Contains" size="sm" />
                  <template v-slot:label> <i class="fa fa-user" /> Username Contains </template>
                </b-form-group>
              </div>
              <b-dropdown-divider />
              <b-button-group class="mx-4">
                <b-button type="submit" variant="outline-info" :disabled="isBusy">
                  <span class="text-nowrap">Filter Results</span>
                </b-button>
                <b-button type="reset" variant="outline-danger" :disabled="isBusy">
                  <span class="text-nowrap">Clear All Fields</span>
                </b-button>
              </b-button-group>
            </b-form>
          </b-dropdown-form>
        </b-dropdown>
      </b-col>
    </b-row>
    <div>
      <b-table id="requestgroups-table" :items="data.results" :fields="fields" :tbody-tr-class="requestGroupRowClass" :busy="isBusy" small show-empty>
        <template v-slot:head(requestgroupInfo)>
          <b-row>
            <b-col md="4" cols="12">
              <small>User Info</small>
            </b-col>
            <b-col md="4" cols="12">
              <small>State Info</small>
            </b-col>
            <b-col md="4" cols="12">
              <small># Requests / Pending / Failed / Complete</small>
            </b-col>
          </b-row>
        </template>
        <template v-slot:table-busy>
          <br />
          <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading observation requests...</div>
          <br />
        </template>
        <template v-slot:empty>
          <div class="empty-requests">
            <center>
              <!-- TODO: Translate this -->
              <h2>No observation requests found.</h2>
              <div v-if="profile.proposals.length > 0">
                <!-- TODO: Translate this, and also, is this really a link to the create page?
                It was originally href=#, but that doesn't make sense -->
                <router-link class="btn btn-success btn-lg" :to="{ name: 'create' }">
                  Submit an Observation Request
                </router-link>
              </div>
              <div v-else>
                <h2>You are not a member of any proposals yet.</h2>
                <p>Only users with at least one active proposal may submit observation requests.</p>
                <!-- TODO: Translate this -->
                <router-link class="btn btn-success btn-lg" :to="{ name: 'apply' }">
                  Submit a new proposal
                </router-link>
              </div>
              <h3>Need help?</h3>
              <a href="https://lco.global/documentation/">View the documentation</a> or <a href="mailto:scisupport@lco.global">contact support</a>.
            </center>
          </div>
        </template>
        <template v-slot:cell(requestgroupInfo)="data">
          <b-row class="mx-0">
            <b-col md="8" cols="12" class="px-3">
              <router-link class="requestgroup-title" :to="{ name: 'requestgroupDetail', params: { id: data.item.id } }">
                {{ data.item.name | valueOrDefault('Unnamed Request') }}
              </router-link>
              <b-row>
                <b-col class="pr-1">
                  <div class="requestgroup-details requestgroup-block border-right">
                    <div><i class="fa fa-fw fa-user" /> {{ data.item.submitter }}</div>
                    <div>
                      <i class="fa fa-fw fa-users" />
                      <router-link :to="{ name: 'proposalDetail', params: { id: data.item.proposal } }">
                        {{ data.item.proposal }}
                      </router-link>
                    </div>
                  </div>
                </b-col>
                <b-col class="p-0">
                  <div class="requestgroup-details requestgroup-block">
                    <div :class="data.item.state | stateToBsClass('text')"><i :class="data.item.state | stateToIcon" />{{ data.item.state }}</div>
                    <div>
                      <i class="fa fa-fw fa-calendar" />
                      <span class="tool-tip" :title="data.item.modified | timeFromNow">{{ data.item.modified | formatDate }}</span>
                    </div>
                  </div>
                </b-col>
              </b-row>
            </b-col>
            <b-col md="1" cols="12" class="request-count request-block">
              <center>{{ data.item.requests.length }}</center>
            </b-col>
            <b-col md="1" cols="12" class="request-count request-block text-neutral">
              <center>{{ data.item | requestStateCount('PENDING') }}</center>
            </b-col>
            <b-col md="1" cols="12" class="request-count request-block text-danger">
              <center>{{ data.item | requestStateCount('WINDOW_EXPIRED') }}</center>
            </b-col>
            <b-col md="1" cols="12" class="request-count request-block text-success">
              <center>{{ data.item | requestStateCount('COMPLETED') }}</center>
            </b-col>
          </b-row>
        </template>
      </b-table>
      <custom-pagination
        v-show="!isBusy"
        table-id="requestgroups-table"
        :per-page="queryParams.limit"
        :total-rows="data.count"
        :current-page="currentPage"
        display-per-page-dropdown
        @pageChange="onPageChange"
        @limitChange="onLimitChange"
      ></custom-pagination>
    </div>
  </b-container>
</template>
<script>
import _ from 'lodash';

import { timeFromNow, formatDate, stateToBsClass, stateToIcon } from '@/utils.js';
import { paginationAndFilteringMixin } from '@/components/util/paginationMixins.js';
import CustomPagination from '@/components/util/CustomPagination.vue';

export default {
  name: 'RequestgroupsList',
  filters: {
    requestStateCount: function(requestgroup, state) {
      let count = 0;
      for (let request of requestgroup.requests) {
        if (request.state === state) {
          count++;
        }
      }
      return count;
    },
    stateToBsClass: function(state, prefix) {
      return stateToBsClass(state, prefix);
    },
    stateToIcon: function(state) {
      return stateToIcon(state);
    },
    valueOrDefault: function(value, defaultValue) {
      return value || defaultValue;
    },
    timeFromNow: function(value) {
      return timeFromNow(value);
    },
    formatDate(value) {
      return formatDate(value);
    }
  },
  components: {
    CustomPagination
  },
  mixins: [paginationAndFilteringMixin],
  data: function() {
    const stateOptions = [
      { value: '', text: '---------' },
      { value: 'PENDING', text: 'PENDING' },
      { value: 'COMPLETED', text: 'COMPLETED' },
      { value: 'WINDOW_EXPIRED', text: 'WINDOW_EXPIRED' },
      { value: 'CANCELED', text: 'CANCELED' }
    ];
    const orderOptions = [
      { value: '', text: '---------' },
      { value: 'name', text: 'Name' },
      { value: '-name', text: 'Name (descending)' },
      { value: 'modified', text: 'Last Update' },
      { value: '-modified', text: 'Last Update (descending)' },
      { value: 'created', text: 'Created' },
      { value: '-created', text: 'Created (descending)' },
      { value: 'end', text: 'End of window' },
      { value: '-end', text: 'End of window (descending)' }
    ];
    return {
      orderOptions: orderOptions,
      stateOptions: stateOptions,
      fields: [{ key: 'requestgroupInfo', tdClass: 'p-0 m-0', thClass: 'border-0' }]
    };
  },
  computed: {
    profile: function() {
      return this.$store.state.profile;
    },
    proposalOptions: function() {
      let selected = this.queryParams.proposal;
      let proposalInQuery = _.get(this.$route, 'query.proposal', '');
      let staffView = _.get(this.profile, 'profile.staff_view', false);
      let options = [{ value: '', text: '---------', selected: selected === '' }];
      // If an admin user is checking out proposals for a proposal they don't belong to, allow filtering to work
      if (staffView && proposalInQuery) {
        options.push({ value: proposalInQuery, text: proposalInQuery, selected: selected === proposalInQuery });
      }
      if (this.profile.proposals) {
        for (let proposal of this.profile.proposals) {
          options.push({ value: proposal.id, text: proposal.title, selected: selected === proposal.id });
        }
      }
      return options;
    },
    viewAuthoredRequestsOnly: function() {
      return this.profile.profile && this.profile.profile.view_authored_requests_only;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/requestgroups/';
    },
    initializeDefaultQueryParams: function() {
      const defaultQueryParams = {
        proposal: '',
        order: '',
        state: '',
        name: '',
        target: '',
        created_after: '',
        created_before: '',
        user: '',
        limit: 20,
        offset: 0
      };
      return defaultQueryParams;
    },
    requestGroupRowClass: function(item, type) {
      if (type === 'row') {
        return stateToBsClass(item.state, 'requestgroup');
      } else {
        return;
      }
    },
    setUserIfAuthoredOnly: function() {
      if (this.viewAuthoredRequestsOnly) {
        this.queryParams.user = this.profile.username;
      }
    },
    beforeDataUpdate: function() {
      this.setUserIfAuthoredOnly();
    }
  }
};
</script>
<style scoped>
.title {
  font-size: 1.8em;
}

.requestgroup-details div {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
