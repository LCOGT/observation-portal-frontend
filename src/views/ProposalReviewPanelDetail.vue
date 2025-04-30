<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
    <b-container>
      <b-breadcrumb>
        <b-breadcrumb-item :to="{ name: 'proposalReviewDashboard'}">
          <b-icon icon="house-fill" scale="1.25" shift-v="1.25" aria-hidden="true"></b-icon>
          Proposal Reviews
          </b-breadcrumb-item>
        <b-breadcrumb-item active>Panel Comments</b-breadcrumb-item>
      </b-breadcrumb>

      <b-alert v-for="error in apiValidationErrors.non_field_errors" :key="error" variant="danger" dismissible show> {{ error }}</b-alert>
      <b-alert v-for="error in apiValidationErrors.id" :key="error" variant="danger" dismissible show> {{ error }}</b-alert>

      <b-card :title="data.title" sub-title="Abstract">
        <b-card-text>
          {{ data.abstract || 'N/A' }}
        </b-card-text>

        <b-card-text>
        <b-row>
        <b-col>
        <b-link :href="data.pdf_url" :disabled="data.pdf_url === null" :title="data.pdf_url === null ? 'PDF (not found)' : 'PDF'">
        PDF
        <b-icon
          :icon="data.pdf_url === null ? 'file-x-fill' : 'file-pdf-fill'"
          :variant="data.pdf_url == null ? 'danger' : 'primary'"
        >
        </b-icon>
        </b-link>
        </b-col>

        <b-col>
        <b>Mean:</b> {{ data.mean_grade || '-' }}
        </b-col>

        <b-col>
        <b>Completed: </b>
        <span v-if="data.completed"><b-icon title="All panelists have finished their reviews" icon="check-circle-fill" variant="success"></b-icon></span>
        <span v-else><b-icon title="Some reviews are still pending from panelists" icon="stopwatch-fill" variant="warning"></b-icon></span>
        </b-col>

        </b-row>
      </b-card-text>

      <b-card-text>
        <h5>Technical Review</h5>
        <p>{{ data.technical_review || 'N/A' }}</p>
      </b-card-text>

      <b-card-text>
      <h5>Primary reviewer’s summary (for the PI)</h5>
      <b-form @submit="updateSummary" >
        <basic-custom-field
          v-model="form.summary"
          :errors="apiValidationErrors.summary"
          :placeholder="data.can_summarize ? 'Enter your summary here...' : 'You do not have permissions to edit this.'"
          :label="null"
          field="summary"
          field-type="textarea"
          :disabled="!data.can_summarize"
        ></basic-custom-field>

        <b-button v-if="data.can_summarize" type="submit" variant="primary" :disabled="updatingSummary">Save</b-button>

      </b-form>
      </b-card-text>

      <b-card-text>
      <h5>Secondary reviewer’s notes on the TAC’s discussion</h5>
      <b-form @submit="updateSecondaryNotes" >
        <basic-custom-field
          v-model="form.secondary_notes"
          :errors="apiValidationErrors.secondary_notes"
          :placeholder="data.can_edit_secondary_notes ? 'Enter your notes here...' : 'You do not have permissions to edit this.'"
          :label="null"
          field="secondary_notes"
          field-type="textarea"
          :disabled="!data.can_edit_secondary_notes"
        ></basic-custom-field>

        <b-button v-if="data.can_edit_secondary_notes" type="submit" variant="primary" :disabled="updatingSecondaryNotes">Save</b-button>

      </b-form>
      </b-card-text>

      <b-card-text>
      <h5>Panel Reviews</h5>
      <b-table striped hover :items="userReviews" :fields="userReviewFields">
        <template v-slot:cell(comments)="row">
          <b-link href="#"><b-icon @click="row.toggleDetails" v-b-tooltip.hover title="Toggle Comments" icon="arrows-expand"></b-icon></b-link>
        </template>
        <template #row-details="row">
          <b-card border-variant="primary" header="Comments" header-bg-variant="primary" header-text-variant="white">
            <b-card-text class="text-left">{{ row.item.comments || 'N/A' }}</b-card-text>
          </b-card>
        </template>

        <template v-slot:cell(finished)="data">
            <b-icon v-if="data.item.finished" icon="check-circle-fill" variant="success"></b-icon>
        </template>
      </b-table>

      </b-card-text>

      </b-card>
    </b-container>
  </ocs-data-loader>
</template>
<script>
import $ from 'jquery';

import { OCSMixin } from 'ocs-component-lib';

import NotFound from '@/components/NotFound.vue';
import BasicCustomField from '@/components/util/BasicCustomField.vue';

export default {
  name: 'ProposalReviewPanelDetail',
  components: {
    NotFound,
    BasicCustomField
  },
  mixins: [OCSMixin.getDataMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      data: {
        user_reviews: [],
      },
      userReviewFields: [
        {key: "comments", label: ""},
        {key: "grade", label: "Grade", sortable: true},
        "finished"
      ],
      form: {
        summary: "",
        secondary_notes: "",
      },
      updatingSummary: false,
      apiValidationErrors: {}
    };
  },
  watch: {
    data: function(data) {
      this.form.summary = data.summary;
      this.form.secondary_notes = data.secondary_notes
    }
  },
  computed: {
    userReviews: function() {
      return this.data.user_reviews.map(item => ({
        ...item,
        _showDetails: true
      }));
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/scienceapplication-reviews/' + this.id;
    },
    updateSummary(event) {
      event.preventDefault();
      this.updatingSummary = true

      const that = this;

      $.ajax({
        method: "PUT",
        url: this.initializeDataEndpoint() + "/summary",
        data: JSON.stringify(this.form),
        dataType: "json",
        processData: "false",
        contentType: "application/json",
        cache: false
      }).done(function(response) {
        that.apiValidationErrors = {};

        that.data.summary = response;
        that.$store.commit("addMessage", { text: "Saved", variant: "success" });

      }).fail(function(response) {
        if (response.status === 400) {
          that.$store.commit("addMessage", { text: "There was an error with your submission.", variant: "danger" });
          that.apiValidationErrors = response.responseJSON;
        } else {
          that.$store.commit("addMessage", {
            text: "There was an unexpected error, please try again later.",
            variant: "danger"
          });
        }
      }).always(function() {
        that.updatingSummary = false;
      });
    },
    updateSecondaryNotes(event) {
      event.preventDefault();
      this.updatingSecondaryNotes = true

      const that = this;

      $.ajax({
        method: "PUT",
        url: this.initializeDataEndpoint() + "/secondary-notes",
        data: JSON.stringify(this.form),
        dataType: "json",
        processData: "false",
        contentType: "application/json",
        cache: false
      }).done(function(response) {
        that.apiValidationErrors = {};

        that.data.secondary_notes = response;
        that.$store.commit("addMessage", { text: "Saved", variant: "success" });

      }).fail(function(response) {
        if (response.status === 400) {
          that.$store.commit("addMessage", { text: "There was an error with your submission.", variant: "danger" });
          that.apiValidationErrors = response.responseJSON;
        } else {
          that.$store.commit("addMessage", {
            text: "There was an unexpected error, please try again later.",
            variant: "danger"
          });
        }
      }).always(function() {
        that.secondaryNotes = false;
      });
    },
  }
};
</script>
