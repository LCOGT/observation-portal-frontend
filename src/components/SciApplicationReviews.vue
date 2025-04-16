<template>
    <b-container>
      <b-table
        class="text-center"
        id="sciapplication-reviews-table"
        :items="data.results" :fields="fields"
        :busy="isBusy"
        :sort-by="getSortByFromQueryParams()"
        :sort-desc="getSortDescFromQueryParams()"
        @sort-changed="sortingChanged"
        show-empty
        striped
        responsive
        no-local-sorting
        >
        <template v-slot:table-busy>
          <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
        </template>
        <template v-slot:empty>
          <div>
            No applications to review.
          </div>
        </template>

        <template v-slot:cell(title)="row">
            <b-button variant="link" @click="row.toggleDetails" v-b-tooltip.hover title="Toggle Abstract" >{{ row.item.title }}</b-button>
        </template>

        <template #row-details="row">
          <b-card border-variant="primary" header="Abstract" header-bg-variant="primary" header-text-variant="white">
            <b-card-text class="text-left">{{ row.item.abstract || 'N/A' }}</b-card-text>
          </b-card>
        </template>

        <template v-slot:cell(pdf)="data">
            <div v-if="data.item.pdf_url !== null">
              <b-avatar
                icon="file-text-fill"
                variant="primary"
                size="2em"
                v-b-tooltip.hover
                title="PDF"
                :href="data.item.pdf_url"
              >
              </b-avatar>
            </div>
            <div v-else> - </div>
        </template>

        <template v-slot:cell(panel_review)="data">
            <b-icon
              v-if="data.item.status === 'AWAITING_REVIEWS'"
              icon="eye-slash-fill"
              variant="dark"
              size="2em"
              title="Hidden until panel discussions have started"
            ></b-icon>
            <b-avatar
              v-else
              badge
              badge-bottom badge-offset="-2px"
              :badge-variant="data.item.completed ? 'success' : 'warning'"
              icon="people-fill"
              variant="primary"
              size="2em"
              title="View all panel reviews."
              :to="{ name: 'proposalReviewPanelDetail', params: { id: `${data.item.id}` } }"
            ></b-avatar>
        </template>

        <template v-slot:cell(review)="data">
            <b-avatar
              icon="person-lines-fill"
              variant="primary"
              size="2em"
              title="Make changes to your review."
              :to="{ name: 'proposalReviewUserDetail', params: { id: `${data.item.id}` } }"
            >
            </b-avatar>
        </template>

        <template v-slot:head(is_primary_reviewer)="data">
            <span v-b-tooltip.hover title="As the primary reviewer of a proposal, you can summarize all other panel reviews.">{{ data.label }}</span>
        </template>

        <template v-slot:cell(is_primary_reviewer)="data">
            <b-icon v-if="data.item.is_primary_reviewer" icon="check-circle-fill" variant="success"></b-icon>
        </template>

        <template v-slot:head(is_secondary_reviewer)="data">
            <span v-b-tooltip.hover title="As the secondary reviewer of a proposal, you can also summarize all other panel reviews.">{{ data.label }}</span>
        </template>

        <template v-slot:cell(is_secondary_reviewer)="data">
            <b-icon v-if="data.item.is_secondary_reviewer" icon="check-circle-fill" variant="success"></b-icon>
        </template>

        <template v-slot:cell(long_term)="data">
            <b-icon v-if="data.item.long_term" icon="check-circle-fill" variant="success"></b-icon>
        </template>

        <template v-slot:head(total_requested_time_0m4)="data">
            <span v-b-tooltip.hover title="Total time requested">{{ data.label }}</span>
        </template>
      </b-table>

      <ocs-pagination
        v-if="!isBusy"
        table-id="sciapplication-reviews-table"
        :per-page="queryParams.limit"
        :total-rows="data.count"
        :current-page="currentPage"
        :display-per-page-dropdown="true"
        @pageChange="onPageChange"
        @limitChange="onLimitChange"
      >
      </ocs-pagination>
    </b-container>
</template>
<script>
import { OCSMixin } from 'ocs-component-lib';

import { clearAndSetErrorsMixin } from '@/components/util/utilMixins.js';

export default {
  name: 'SciApplicationReviews',
  mixins: [OCSMixin.paginationAndFilteringMixin, clearAndSetErrorsMixin],
  data: function() {
    return {
      fields: [
        { key: 'title', label: 'Proposal', tdClass: 'align-middle', sortable: true, sortKey: 'science_application__title' },
        { key: 'semester', label: 'Semester', tdClass: 'align-middle', sortable: true, sortKey: 'science_application__call__semester__start' },
        { key: 'science_category', label: 'Category', tdClass: 'align-middle', sortable: true },
        { key: 'pdf', label: 'PDF', tdClass: 'align-middle' },
        { key: 'panel_review', label: 'Panel Reviews', tdClass: 'align-middle' },
        { key: 'review', label: 'Review', tdClass: 'align-middle' },
        { key: 'is_primary_reviewer', label: 'Primary', tdClass: 'align-middle' },
        { key: 'is_secondary_reviewer', label: 'Secondary', tdClass: 'align-middle' },
        { key: 'long_term', label: 'Long Term', tdClass: 'align-middle' },
        { key: 'total_requested_time_0m4', label: '0m4', tdClass: 'align-middle' },
        { key: 'total_requested_time_1m0', label: '1m0', tdClass: 'align-middle' },
        { key: 'total_requested_time_2m0', label: '2m0', tdClass: 'align-middle' }
      ]
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  methods: {
    initializeDefaultQueryParams: function() {
      return {
        ordering: '',
        offset: 0,
        limit: 10
      }
    },
    getSortByFromQueryParams: function() {
      return this.queryParams.ordering.replace("-", "");
    },
    getSortDescFromQueryParams: function() {
      return this.queryParams.ordering.startsWith("-");
    },
    getOrderingFromSort: function(sortDesc, sortBy) {
      // Return what the `ordering` value in the query params should be given the sort order and the sort field
      let ordering = '';
      if (sortBy) {
        ordering = sortDesc ? `-${sortBy}` : sortBy;
      }
      return ordering;
    },
    sortingChanged: function(ctx) {
      this.queryParams.ordering = this.getOrderingFromSort(ctx.sortDesc, ctx.sortBy);
      this.goToFirstPage();
      this.update();
    },
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/scienceapplication-reviews/';
    },
    onSuccessfulDataRetrieval: function() {
      for (const item of this.data.results) {
        item.total_requested_time_0m4 = 0;
        item.total_requested_time_1m0 = 0;
        item.total_requested_time_2m0 = 0;

        for (const [key, value] of Object.entries(item.total_requested_time_inst_code)) {
          if (key.toLowerCase().startsWith("0m4")) {
            item.total_requested_time_0m4 += value;
          }

          if (key.toLowerCase().startsWith("1m0")) {
            item.total_requested_time_1m0 += value;
          }

          if (key.toLowerCase().startsWith("2m0")) {
            item.total_requested_time_2m0 += value;
          }
        }
      }
      this.clearErrors();
    },
    onErrorRetrievingData: function(response) {
      this.setErrorsOnFailedAJAXCall(response);
    },
    updateRoute: function() {
      return;
    }
  }
};
</script>
