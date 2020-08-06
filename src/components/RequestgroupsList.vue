<template>
  <b-container class="p-0">
    <b-row>
      <b-col md="9" cols="12">
        <p class="title">Submitted Observation Requests</p>
      </b-col>
      <b-col md="3" cols="12">
        <b-dropdown 
          id="dropdown-rg-query-params"
          variant="outline-secondary"
          block
        >
          <template v-slot:button-content>
            <i class="fa fa-filter"></i> Filter List
          </template>
          <b-dropdown-form>
            <b-form @submit="onSubmit" @reset="onReset">
              <b-form-group
                id="input-group-order"
                label-for="input-order"
                label-class="m-0"
                class="my-2"
              >
                <template v-slot:label>
                  <i class="fa fa-sort"></i> Sort
                </template>
                <b-form-select
                  id="input-order"
                  v-model="rgQueryParams.order"
                  :options="orderOptions"
                  size="sm"
                ></b-form-select>
              </b-form-group>
              <b-form-group
                id="input-group-state"
                label-for="input-state"
                label-class="m-0"
                class="my-2"
              >
                <template v-slot:label>
                  <i class="fas fa-sync"></i> State
                </template>
                <b-form-select
                  id="input-state"
                  v-model="rgQueryParams.state"
                  :options="stateOptions"
                  size="sm"
                ></b-form-select>
              </b-form-group>
              <b-form-group 
                id="input-group-name" 
                label-for="input-name"
                label-class="m-0"
                class="my-2"
              >
                <b-form-input
                  id="input-name"
                  v-model="rgQueryParams.name"
                  placeholder="Name contains"
                  size="sm"
                ></b-form-input>
                <template v-slot:label>
                  <i class="fa fa-paragraph"></i> Name Contains
                </template>
              </b-form-group>
              <b-form-group 
                id="input-group-target" 
                label-for="input-target"
                label-class="m-0"
                class="my-2"
              >
                <b-form-input
                  id="input-target"
                  v-model="rgQueryParams.target"
                  placeholder="Target Name Contains"
                  size="sm"
                ></b-form-input>
                <template v-slot:label>
                  <i class="fa fa-crosshairs"></i> Target Name Contains
                </template>
              </b-form-group>
              <b-form-group
                id="input-group-proposal"
                label-for="input-proposal"
                label-class="m-0"
                class="my-2"
              >
                <template v-slot:label>
                  <i class="fa fa-users"></i> Proposal
                </template>
                <b-form-select
                  id="input-proposal"
                  v-model="rgQueryParams.proposal"
                  :options="proposalOptions"
                  size="sm"
                ></b-form-select>
              </b-form-group>
              <b-form-group 
                id="input-group-created-after" 
                label-for="input-created-after"
                label-class="m-0"
                class="my-2"
              >
                <b-form-input
                  id="input-created-after"
                  v-model="rgQueryParams.created_after"
                  type="date"
                  size="sm"
                ></b-form-input>
                <template v-slot:label>
                  <i class="fa fa-calendar"> <i class="fa fa-arrow-right"></i> </i> Submitted After
                </template>
              </b-form-group>
              <b-form-group 
                id="input-group-created-before" 
                label-for="input-created-before"
                label-class="m-0"
                class="my-2"
              >
                <b-form-input
                  id="input-created-before"
                  v-model="rgQueryParams.created_before"
                  type="date"
                  size="sm"
                ></b-form-input>
                <template v-slot:label>
                  <i class="fa fa-arrow-left"></i> <i class="fa fa-calendar"></i> Submitted Before 
                </template>
              </b-form-group>
              <div v-if="!viewAuthoredRequestsOnly">
                <b-form-group
                  id="input-group-user"
                  label-for="input-user"
                  label-class="m-0"
                  class="my-2"
                >
                  <b-form-input
                    id="input-user"
                    v-model="rgQueryParams.user"
                    placeholder="Username Contains"
                    size="sm"
                  ></b-form-input>
                  <template v-slot:label>
                    <i class="fa fa-user"></i> Username Contains
                  </template>
                </b-form-group>
              </div>
              <b-dropdown-divider></b-dropdown-divider>
              <b-button-group class="mx-4">
                <b-button type="submit" variant="outline-info"><span class="text-nowrap">Filter Results</span></b-button>
                <b-button type="reset" variant="outline-danger"><span class="text-nowrap">Clear All Fields</span></b-button>
              </b-button-group>
            </b-form>
          </b-dropdown-form>
        </b-dropdown>
      </b-col>
      <b-alert v-for="error in errors" :key="error" show variant="danger" class="w-100">
        <i class="fas fa-exclamation-circle"></i> {{ error }}
      </b-alert>
    </b-row>
    <div>
      <b-table 
        id="requestgroups-table"
        :items="requestgroups.results"
        :fields="fields"
        :tbody-tr-class="requestGroupRowClass"
        :busy="isBusy"
        small
        show-empty
      >
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
          <br/>
          <div class="text-center my-2">
            <i class="fa fa-spin fa-spinner"></i> Loading observation requests...
          </div>
          <br/>
        </template>
        <template v-slot:empty>
          <div class="empty-requests">
            <center>
              <!-- TODO: Translate this -->
              <h2>No observation requests found.</h2>
              <div v-if="profile.proposals.length > 0">
                <!-- TODO: Translate this, and also, is this really a link to the create page? It was originally href=#, but that doesn't make sense -->
                <router-link class="btn btn-success btn-lg" :to="{name: 'create'}">Submit an Observation Request</router-link>
              </div>
              <div v-else>
                <h2> You are not a member of any proposals yet.</h2>
                <p>Only users with at least one active proposal may submit observation requests.</p>
                <!-- TODO: Translate this -->
                <router-link class="btn btn-success btn-lg" :to="{name: 'apply'}">Submit a new proposal</router-link>
              </div>
              <h3>Need help?</h3>
              <a href="https://lco.global/documentation/">View the documentation</a> or <a href="mailto:scisupport@lco.global">contact support</a>.
            </center>
          </div>
        </template>
        <template v-slot:cell(requestgroupInfo)="data">
          <b-row class="mx-0">
            <b-col md="8" cols="12" class="px-3">
              <router-link class="requestgroup-title" :to="{name: 'requestgroupsDetail', params: {id: data.item.id} }">
                {{ data.item.name | valueOrDefault('Unnamed Request')}}
              </router-link>
              <b-row>
                <b-col class="pr-1">
                  <div class="requestgroup-details requestgroup-block border-right">
                    <div><i class="fa fa-fw fa-user"></i> {{ data.item.submitter }}</div>
                    <div><i class="fa fa-fw fa-users"></i> <router-link :to="{name: 'proposalsDetail', params: {id: data.item.proposal}}">{{ data.item.proposal }}</router-link></div>
                  </div>
                </b-col>
                <b-col class="p-0">
                  <div class="requestgroup-details requestgroup-block">
                    <div :class="data.item.state | stateToBsClass('text')"><i class="fa fa-fw" :class="data.item.state | startToIcon"></i>{{ data.item.state }}</div>
                    <div><i class="fa fa-fw fa-calendar"></i> <span class="tool-tip" :title="data.item.modified | timeFromNow">{{ data.item.modified | formatDate }}</span></div>
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
      <b-row class="row">
        <b-col md="9" cols="12">
          <b-pagination
            v-if="requestgroups.count > rgQueryParams.limit"
            :value="currentPage"
            :total-rows="requestgroups.count"
            :per-page="rgQueryParams.limit"
            @change="onPageChange"
            aria-controls="requestgroups-table"
          ></b-pagination>
        </b-col>
        <b-col md="3" cols="12">
          <b-form-group
            label-for="perPageSelect"
          >
            <b-form-select
              :value="rgQueryParams.limit"
              id="perPageSelect"
              :options="perPageOptions"
              @change="onLimitChange"
            ></b-form-select>
          </b-form-group>
        </b-col>
      </b-row>
    </div>
  </b-container>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { timeFromNow, formatDate, copyObject, stateToBsClass } from '@/utils.js';
import { getTestProfileData } from '@/testData.js';

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
    startToIcon: function(state) {
      let stateMap = {
          'PENDING': 'sync',
          'SCHEDULED': 'sync',
          'COMPLETED': 'check',
          'WINDOW_EXPIRED': 'times',
          'CANCELED': 'times',
      }
      return 'fa-' + stateMap[state]
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
  data: function() {
    const stateOptions = [
      {value: '', text: '---------'},
      {value: 'PENDING', text: 'PENDING'},
      {value: 'COMPLETED', text: 'COMPLETED'},
      {value: 'WINDOW_EXPIRED', text: 'WINDOW_EXPIRED'},
      {value: 'CANCELED', text: 'CANCELED'}
    ]
    const orderOptions = [
      {value: '', text: '---------'},
      {value: 'name', text: 'Name'},
      {value: '-name', text: 'Name (descending)'},
      {value: 'modified', text: 'Last Update'},
      {value: '-modified', text: 'Last Update (descending)'},
      {value: 'created', text: 'Created'},
      {value: '-created', text: 'Created (descending)'},
      {value: 'end', text: 'End of window'},
      {value: '-end', text: 'End of window (descending)'},
    ]
    const defaultRgQueryParams = {
      proposal: '',
      order: orderOptions[0].value,
      state: stateOptions[0].value,
      name: '',
      target: '',
      created_after: '',
      created_before: '',
      user: '',
      limit: 20,
      offset: 0
    }
    let rgQueryParams = this.getMergedRgQueryParams(defaultRgQueryParams);
    let currentPage = this.calculateCurrentPage(rgQueryParams.offset, rgQueryParams.limit)
    let testProfileData = getTestProfileData(this.$route.query);
    return {
      orderOptions: orderOptions,
      stateOptions: stateOptions,
      rgQueryParams: rgQueryParams,
      defaultRgQueryParams: defaultRgQueryParams,
      requestgroups: { count: 0, results: [] },
      fields: [
        { key: 'requestgroupInfo', tdClass: 'p-0 m-0', thClass: 'border-0' },
      ],
      // TODO: Replace with actual profile data
      profile: testProfileData[0],
      isBusy: false,
      errors: [],
      currentPage: currentPage,
      perPageOptions: [
        { value: '5', text: 'Show: 5'},
        { value: '10', text: 'Show: 10'},
        { value: '20', text: 'Show: 20'},
        { value: '50', text: 'Show: 50'},
        { value: '100', text: 'Show: 100'},
      ]
    }
  },
  created: function() {
    this.updateRequestgroups();
  },
  computed: {
    proposalOptions: function() {
      let selected = this.rgQueryParams.proposal;
      let proposalInQuery = _.get(this.$route, 'query.proposal', '');
      let staffView = _.get(this.profile, 'profile.staff_view', false);
      let options = [{value: '', text: '---------', selected: selected === ''}];
      // If an admin user is checking out proposals for a proposal they don't belong to, allow filtering to work 
      if (staffView && proposalInQuery) {
        options.push({value: proposalInQuery, text: proposalInQuery, selected: selected === proposalInQuery});
      }
      if (this.profile.proposals) {
        for (let proposal of this.profile.proposals) {
          options.push({value: proposal.id, text: proposal.title, selected: selected === proposal.id});
        }
      }
      return options;
    },
    viewAuthoredRequestsOnly: function() {
      return this.profile.profile && this.profile.profile.view_authored_requests_only;
    }
  },
  methods: {
    requestGroupRowClass: function(item, type) {
      if (type === 'row') {
        return stateToBsClass(item.state, 'requestgroup');
      } else {
        return;
      }
    },
    getMergedRgQueryParams: function(baseRgQueryParams) {
      // Add any requestgroup query parameters that are in the url to the 
      // request query param object so that the API request will include them.
      let mergedRgQueryParams = copyObject(baseRgQueryParams);
      for (let key in this.$route.query) {
        if (_.has(mergedRgQueryParams, key)) {
          mergedRgQueryParams[key] = this.$route.query[key];
        }
      }
      return mergedRgQueryParams;
    },
    calculateCurrentPage(offset, limit) {
      // The offset is always a multiple of the limit
      return offset / limit + 1;
    },
    calculateOffset(currentPage) {
      return (currentPage - 1) * this.rgQueryParams.limit;
    },
    setUserIfAuthoredOnly: function() {
      if (this.viewAuthoredRequestsOnly) {
        this.rgQueryParams.user = this.profile.username;
      }
    },
    getRequestgroups: function() {
      // TODO: Cancel any currently running request
      this.isBusy = true;
      let url = this.observationPortalApiUrl + '/api/requestgroups/';
      let that = this;
      $.getJSON(url, this.rgQueryParams).done(function(data) {
        that.requestgroups = data;
        that.errors = [];
      }).fail(function(data) {
        that.requestgroups = {count: 0, results: []};
        that.currentPage = 1;
        that.errors = [];
        if (data.status === 400) {
          for (let field in data.responseJSON) {
            that.errors.push(field + ': ' + data.responseJSON[field]);
          }
        } else {
          that.errors.push('There was a problem retrieving observation requests, please try again.');
        }
      }).always(function() {
        that.isBusy = false;
      })
    },
    updateRequestgroups: function() {
      this.setUserIfAuthoredOnly();
      this.getRequestgroups();
      let newQueryParams = copyObject(this.$route.query);
      for (let rgKey in this.rgQueryParams) {
        newQueryParams[rgKey] = this.rgQueryParams[rgKey];
      }
      if (!_.isEqual(newQueryParams, this.$route.query)) {
        this.$router.push({ query: newQueryParams });
      }
    },
    goToFirstPage: function() {
      this.currentPage = 1;
      this.rgQueryParams.offset = 0;
    },
    isNumberAndChanged: function(newInt, oldInt) {
      newInt = _.parseInt(newInt);
      oldInt = _.parseInt(oldInt);
      return _.isNumber(newInt) && newInt !== oldInt;
    },
    onSubmit: function(event) {
      event.preventDefault();
      this.goToFirstPage();
      this.updateRequestgroups();
    },
    onReset: function(event) {
      event.preventDefault();
      this.rgQueryParams = copyObject(this.defaultRgQueryParams);
      this.goToFirstPage();
      this.updateRequestgroups()
    },
    onPageChange: function(newPage) {
      if (this.isNumberAndChanged(newPage, this.currentPage)) {
        this.currentPage = newPage;
        this.rgQueryParams.offset = this.calculateOffset(newPage);
        this.updateRequestgroups();
      }
    },
    onLimitChange: function(newLimit) {
      if (this.isNumberAndChanged(newLimit, this.rgQueryParams.limit)) {
        this.rgQueryParams.limit = newLimit;
        this.goToFirstPage();
        this.updateRequestgroups();
      }
    }
  }
}
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
