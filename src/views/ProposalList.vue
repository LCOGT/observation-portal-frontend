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
          <p>
            Admin only:
            <router-link :to="{ name: 'semesterAdminTable', params: { id: semesterAdminTableSemester.id } }">View All Proposals</router-link>
          </p>
        </template>
      </b-col>
      <b-col md="3">
        <router-link :to="{ name: 'apply' }" class="btn btn-outline-primary btn-block"><i class="fa fa-edit fa-fw"></i> Submit Proposal</router-link>
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
        <b-form inline class="p-1" @submit="onSubmit">
          <b-form-group id="input-group-proposal-active" label="Proposal is active:" label-for="input-proposal-active">
            <b-form-select id="input-proposal-active" v-model="queryParams.active" class="mx-1" :options="proposalActiveOptions" />
          </b-form-group>
          <b-form-group id="input-group-proposal-semester" label="Semester:" label-for="input-proposal-semester">
            <b-form-select id="input-proposal-semester" v-model="queryParams.semester" class="mx-1" :options="semesterOptions"></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-proposal-tags" label="Tags:" label-for="input-proposal-tags">
            <b-form-select
              id="select-proposal-tags"
              v-model="selectedTags"
              class="mx-1"
              :options="tagOptions"
              multiple
              :select-size="tagsSelectSize"
            />
          </b-form-group>
          <b-button type="submit" class="mx-1" variant="outline-primary" :disabled="isBusy">Filter</b-button>
        </b-form>
        <b-table id="proposals-table" :items="data.results" :fields="fields" :busy="isBusy" show-empty striped responsive>
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
        <ocs-pagination
          v-if="!isBusy"
          table-id="proposals-table"
          :per-page="queryParams.limit"
          :total-rows="data.count"
          :current-page="currentPage"
          @pageChange="onPageChange"
          @limitChange="onLimitChange"
        ></ocs-pagination>
      </b-col>
    </b-row>
  </b-col>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';
import { OCSMixin } from 'ocs-component-lib';

import { clearAndSetErrorsMixin } from '@/components/util/utilMixins.js';

export default {
  name: 'ProposalList',
  filters: {
    pluralize: function(count, singleSuffix, multipleSuffix) {
      return count === 1 ? singleSuffix : multipleSuffix;
    }
  },
  mixins: [OCSMixin.paginationAndFilteringMixin, clearAndSetErrorsMixin],
  data: function() {
    return {
      calls: { results: [], count: 0 },
      semesters: { results: [], count: 0 },
      proposalActiveOptions: [
        { value: '', text: 'All' },
        { value: 'False', text: 'False' },
        { value: 'True', text: 'True' }
      ],
      tagOptions: [{ value: '', text: '-----' }],
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
    },
    selectedTags: {
      // The multi select represents the tags as strings in an array, but the observation portal
      // API expects a string with a commas separated list of tags
      get: function() {
        return _.split(this.queryParams.tags, ',');
      },
      set: function(newValue) {
        this.queryParams.tags = _.join(newValue, ',');
      }
    },
    tagsSelectSize: function() {
      return Math.min(this.tagOptions.length, 2);
    }
  },
  created: function() {
    this.getSemesters();
    this.getCalls();
    this.getTagOptions();
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/proposals/';
    },
    initializeDefaultQueryParams: function() {
      const defaultQueryParams = {
        active: 'True',
        semester: '',
        tags: '',
        limit: 50,
        offset: 0
      };
      return defaultQueryParams;
    },
    getTagOptions: function() {
      $.ajax({
        url: this.observationPortalApiUrl + '/api/proposals/tags/'
      }).done(response => {
        let options = [{ value: '', text: '-----' }];
        for (let tag of response) {
          options.push({ value: tag, text: tag });
        }
        this.tagOptions = options;
      });
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
        url: this.observationPortalApiUrl + '/api/calls/?only_open=true'
      }).done(function(response) {
        that.calls = response;
      });
    },
    getPrincipleInvestigators: function(proposal) {
      return _.get(proposal, 'pis', []);
    },
    getNumberOfCoInvestigators: function(proposal) {
      return _.get(proposal, 'coi_count', 0);
    },
    onSuccessfulDataRetrieval: function() {
      this.clearErrors();
    },
    onErrorRetrievingData: function(response) {
      this.setErrorsOnFailedAJAXCall(response);
    }
  }
};
</script>
