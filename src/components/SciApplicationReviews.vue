<template>
    <b-container>
      <b-table class="text-center" id="sciapplication-reviews-table" :items="data.results" :fields="fields" :busy="isBusy" show-empty striped responsive>
        <template v-slot:table-busy>
          <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading...</div>
        </template>
        <template v-slot:empty>
          <div>
            No applications to review.
          </div>
        </template>
        <template v-slot:head(mean_grade)="data">
            <span v-b-tooltip.hover title="Mean of all grades from panelists for this proposal.">{{ data.label }}<sup><b-icon icon="question-octagon" ></b-icon></sup></span>
        </template>

        <template v-slot:head(is_primary_reviewer)="data">
            <span v-b-tooltip.hover title="As the primary reviewer of a proposal, you can summarize all other panel reviews.">{{ data.label }}<sup><b-icon icon="question-octagon" ></b-icon></sup></span>
        </template>

        <template v-slot:head(is_secondary_reviewer)="data">
            <span v-b-tooltip.hover title="As the secondary reviewer of a proposal, you can also summarize all other panel reviews.">{{ data.label }}<sup><b-icon icon="question-octagon" ></b-icon></sup></span>
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

        <template v-slot:cell(mean_grade)="data">
            <b-icon
              v-if="data.item.status === 'AWAITING_REVIEWS'"
              icon="eye-slash-fill"
              variant="dark"
              size="2em"
              title="Hidden until panel discussions have started"
            ></b-icon>
            <span v-else>{{ data.item.mean_grade || '-'  }}</span>
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
              :to="{ name: 'proposalReviewPanelDetail', params: { id: data.item.id } }"
            ></b-avatar>
        </template>

        <template v-slot:cell(review)="data">
            <b-avatar
              icon="person-lines-fill"
              variant="primary"
              size="2em"
              title="Make changes to your review."
              :to="{ name: 'proposalReviewUserDetail', params: { id: data.item.id } }"
            >
            </b-avatar>
        </template>

        <template v-slot:cell(my_review.finished)="data">
            <b-icon v-if="data.item.my_review && data.item.my_review.finished" icon="check-circle-fill" variant="success"></b-icon>
        </template>

        <template v-slot:cell(is_primary_reviewer)="data">
            <b-icon v-if="data.item.is_primary_reviewer" icon="check-circle-fill" variant="success"></b-icon>
        </template>

        <template v-slot:cell(is_secondary_reviewer)="data">
            <b-icon v-if="data.item.is_secondary_reviewer" icon="check-circle-fill" variant="success"></b-icon>
        </template>

      </b-table>

      <ocs-pagination
        v-if="!isBusy"
        table-id="sciapplication-reviews-table"
        :per-page="queryParams.limit"
        :total-rows="data.count"
        :current-page="currentPage"
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
        { key: 'title', label: 'Proposal', tdClass: 'align-middle' },
        { key: 'semester', label: 'Semester', tdClass: 'align-middle' },
        { key: 'science_category', label: 'Category', tdClass: 'align-middle' },
        { key: 'pdf', label: 'PDF', tdClass: 'align-middle' },
        { key: 'mean_grade', label: 'Mean Grade', tdClass: 'align-middle' },
        { key: 'panel_review', label: 'Panel Reviews', tdClass: 'align-middle' },
        { key: 'review', label: 'Review', tdClass: 'align-middle' },
        { key: 'my_review.grade', label: 'Grade', tdClass: 'align-middle' },
        { key: 'my_review.finished', label: 'Finished', tdClass: 'align-middle' },
        { key: 'is_primary_reviewer', label: 'Primary', tdClass: 'align-middle' },
        { key: 'is_secondary_reviewer', label: 'Secondary', tdClass: 'align-middle' }
      ]
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/scienceapplication-reviews/';
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
