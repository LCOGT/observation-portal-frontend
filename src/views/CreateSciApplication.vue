<template>
  <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <b-row>
      <b-col>
        <b-breadcrumb class="bg-light">
          <template>
            <b-breadcrumb-item :to="{ name: 'apply' }">
              Calls for Proposals
            </b-breadcrumb-item>
            <b-breadcrumb-item active> Submit proposal </b-breadcrumb-item>
          </template>
        </b-breadcrumb>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="9" cols="12">
        <p>{{ applicationDescription }}</p>
        <template v-if="data.proposal_type !== 'DDT'">
          <p>
            Deadline: <strong>{{ data.deadline | formatDate }}</strong> ({{ data.deadline | timeFromNow }})
          </p>
        </template>
        <p>{{ data.eligibility }}</p>
        <!-- TODO: Display form errors -->
        <b-form>
          <b-form-group id="input-group-title" label="Title" label-for="input-title">
            <b-form-input id="input-title" v-model="sciApp.title" required placeholder="Title"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-abstract" label="Abstract" label-for="input-abstract">
            <b-form-textarea id="textarea-default" v-model="sciApp.abstract" placeholder="Limit 500 words" rows="8"></b-form-textarea>
          </b-form-group>
          <template v-if="data.proposal_type === 'COLAB'">
            <b-form-group id="input-group-tac-rank" label="Rank" label-for="input-tac-rank">
              <b-form-input id="input-tac-rank" v-model="sciApp.tac_rank" type="number" min="0"></b-form-input>
            </b-form-group>
          </template>
          <!-- TODO: There was a {% if form.pi %} that is represented by this template, but I'm not sure if I need it anymore -->
          <template>
            <h5>Principal Investigator</h5>
            <div class="help-block">
              <strong
                >If you are the principal investigator on this proposal, please ensure your information is correct and up to date before proceeding.
                You can view and update your details on your <router-link :to="{ name: 'profile' }">profile</router-link> page.
              </strong>
            </div>
            <div class="help-block">
              The first name of the principal investigator will be presented to reviewers as an initial.
            </div>
            <b-table-lite :items="[{}]" :fields="userTableFields">
              <template #cell(email)>
                <b-form-group id="input-group-pi" label="Email" label-for="input-pi" label-sr-only>
                  <b-form-input id="input-pi" v-model="sciApp.pi" type="email" placeholder="Email"></b-form-input>
                </b-form-group>
              </template>
              <template #cell(firstName)>
                <b-form-group id="input-group-pi-first-name" label="First Name" label-for="input-pi-first-name" label-sr-only>
                  <b-form-input id="input-pi-first-name" v-model="sciApp.pi_first_name" placeholder="First Name"></b-form-input>
                </b-form-group>
              </template>
              <template #cell(lastName)>
                <b-form-group id="input-group-pi-last-name" label="Last Name" label-for="input-pi-last-name" label-sr-only>
                  <b-form-input id="input-pi-last-name" v-model="sciApp.pi_last_name" placeholder="Last Name"></b-form-input>
                </b-form-group>
              </template>
              <template #cell(institution)>
                <b-form-group id="input-group-pi-institution" label="Institution" label-for="input-pi-institution" label-sr-only>
                  <b-form-input id="input-pi-institution" v-model="sciApp.pi_institution" placeholder="Institution"></b-form-input>
                </b-form-group>
              </template>
            </b-table-lite>
          </template>
          <h5>Co-investigators</h5>
          <div class="help-block">
            <!-- TODO: Translate this -->
            Add the details of co-investigators on this proposal. First names will be presented as initials.
          </div>
          <b-table-lite :items="sciApp.coinvestigator_set" :fields="userTableFields">
            <template #cell(email)="data">
              <b-form-group :id="'input-group-coi-email' + data.index" label="Email" :label-for="'input-coi-email' + data.index" label-sr-only>
                <b-form-input
                  :id="'input-coi-email' + data.index"
                  v-model="sciApp.coinvestigator_set[data.index].email"
                  type="email"
                  placeholder="Email"
                ></b-form-input>
              </b-form-group>
            </template>
            <template #cell(firstName)="data">
              <b-form-group
                :id="'input-group-coi-first-name' + data.index"
                label="First Name"
                :label-for="'input-coi-first-name' + data.index"
                label-sr-only
              >
                <b-form-input
                  :id="'input-coi-first-name' + data.index"
                  v-model="sciApp.coinvestigator_set[data.index].first_name"
                  placeholder="First Name"
                ></b-form-input>
              </b-form-group>
            </template>
            <template #cell(lastName)="data">
              <b-form-group
                :id="'input-group-coi-last-name' + data.index"
                label="Last Name"
                :label-for="'input-coi-last-name' + data.index"
                label-sr-only
              >
                <b-form-input
                  :id="'input-coi-last-name' + data.index"
                  v-model="sciApp.coinvestigator_set[data.index].last_name"
                  placeholder="Last Name"
                ></b-form-input>
              </b-form-group>
            </template>
            <template #cell(institution)="data">
              <b-form-group
                :id="'input-group-coi-institution' + data.index"
                label="Institution"
                :label-for="'input-coi-institution' + data.index"
                label-sr-only
              >
                <b-form-input
                  :id="'input-coi-institution' + data.index"
                  v-model="sciApp.coinvestigator_set[data.index].institution"
                  placeholder="Institution"
                ></b-form-input>
              </b-form-group>
              <b-link v-if="data.index > 0" class="float-right" href="#" title="Delete CoInvestigator" @click="removeCoInvestigator(data.index)">
                <span class="text-danger mx-auto"><i class="far fa-trash-alt"></i></span>
              </b-link>
            </template>
          </b-table-lite>
          <b-link href="#" @click="addCoInvestigator"><i class="fas fa-plus"></i> Add another</b-link>
          <br />
          <!-- TODO: There was a {% if timerequest_form %} for this template -->
          <template>
            <h5>Observing Budget</h5>
            <!-- TODO: Translate this block -->
            <div class="help-block">
              Requested observing time in hours for the semester. Time for
              <a href="https://lco.global/documentation/special-scheduling-modes/" target="_blank">Rapid Response mode</a>
              (within 15 minutes of submission) and
              <a href="https://lco.global/documentation/special-scheduling-modes/" target="_blank">Time-Critical mode</a> observations must be
              requested separately.
            </div>
            <!-- TODO: {% bootstrap_formset_errors timerequest_form %} -->
            <b-table-lite :items="sciApp.timerequest_set" :fields="timeRequestFields" class="mb-1">
              <template #head(semester)>
                <span v-if="numberOfEligibleSemesters !== 1">Semester</span>
                <span v-else></span>
              </template>
              <template #cell(semester)="timeRequest">
                <div v-if="numberOfEligibleSemesters !== 1">
                  <b-form-select v-model="sciApp.timerequest_set[timeRequest.index].semester" :options="semesterOptions"></b-form-select>
                </div>
              </template>
              <template #cell(instrument)="instrument">
                <b-form-select v-model="sciApp.timerequest_set[instrument.index].instrument" :options="instrumentOptions"></b-form-select>
              </template>
              <template #cell(standardTime)="standardTime">
                <b-form-input id="input-std-time" v-model="sciApp.timerequest_set[standardTime.index].std_time" type="number" min="0"></b-form-input>
              </template>
              <template #cell(rapidResponse)="rapidResponse">
                <b-form-input id="input-rr-time" v-model="sciApp.timerequest_set[rapidResponse.index].rr_time" type="number" min="0"></b-form-input>
              </template>
              <template #cell(timeCritical)="timeCritical">
                <b-form-input id="input-tc-time" v-model="sciApp.timerequest_set[timeCritical.index].tc_time" type="number" min="0"></b-form-input>
                <b-link
                  v-if="timeCritical.index > 0"
                  class="float-right"
                  href="#"
                  title="Delete time request"
                  @click="removeTimeRequest(timeCritical.index)"
                >
                  <span class="text-danger mx-auto"><i class="far fa-trash-alt"></i></span>
                </b-link>
              </template>
            </b-table-lite>
            <b-link href="#" @click="addTimeRequest"><i class="fas fa-plus"></i> Add another</b-link>
            <br />
            <!-- TODO: This had a {% if form.pdf %} -->
            <template>
              <h5>Upload PDF</h5>
              <div class="help-block">
                <!-- Sci Proposal PDF description -->
                <template v-if="data.proposal_type === 'SCI'">
                  <p>
                    For the remainder of your proposal, please upload a single pdf file that includes the following sections:
                  </p>
                  <ul>
                    <li>
                      <strong>Science Justification.</strong> This section must provide appropriate background information and state the goals of the
                      project. The results of any previous time allocated for this project should be discussed. Pertinent references should be
                      included. Figures may be embedded or appended, but the text itself should be limited to approximately the equivalent of a single
                      page.
                    </li>
                    <li>
                      <strong>Experimental Design.</strong> This section should describe the strategy of your observing program, including the
                      characteristics of your targets, what measurements you will make from the data, and what additional work you will do to address
                      your science goals. If your targets are known, list them and their expected brightnesses. This section must include an
                      explanation of your observing budget, in which you justify the instruments, the exposure times, and the total number of hours
                      you’re requesting. You must provide independent justification for requests for Rapid Response or Time Critical observations. If
                      these are not adequately justified, they will not be granted. If unusual scheduling constraints might impact your success,
                      identify them.
                    </li>
                    <li>
                      <strong>Report of related programs on other telescopes.</strong>
                    </li>
                    <li>
                      <strong>Report on use of LCO in the past 3 years.</strong>
                    </li>
                    <li><strong>List of the authors’ related publications.</strong>You may include up to 10 publications</li>
                  </ul>
                  <p>The format of the pdf file is subject to the following constraints.</p>
                  <ul>
                    <li>The font size must be 11 points or larger.</li>
                    <li>Margins on all edges must be at least 1 inch.</li>
                    <li>Line spacing must be no denser than 6 lines per inch.</li>
                    <li>The file size must be under 10MB.</li>
                    <li>The recommended length is 6 pages.</li>
                  </ul>
                </template>
                <!-- KEY proposal PDF description -->
                <template v-if="data.proposal_type === 'KEY'">
                  <p>
                    For the remainder of your proposal, please upload a single pdf file that includes the sections listed below. Consult the Call for
                    Key Projects for information on the sections (e.g. Plan for management) that are unique to key projects.
                  </p>
                  <ul>
                    <li>
                      <strong>Science Justification.</strong> This section must provide appropriate background information and state the goals of the
                      project. The results of any previous time allocated for this project should be discussed. Pertinent references should be
                      included. Figures may be embedded or appended, but the text itself should be limited to approximately the equivalent of two
                      pages.
                    </li>
                    <li>
                      <strong>Experimental Design.</strong> This section should describe the strategy of your observing program, including the
                      characteristics of your targets, what measurements you will make from the data, and what additional work you will do to address
                      your science goals. If your targets are known, list them and their expected brightnesses. This section must include an
                      explanation of your observing budget, in which you justify the instruments, the exposure times, and the total number of hours
                      you’re requesting. You must provide independent justification for requests for Rapid Response or Time Critical observations. If
                      these are not adequately justified, they will not be granted. If unusual scheduling constraints might impact your success,
                      identify them.
                    </li>
                    <li>
                      <strong>Suitability for LCO's capabilities.</strong> This section should describe how the proposed study takes advantage of the
                      unique aspects of the LCO network and will yield a result that could not be obtained without LCO.
                    </li>
                    <li>
                      <strong>Plan for management of the entire scientific investigation.</strong>
                    </li>
                    <li>
                      <strong>Contributions brought by non-LCO participants.</strong> This section should describe what resources collaborators on the
                      key project team will commit to making the key project successful. Such resources could be access to other facilities,
                      additional time on the LCO network from their own institutions, computing resources, or scientist time.
                    </li>
                    <li>
                      <strong>Report of related programs on other telescopes.</strong>
                    </li>
                    <li>
                      <strong>Report on use of LCO in the past 3 years.</strong>
                    </li>
                    <li>
                      <strong>List of the authors’ related publications.</strong>
                    </li>
                  </ul>
                  <p>The format of the pdf file is subject to the following constraints.</p>
                  <ul>
                    <li>The font size must be 11 points or larger.</li>
                    <li>Margins on all edges must be at least 1 inch.</li>
                    <li>Line spacing must be no denser than 6 lines per inch.</li>
                    <li>The file size must be under 10MB.</li>
                    <li>The recommended length is 14 pages.</li>
                  </ul>
                </template>
                <!-- DDT proposal PDF description -->
                <template v-if="data.proposal_type === 'DDT'">
                  <p>
                    For the remainder of your proposal, please upload a single pdf file that includes the following sections:
                  </p>
                  <ul>
                    <li>
                      <strong>Science Justification.</strong> This section must provide appropriate background information and state the goals of the
                      observations. Pertinent references should be included. Figures may be embedded or appended, but the text itself should be
                      limited to approximately the equivalent of a single page.
                    </li>
                    <li>
                      <strong>Experimental Design.</strong> This section should describe the characteristics of your targets and what measurements you
                      will make from the data. If your targets are known, list them and their expected brightnesses. This section must also justify
                      the instruments, the exposure times, and the total time you’re requesting. You must provide independent justification for
                      requests for Rapid Response or Time Critical observations. If these are not adequately justified, they will not be granted. If
                      unusual scheduling constraints might impact your success, identify them.
                    </li>
                    <li>
                      <strong>Discretionary Time Justification.</strong> Discretionary time is reserved for observations of unforeseen
                      targets-of-opportunity. This section should describe why the proposal must be reviewed now, rather than as part of the normal
                      time allocation process for the upcoming semester. Additionally, describe through what affiliation you are entitled to request
                      DD time.
                    </li>
                  </ul>
                  <p>The format of the pdf file is subject to the following constraints.</p>
                  <ul>
                    <li>The font size must be 11 points or larger.</li>
                    <li>Margins on all edges must be at least 1 inch.</li>
                    <li>Line spacing must be no denser than 6 lines per inch.</li>
                    <li>The file size must be under 10MB.</li>
                    <li>The recommended length is 2 pages</li>
                  </ul>
                </template>
              </div>
              <b-form-file v-model="sciApp.pdf" accept=".pdf, .PDF"></b-form-file>
              <!-- TODO: Style this reset better -->
              <b-link v-if="sciApp.pdf !== null" href="#" @click="sciApp.pdf = null">Reset</b-link>
            </template>
          </template>
        </b-form>
        <a href="#">Back to top</a>
      </b-col>
      <b-col md="3" cols="12">
        <!-- TODO: translate this -->
        <h3>
          Application status:
          {{ sciApp.status }}
        </h3>
        <!-- TODO: Translate this block... -->
        <p>You may save your application and work on it later.</p>
        <p>Once you submit your application, you will no longer be able to edit it.</p>
        <!-- TODO: ...until here -->
        <!-- TODO: translate button text -->
        <b-button id="save" class="btn btn-info mr-md-4" :disabled="isBusyPostingApplication" @click="saveApplication">Save</b-button>
        <b-button
          id="submit"
          href="#"
          class="btn btn-success"
          :disabled="isBusyPostingApplication"
          @click="confirm(confirmSubmitMessage, submitApplication)"
          >Submit</b-button
        >
        <template v-if="updatingSciApp">
          <p>Previewing your submission will <strong>discard</strong> any pending edits.</p>
          <!-- TODO: translate button text  -->
          <p><router-link :to="{ name: 'SciApplicationDetail', params: { sciAppId: sciApp.id } }" class="btn btn-default">Preview</router-link></p>
          <!-- TODO: translate text  -->
          <p>Deleting a draft is an irreversible action.</p>
          <!-- TODO: translate button text  -->
          <p><b-button variant="danger" @click="deleteApplication">Delete</b-button></p>
        </template>
      </b-col>
    </b-row>
  </data-loader>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import DataLoader from '@/components/DataLoader.vue';
import { getDataMixin } from '@/components/util/getDataMixins.js';
import { confirmMixin } from '@/components/util/utilMixins.js';
import { formatDate, timeFromNow, copyObject } from '@/utils.js';

export default {
  name: 'CreateSciApplication',
  components: {
    DataLoader
  },
  filters: {
    formatDate: function(value) {
      // TODO: Update the format
      return formatDate(value);
    },
    timeFromNow: function(value) {
      // TODO: Probably need to tweak this
      return timeFromNow(value);
    },
    lowerCase: function(value) {
      return _.lowerCase(value);
    }
  },
  mixins: [getDataMixin, confirmMixin],
  props: {
    callId: {
      type: [String, Number],
      required: true
    }
  },
  data: function() {
    const emptyCoInvestigator = { email: '', first_name: '', last_name: '', institution: '' };
    const emptyTimeRequest = { semester: null, instrument: null, std_time: 0, rr_time: 0, tc_time: 0 };
    let sizeLimitAsMegaBytes = 10;
    const pdfSizeLimit = {
      asMegaBytes: sizeLimitAsMegaBytes,
      asBytes: sizeLimitAsMegaBytes * 1000000
    };
    return {
      emptyCoInvestigator: emptyCoInvestigator,
      emptyTimeRequest: emptyTimeRequest,
      sciApp: {
        call: this.callId,
        id: null,
        title: '',
        status: 'UNSAVED',
        abstract: '',
        tac_rank: 0,
        pi: this.$store.state.profile.email,
        pi_first_name: this.$store.state.profile.first_name,
        pi_last_name: this.$store.state.profile.last_name,
        pi_institution: this.$store.state.profile.profile.institution,
        coinvestigator_set: [copyObject(emptyCoInvestigator)],
        timerequest_set: [copyObject(emptyTimeRequest)],
        // TODO: Get pdf working, I think I need to fix the encoding type on the form, and
        // also handle the case where no file is set... apparently it cannot be null
        pdf: null
      },
      userTableFields: ['email', 'firstName', 'lastName', 'institution'],
      timeRequestFields: ['semester', 'instrument', 'standardTime', 'rapidResponse', 'timeCritical'],
      confirmSubmitMessage: 'Submit this application? You will no longer be able to edit it.',
      isBusyPostingApplication: false,
      pdfSizeLimit: pdfSizeLimit
    };
  },
  computed: {
    updatingSciApp: function() {
      // TODO: Replace this to instead check the endpoint, which will be either a create or update
      return this.sciApp.id !== null;
    },
    applicationDescription: function() {
      if (this.data) {
        let proposalType = _.trim(_.lowerCase(_.get(this.data, 'proposal_type_display', '')));
        let description = 'You are creating a ' + proposalType;
        if (!_.endsWith(proposalType, 'proposal')) {
          description = description + ' proposal';
        }
        description = description + ' for ' + this.data.semester + '.';
        return description;
      } else {
        return '';
      }
    },
    semesterOptions: function() {
      let options = [{ value: null, text: '--------' }];
      for (let semesterId of _.get(this.data, 'eligible_semesters', [])) {
        options.push({ value: semesterId, text: semesterId });
      }
      return options;
    },
    numberOfEligibleSemesters: function() {
      return _.get(this.data, 'eligible_semesters', []).length;
    },
    instrumentOptions: function() {
      let options = [{ value: null, text: '--------' }];
      for (let instrument of _.get(this.data, 'instruments', [])) {
        options.push({ value: instrument.id, text: instrument.name });
      }
      return options;
    }
  },
  watch: {
    'sciApp.pdf': function(pdf) {
      if (pdf !== null && pdf.size > this.pdfSizeLimit.asBytes) {
        // TODO: Incorporate this into validation
        console.log('The pdf is too large, show an error message somewhere and block it!');
      }
    },
    data: function(data) {
      // Fill in pi fields with submitter details since that is the most common use case for
      // all call types, except science collaboration calls.
      if (_.get(data, 'proposal_type', '') !== 'COLAB' && !this.updatingSciApp) {
        this.sciApp.pi = this.$store.state.profile.email;
        this.sciApp.pi_first_name = this.$store.state.profile.first_name;
        this.sciApp.pi_last_name = this.$store.state.profile.last_name;
        this.sciApp.pi_institution = this.$store.state.profile.profile.institution;
      }
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/calls/' + this.callId + '/';
    },
    removeCoInvestigator: function(index) {
      if (index > 0) {
        this.sciApp.coinvestigator_set.splice(index, 1);
      }
    },
    addCoInvestigator: function() {
      this.sciApp.coinvestigator_set.push(copyObject(this.emptyCoInvestigator));
    },
    removeTimeRequest: function(index) {
      if (index > 0) {
        this.sciApp.timerequest_set.splice(index, 1);
      }
    },
    addTimeRequest: function() {
      this.sciApp.timerequest_set.push(copyObject(this.emptyTimeRequest));
    },
    postApplication(data) {
      let method = 'POST';
      let url = this.observationPortalApiUrl + '/api/scienceapplications/';
      if (this.updatingSciApp) {
        method = 'PUT';
        url = this.observationPortalApiUrl + '/api/scienceapplications/' + this.sciApp.id + '/';
      }
      let that = this;
      this.isBusyPostingApplication = true;
      console.log(data);
      $.ajax({
        method: method,
        url: url,
        data: data,
        contentType: false,
        processData: false
      })
        .done(function(response) {
          console.log('success', response);
          if (data.get('status') === 'DRAFT') {
            // Message to user: 'Application created' OR 'Application saved'
            // Redirect to the update page, with sciapp data set to the response
          } else {
            // Message to user: 'Application successfully submitted'
            // Redirect to /apply/ page
          }
        })
        .fail(function(response) {
          console.log('failed', response);
          // 404: Either the sciapp being updated does not exist, or the related call does not exist
          // 400: Validation errors - Display those errors to the user
          // 500: Unexpected - Default message saying something went wrong
        })
        .always(function() {
          that.isBusyPostingApplication = false;
        });
    },
    filterForRowsWithData: function(fields, rows) {
      let rowsWithData = [];
      for (let row of rows) {
        let hasData = false;
        for (let field of fields) {
          if (row[field]) {
            hasData = true;
            break;
          }
        }
        if (hasData) {
          rowsWithData.push(copyObject(row));
        }
      }
      return rowsWithData;
    },
    getApplicationSubmissionBody: function(status) {
      var formData = new FormData();

      formData.append('status', status);
      formData.append('title', this.sciApp.title);
      formData.append('call', this.sciApp.call);
      formData.append('abstract', this.sciApp.abstract);

      let coInvestigators = this.filterForRowsWithData(['email', 'first_name', 'last_name', 'institution'], this.sciApp.coinvestigator_set);
      let timeRequests = this.filterForRowsWithData(['instrument', 'semester', 'std_time', 'rr_time', 'tc_time'], this.sciApp.timerequest_set);
      for (let timeRequest of timeRequests) {
        if (!timeRequest.semester && this.numberOfEligibleSemesters === 1) {
          timeRequest.semester = this.data.eligible_semesters[0];
        }
      }
      for (let i in timeRequests) {
        formData.append('timerequest_set[' + i + ']instrument', timeRequests[i].instrument);
        formData.append('timerequest_set[' + i + ']semester', timeRequests[i].semester);
        formData.append('timerequest_set[' + i + ']std_time', timeRequests[i].std_time);
        formData.append('timerequest_set[' + i + ']rr_time', timeRequests[i].rr_time);
        formData.append('timerequest_set[' + i + ']tc_time', timeRequests[i].tc_time);
      }
      for (let i in coInvestigators) {
        formData.append('coinvestigator_set[' + i + ']email', coInvestigators[i].email);
        formData.append('coinvestigator_set[' + i + ']first_name', coInvestigators[i].first_name);
        formData.append('coinvestigator_set[' + i + ']last_name', coInvestigators[i].last_name);
        formData.append('coinvestigator_set[' + i + ']institution', coInvestigators[i].institution);
      }
      if (this.sciApp.pdf !== null) {
        formData.append('pdf', this.sciApp.pdf);
      }
      return formData;
    },
    saveApplication: function() {
      console.log('saving application');
      this.postApplication(this.getApplicationSubmissionBody('DRAFT'));
    },
    submitApplication: function() {
      console.log('submitting application');
      this.postApplication(this.getApplicationSubmissionBody('SUBMITTED'));
    },
    deleteApplication: function() {
      // TODO: Implement and redirect to the /apply/ page
      console.log('deleting application');
    }
  }
};
</script>
