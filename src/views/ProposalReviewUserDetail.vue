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
        <b-breadcrumb-item active>My Comments</b-breadcrumb-item>
      </b-breadcrumb>

      <b-alert v-for="error in apiValidationErrors.non_field_errors" :key="error" variant="danger" dismissible show> {{ error }}</b-alert>
      <b-alert v-for="error in apiValidationErrors.id" :key="error" variant="danger" dismissible show> {{ error }}</b-alert>

      <b-card :title="data.title" sub-title="Abstract">
        <b-card-text>
          {{ data.abstract || 'N/A' }}
        </b-card-text>

        <b-card-text>
        <b-link :href="data.pdf_url" :disabled="data.pdf_url === null" :title="data.pdf_url === null ? 'PDF (not found)' : 'PDF'">
        PDF
        <b-icon
          :icon="data.pdf_url === null ? 'file-x-fill' : 'file-pdf-fill'"
          :variant="data.pdf_url == null ? 'danger' : 'primary'"
        >
        </b-icon>
        </b-link>
        </b-card-text>

      <b-card-text>
        <h5>Technical Review</h5>
        <p>{{ data.technical_review || 'N/A' }}</p>
      </b-card-text>

        <b-card-text>
        <h5>Review</h5>
        <b-form @submit="onSubmit" >
          <basic-custom-field
            v-model="form.comments"
            :errors="apiValidationErrors.comments"
            placeholder="Enter your comments here..."
            label="Comments"
            field="comments"
            field-type="textarea"
          ></basic-custom-field>

          <basic-custom-field
            v-model="form.grade"
            :errors="apiValidationErrors.grade"
            label="Grade"
            field="grade"
            type="number"
            min="0"
            max="10"
            step="0.01"
            description="Between 0.00 and 10.00, where higher is better. E.g. 9.25"
            placeholder="Enter grade"
          ></basic-custom-field>

          <basic-custom-field
            v-model="form.finished"
            field-type="checkbox"
            field="finished"
            description="Check when you have finished making changes."
            :errors="apiValidationErrors.finished"
            checkbox-option-label="Finished"
            label=""
            value=true
          ></basic-custom-field>

          <b-button type="submit" variant="primary" :disabled="submitDisabled">Save</b-button>
        </b-form>
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
  name: 'ProposalReviewUserDetail',
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
      form: {
        comments: "",
        grade: null,
        finished: false
      },
      submitDisabled: false,
      apiValidationErrors: {}
    };
  },
  watch: {
    data: function(data) {
      this.form.comments = data.my_review?.comments;
      this.form.grade = data.my_review?.grade;
      this.form.finished = data.my_review?.finished;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/scienceapplication-reviews/' + this.id;
    },
    onSubmit(event) {
      event.preventDefault();
      this.submitDisabled = true

      const that = this;

      $.ajax({
        method: this.data.my_review === null ? "POST" : "PUT",
        url: this.initializeDataEndpoint() + "/my-review",
        data: JSON.stringify(this.form),
        dataType: "json",
        processData: "false",
        contentType: "application/json",
        cache: false
      }).done(function(response) {
        that.apiValidationErrors = {};

        that.data.my_review = response;
        that.$store.commit("addMessage", { text: "Saved", variant: "success" });

        that.dataNotFound = false;

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
        that.submitDisabled = false;
      });

    },
  }
};
</script>
