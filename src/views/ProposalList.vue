<template>
  <b-col>
    <b-row>
      <b-col md="9">
        <h2>Your Proposals</h2>
        <p>
          Below is a list of all proposals for which you are either the principal investigator (PI) or a co-investigator.
        </p>
        <p v-if="isStaff">
          With staff view enabled, you will see all proposals in the list. This setting can be updated on your
          <router-link :to="{ name: 'profile' }">profile page</router-link>.
        </p>
        <p>Click on a Proposal ID to view details and (if you are the PI) manage co-investigators.</p>
        <template v-if="isStaff && semesterAdminTableSemester.id">
          Admin only:
          <router-link :to="{ name: 'semesterAdminTable', params: { id: semesterAdminTableSemester.id } }">View All Proposals</router-link>
        </template>
      </b-col>
      <b-col md="3">
        <h4>
          <router-link :to="{ name: 'apply' }"><i class="fa fa-edit fa-fw"></i> Submit Proposal</router-link>
        </h4>
        <p>
          There {{ calls.count | pluralize('is', 'are') }} currently <router-link :to="{ name: 'apply' }">{{ calls.count }}</router-link> open call{{
            calls.count | pluralize('', 's')
          }}
          for proposals.
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-form inline @submit="onSubmit">
          <b-form-group id="input-proposal-active" label-for="input-proposal-active" label="Active" class="mr-md-3">
            <b-form-select id="input-proposal-active" v-model="queryParams.active" :options="proposalActiveOptions" />
          </b-form-group>
          <b-form-group id="input-proposal-semester" label-for="input-proposal-semester" label="Semester" class="mr-md-3">
            <b-form-select id="input-proposal-semester" v-model="queryParams.semester" :options="semesterOptions"></b-form-select>
          </b-form-group>
          <b-button type="submit" variant="outline-secondary" :disabled="isBusy">Filter</b-button>
        </b-form>
        <b-table id="proposals-table" :items="data.results" :fields="fields" :busy="isBusy" show-empty striped>
          <template v-slot:table-busy>
            <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
          </template>
          <template v-slot:empty>
            <div v-if="userProposals.length < 1">
              You are not a member of any proposals. Would you like to <router-link :to="{ name: 'apply' }">submit a proposal?</router-link>
            </div>
            <div v-else>
              No proposals for this semester.
            </div>
          </template>
          <template v-slot:cell(id)="data">
            <router-link :to="{ name: 'proposalDetail', params: { id: data.item.id } }">{{ data.item.id }}</router-link>
          </template>
          <template v-slot:cell(pi)="data">
            <div v-for="pi in getPrincipleInvestigators(data.item)" :key="pi.username">
              {{ pi.username }}
            </div>
          </template>
          <template v-slot:cell(coi)="data">
            {{ getNumberOfCoInvestigators(data.item) }}
          </template>
        </b-table>
        <custom-pagination
          v-if="!isBusy"
          table-id="proposals-table"
          :per-page="queryParams.limit"
          :total-rows="data.count"
          :current-page="currentPage"
          @pageChange="onPageChange"
          @limitChange="onLimitChange"
        ></custom-pagination>
      </b-col>
    </b-row>
  </b-col>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { paginationAndFilteringMixin } from '@/components/util/paginationMixins.js';
import CustomPagination from '@/components/util/CustomPagination.vue';

export default {
  name: 'ProposalList',
  filters: {
    pluralize: function(count, singleSuffix, multipleSuffix) {
      return count === 1 ? singleSuffix : multipleSuffix;
    }
  },
  components: { CustomPagination },
  mixins: [paginationAndFilteringMixin],
  data: function() {
    return {
      calls: { results: [], count: 0 },
      semesters: { results: [], count: 0 },
      proposalActiveOptions: [
        { value: '', text: 'All' },
        { value: 'False', text: 'Inactive' },
        { value: 'True', text: 'Active' }
      ],
      proposalsFilters: {
        active: '',
        semester: ''
      },
      fields: [
        { key: 'id', label: 'Proposal' },
        { key: 'title', label: 'Title' },
        { key: 'pi', label: 'Principal Investigator' },
        { key: 'coi', label: 'Co-Investigators' }
      ]
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    isStaff: function() {
      return this.$store.state.profile.is_staff ? true : false;
    },
    semesterAdminTableSemester: function() {
      return _.get(this.semesters, ['results', 0], {});
    },
    semesterOptions: function() {
      let options = [{ value: '', text: '--------' }];
      for (let semester of this.semesters.results) {
        options.push({ value: semester.id, text: semester.id });
      }
      return options;
    },
    userProposals: function() {
      return this.$store.state.profile.proposals;
    }
  },
  created: function() {
    this.getSemesters();
    this.getCalls();
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/proposals/';
    },
    initializeDefaultQueryParams: function() {
      const defaultQueryParams = {
        active: 'True',
        semester: '',
        limit: 50,
        offset: 0
      };
      return defaultQueryParams;
    },
    getSemesters: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/semesters/?ordering=-start&limit=1000'
      }).done(function(response) {
        that.semesters = response;
      });
    },
    getCalls: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/calls/'
      }).done(function(response) {
        that.calls = response;
      });
    },
    getPrincipleInvestigators: function(proposal) {
      return _.get(proposal, 'pis', []);
    },
    getNumberOfCoInvestigators: function(proposal) {
      return _.get(proposal, 'coi_count', 0);
    }
  }
};
</script>
