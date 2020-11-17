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
        <p>You are creating a proposal for {{ data.semester }} - {{ data.proposal_type_display }}.</p>
        <template v-if="data.proposal_type !== 'DDT'">
          <p>
            Deadline: <strong>{{ data.deadline | formatDate }}</strong> ({{ data.deadline | timeFromNow }})
          </p>
        </template>
        <p>{{ data.eligibility }}</p>
        <b-alert v-for="error in apiValidationErrors.non_field_errors" :key="error" variant="danger" dismissible show> {{ error }}</b-alert>
        <b-form>
          <basic-custom-field v-model="sciApp.title" :errors="apiValidationErrors.title" label="Title" placeholder="Title"></basic-custom-field>
          <basic-custom-field
            v-model="sciApp.abstract"
            :errors="apiValidationErrors.abstract"
            placeholder="Limit 500 words"
            label="Abstract"
            field="abstract"
            field-type="textarea"
          ></basic-custom-field>
          <template v-if="data.proposal_type === 'COLAB'">
            <basic-custom-field
              v-model="sciApp.tac_rank"
              :errors="apiValidationErrors.tac_rank"
              label="Rank"
              field="tac-rank"
              input-type="number"
            ></basic-custom-field>
          </template>
          <template>
            <h5>Principal Investigator</h5>
            <div class="help-block">
              <strong>
                If you are the principal investigator on this proposal, please ensure your information is correct and up to date before proceeding.
                You can view and update your details on your <router-link :to="{ name: 'profile' }">profile</router-link> page.
              </strong>
            </div>
            <div class="help-block">
              The first name of the principal investigator will be presented to reviewers as an initial.
            </div>
            <b-table-lite :items="[{}]" :fields="userTableFields">
              <template #cell(email)>
                <basic-custom-field
                  v-model="sciApp.pi"
                  :errors="apiValidationErrors.pi"
                  label="Email"
                  placeholder="Email"
                  field="pi"
                  input-type="email"
                  :label-sr-only="true"
                ></basic-custom-field>
              </template>
              <template #cell(firstName)>
                <basic-custom-field
                  v-model="sciApp.pi_first_name"
                  :errors="apiValidationErrors.pi_first_name"
                  label="First Name"
                  placeholder="First Name"
                  field="pi-first-name"
                  label-sr-only
                ></basic-custom-field>
              </template>
              <template #cell(lastName)>
                <basic-custom-field
                  v-model="sciApp.pi_last_name"
                  :errors="apiValidationErrors.pi_last_name"
                  label="Last Name"
                  placeholder="Last Name"
                  field="pi-last-name"
                  label-sr-only
                ></basic-custom-field>
              </template>
              <template #cell(institution)>
                <basic-custom-field
                  v-model="sciApp.pi_institution"
                  :errors="apiValidationErrors.pi_institution"
                  label="Institution"
                  placeholder="Institution"
                  field="pi-institution"
                  label-sr-only
                ></basic-custom-field>
              </template>
            </b-table-lite>
          </template>
          <h5>Co-investigators</h5>
          <div class="help-block">
            <!-- TODO: Translate this -->
            Add the details of co-investigators on this proposal. First names will be presented as initials.
          </div>
          <b-alert v-for="error in coInvestigatorsNonFieldErrors" :key="error" variant="danger" dismissible show> {{ error }}</b-alert>
          <b-table-lite :items="sciApp.coinvestigator_set" :fields="userTableFields">
            <template #cell(email)="data">
              <basic-custom-field
                v-model="sciApp.coinvestigator_set[data.index].email"
                :errors="getApiValidationError(['coinvestigator_set', data.index, 'email'])"
                label="Email"
                placeholder="Email"
                :field="'coi-email' + data.index"
                input-type="email"
                :label-sr-only="true"
              ></basic-custom-field>
            </template>
            <template #cell(firstName)="data">
              <basic-custom-field
                v-model="sciApp.coinvestigator_set[data.index].first_name"
                :errors="getApiValidationError(['coinvestigator_set', data.index, 'first_name'])"
                label="First Name"
                placeholder="First Name"
                :field="'coi-first-name' + data.index"
                :label-sr-only="true"
              ></basic-custom-field>
            </template>
            <template #cell(lastName)="data">
              <basic-custom-field
                v-model="sciApp.coinvestigator_set[data.index].last_name"
                :errors="getApiValidationError(['coinvestigator_set', data.index, 'last_name'])"
                label="Last Name"
                placeholder="Last Name"
                :field="'coi-last-name' + data.index"
                :label-sr-only="true"
              ></basic-custom-field>
            </template>
            <template #cell(institution)="data">
              <basic-custom-field
                v-model="sciApp.coinvestigator_set[data.index].institution"
                :errors="getApiValidationError(['coinvestigator_set', data.index, 'institution'])"
                label="Institution"
                placeholder="Institution"
                :field="'coi-institution' + data.index"
                :label-sr-only="true"
              ></basic-custom-field>
              <b-link class="float-right" href="#" title="Delete CoInvestigator" @click="removeCoInvestigator(data.index)">
                <span class="text-danger mx-auto"><i class="far fa-trash-alt"></i></span>
              </b-link>
            </template>
          </b-table-lite>
          <b-link href="#" @click="addCoInvestigator"><i class="fas fa-plus"></i> Add another</b-link>
          <br />
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
            <b-alert v-for="error in timeRequestNonFieldErrors" :key="error" variant="danger" dismissible show> {{ error }}</b-alert>
            <b-table-lite :items="sciApp.timerequest_set" :fields="timeRequestFields" class="mb-1">
              <template #cell(semester)="data">
                <basic-custom-field
                  v-model="sciApp.timerequest_set[data.index].semester"
                  :errors="getApiValidationError(['timerequest_set', data.index, 'semester'])"
                  label="Semester"
                  :field="'timerequest-semester-' + data.index"
                  field-type="select"
                  :options="semesterOptions"
                  label-sr-only
                ></basic-custom-field>
              </template>
              <template #cell(instrument)="data">
                <basic-custom-field
                  v-model="sciApp.timerequest_set[data.index].instrument"
                  :errors="getApiValidationError(['timerequest_set', data.index, 'instrument'])"
                  label="Instrument"
                  :field="'timerequest-instrument-' + data.index"
                  field-type="select"
                  :options="instrumentOptions"
                  label-sr-only
                ></basic-custom-field>
              </template>
              <template #cell(standardTime)="data">
                <basic-custom-field
                  v-model="sciApp.timerequest_set[data.index].std_time"
                  :errors="getApiValidationError(['timerequest_set', data.index, 'std_time'])"
                  label="Standard Time"
                  input-type="number"
                  :field="'timerequest-std-time' + data.index"
                  :label-sr-only="true"
                ></basic-custom-field>
              </template>
              <template #cell(rapidResponse)="data">
                <basic-custom-field
                  v-model="sciApp.timerequest_set[data.index].rr_time"
                  :errors="getApiValidationError(['timerequest_set', data.index, 'rr_time'])"
                  label="Rapid Response Time"
                  input-type="number"
                  :field="'timerequest-rr-time' + data.index"
                  :label-sr-only="true"
                ></basic-custom-field>
              </template>
              <template #cell(timeCritical)="data">
                <basic-custom-field
                  v-model="sciApp.timerequest_set[data.index].tc_time"
                  :errors="getApiValidationError(['timerequest_set', data.index, 'tc_time'])"
                  label="Time Critical Time"
                  input-type="number"
                  :field="'timerequest-tc-time' + data.index"
                  :label-sr-only="true"
                ></basic-custom-field>
                <b-link class="float-right" href="#" title="Delete time request" @click="removeTimeRequest(data.index)">
                  <span class="text-danger mx-auto"><i class="far fa-trash-alt"></i></span>
                </b-link>
              </template>
            </b-table-lite>
            <b-link href="#" @click="addTimeRequest"><i class="fas fa-plus"></i> Add another</b-link>
            <br />
            <template v-if="data.proposal_type !== 'COLAB'">
              <h5>Upload PDF</h5>
              <div class="help-block">
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
                    <li><strong>List of the authors’ related publications. </strong>You may include up to 10 publications</li>
                  </ul>
                  <p>The format of the pdf file is subject to the following constraints.</p>
                  <ul>
                    <li>The font size must be 11 points or larger.</li>
                    <li>Margins on all edges must be at least 1 inch.</li>
                    <li>Line spacing must be no denser than 6 lines per inch.</li>
                    <li>The file size must be under {{ pdfSizeLimit.asMegaBytes }}MB.</li>
                    <li>The recommended length is 6 pages.</li>
                  </ul>
                </template>
                <template v-else-if="data.proposal_type === 'KEY'">
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
                    <li>The file size must be under {{ pdfSizeLimit.asMegaBytes }}MB.</li>
                    <li>The recommended length is 14 pages.</li>
                  </ul>
                </template>
                <template v-else-if="data.proposal_type === 'DDT'">
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
                    <li>The file size must be under {{ pdfSizeLimit.asMegaBytes }}MB.</li>
                    <li>The recommended length is 2 pages</li>
                  </ul>
                </template>
                <template v-else>
                  <p>The format of the pdf file is subject to the following constraints.</p>
                  <ul>
                    <li>The file size must be under {{ pdfSizeLimit.asMegaBytes }}MB.</li>
                  </ul>
                </template>
              </div>
              <template v-if="pdfPath">
                Currently: <b-link :href="pdfPath">{{ pdfBaseName }}</b-link>
                <b-form-checkbox v-model="clearPdf">Clear the pdf</b-form-checkbox>
                Change the pdf:
              </template>
              <basic-custom-field v-model="sciApp.pdf" field-type="file" :errors="pdfErrors" label="Upload PDF" label-sr-only></basic-custom-field>
              <b-link v-if="sciApp.pdf" href="#" @click="sciApp.pdf = null">Reset</b-link>
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
        <!-- TODO: Translate these paragraphs -->
        <p>You may save your application and work on it later.</p>
        <p>Once you submit your application, you will no longer be able to edit it.</p>
        <!-- TODO: translate button text -->
        <b-button variant="primary" :disabled="isBusyPostingApplication" @click="saveApplication">
          Save
        </b-button>
        <b-button variant="success" :disabled="isBusyPostingApplication" @click="confirm(confirmSubmitMessage, submitApplication)">
          Submit
        </b-button>
        <template v-if="updatingSciApp">
          <p>Previewing your submission will <strong>discard</strong> any pending edits.</p>
          <!-- TODO: translate button text  -->
          <p><router-link :to="{ name: 'SciApplicationDetail', params: { sciAppId: initialSciApp.id } }">Preview</router-link></p>
          <!-- TODO: translate text  -->
          <p>Deleting a draft is an irreversible action.</p>
          <!-- TODO: translate button text  -->
          <p>
            <b-button variant="danger" :disabled="isBusyDeletingApplication" @click="confirm(confirmDeleteMessage, deleteApplication)"
              >Delete</b-button
            >
          </p>
        </template>
      </b-col>
    </b-row>
  </data-loader>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import DataLoader from '@/components/DataLoader.vue';
import BasicCustomField from '@/components/util/BasicCustomField.vue';
import { getDataMixin } from '@/components/util/getDataMixins.js';
import { confirmMixin } from '@/components/util/utilMixins.js';
import { formatDate, timeFromNow, copyObject } from '@/utils.js';

export default {
  name: 'CreateSciApplication',
  components: {
    DataLoader,
    BasicCustomField
  },
  filters: {
    formatDate: function(value) {
      return formatDate(value, 'D MMM YYYY, h:mm a z');
    },
    timeFromNow: function(value) {
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
    },
    initialSciApp: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
      description: 'The existing science application body for update. If not set, then a new application is being created.'
    }
  },
  data: function() {
    const emptyCoInvestigator = { email: '', first_name: '', last_name: '', institution: '' };
    const emptyTimeRequest = { semester: '', instrument: '', std_time: 0, rr_time: 0, tc_time: 0 };
    let sizeLimitAsMegaBytes = 10;
    const pdfSizeLimit = {
      asMegaBytes: sizeLimitAsMegaBytes,
      asBytes: sizeLimitAsMegaBytes * 1000000
    };
    let sciApp;
    let pdfPath;
    if (this.initialSciApp.id) {
      sciApp = copyObject(this.initialSciApp);
      pdfPath = sciApp.pdf;
      sciApp.pdf = null;
      if (_.get(sciApp, 'timerequest_set', []).length === 0) {
        sciApp.timerequest_set = [copyObject(emptyTimeRequest)];
      }
      if (_.get(sciApp, 'coinvestigator_set', []).length === 0) {
        sciApp.coinvestigator_set = [copyObject(emptyCoInvestigator)];
      }
    } else {
      sciApp = {
        call: this.callId,
        title: '',
        // The 'UNSAVED' state is not a valid state when submitting to the API, it
        // is set here as feedback to the user
        status: 'UNSAVED',
        abstract: '',
        tac_rank: 0,
        pi: '',
        pi_first_name: '',
        pi_last_name: '',
        pi_institution: '',
        coinvestigator_set: [copyObject(emptyCoInvestigator)],
        timerequest_set: [copyObject(emptyTimeRequest)],
        pdf: null
      };
      pdfPath = null;
    }
    return {
      emptyCoInvestigator: emptyCoInvestigator,
      emptyTimeRequest: emptyTimeRequest,
      sciApp: sciApp,
      pdf: null,
      // This will either be null for a new application, or for an application to be updated where no pdf has been uploaded yet,
      // or it will be the path to an uploaded pdf.
      pdfPath: pdfPath,
      clearPdf: false,
      userTableFields: ['email', 'firstName', 'lastName', 'institution'],
      timeRequestFields: [{ key: 'semester', class: 'd-none' }, 'instrument', 'standardTime', 'rapidResponse', 'timeCritical'],
      confirmSubmitMessage: 'Submit this application? You will no longer be able to edit it.',
      confirmDeleteMessage: 'Are you sure you want to delete "' + _.get(this.initialSciApp, 'title', 'this application') + '"?',
      isBusyPostingApplication: false,
      isBusyDeletingApplication: false,
      pdfSizeLimit: pdfSizeLimit,
      apiValidationErrors: {},
      pdfErrors: []
    };
  },
  computed: {
    updatingSciApp: function() {
      return this.initialSciApp.id ? true : false;
    },
    semesterOptions: function() {
      let options = [{ value: '', text: '--------' }];
      for (let semesterId of _.get(this.data, 'eligible_semesters', [])) {
        options.push({ value: semesterId, text: semesterId });
      }
      return options;
    },
    numberOfEligibleSemesters: function() {
      return _.get(this.data, 'eligible_semesters', []).length;
    },
    instrumentOptions: function() {
      let options = [{ value: '', text: '--------' }];
      for (let instrument of _.get(this.data, 'instruments', [])) {
        options.push({ value: instrument.id, text: instrument.name });
      }
      return options;
    },
    pdfBaseName: function() {
      let lastElementofPath = _.last(_.split(this.pdfPath, '/'));
      return lastElementofPath || this.pdfPath;
    },
    timeRequestNonFieldErrors: function() {
      return _.get(this.apiValidationErrors, ['timerequest_set', 'non_field_errors'], []);
    },
    coInvestigatorsNonFieldErrors: function() {
      return _.get(this.apiValidationErrors, ['coinvestigator_set', 'non_field_errors'], []);
    }
  },
  watch: {
    'sciApp.pdf': function(pdf) {
      const pdfTooLargeMessage = 'PDF is too large';
      const pdfTooLarge = _.get(pdf, 'size', 0) > this.pdfSizeLimit.asBytes;
      const pdfErrorsDoesntIncludeTooLargeMessage =
        _.filter(this.pdfErrors, function(error) {
          return error === pdfTooLargeMessage;
        }).length < 1;
      if (pdfTooLarge && pdfErrorsDoesntIncludeTooLargeMessage) {
        this.pdfErrors.push(pdfTooLargeMessage);
      } else if (!pdfTooLarge) {
        this.pdfErrors = _.filter(this.pdfErrors, function(error) {
          return error !== pdfTooLargeMessage;
        });
      }
    },
    numberOfEligibleSemesters: function(value) {
      // The number of eligible semesters should always be 1 or more. If there is more than one, the
      // dropdown with all the semester options should be displayed for the user.
      if (value > 1) {
        for (let field of this.timeRequestFields) {
          if (field.key === 'semester') {
            field.class = '';
          }
        }
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
    getApiValidationError: function(path) {
      return _.get(this.apiValidationErrors, path, null);
    },
    removeCoInvestigator: function(index) {
      if (index >= 0) {
        this.sciApp.coinvestigator_set.splice(index, 1);
      }
    },
    addCoInvestigator: function() {
      this.sciApp.coinvestigator_set.push(copyObject(this.emptyCoInvestigator));
    },
    removeTimeRequest: function(index) {
      if (index >= 0) {
        this.sciApp.timerequest_set.splice(index, 1);
      }
    },
    addTimeRequest: function() {
      this.sciApp.timerequest_set.push(copyObject(this.emptyTimeRequest));
    },
    sendApplication(data) {
      let method = 'POST';
      let url = this.observationPortalApiUrl + '/api/scienceapplications/';
      if (this.updatingSciApp) {
        method = 'PUT';
        url = this.observationPortalApiUrl + '/api/scienceapplications/' + this.initialSciApp.id + '/';
      }
      let that = this;
      this.isBusyPostingApplication = true;
      this.$store.commit('clearAllMessages');
      $.ajax({
        method: method,
        url: url,
        data: data,
        cache: false,
        contentType: false,
        processData: false
      })
        .done(function(response) {
          that.apiValidationErrors = {};
          if (data.get('status') === 'DRAFT' && that.updatingSciApp) {
            // Most fields of the sciapp do not need to be reset when staying on the update page since the fields
            // are right anyway. However, the new pdf path must be set because the pdf path was set on the server side.
            that.pdfPath = response.pdf;
            that.clearPdf = false;
            that.sciApp.pdf = null;
            that.$store.commit('addMessage', { text: 'Application saved.', variant: 'success' });
          } else if (data.get('status') === 'DRAFT' && !that.updatingSciApp) {
            that.$store.commit('addMessage', { text: 'Application created.', variant: 'success' });
            that.$router.replace({ name: 'updateApp', params: { sciAppId: response.id, persistMessage: true } });
          } else {
            that.$store.commit('addMessage', { text: 'Application successfully submitted.', variant: 'success' });
            that.$router.replace({ name: 'apply', params: { persistMessage: true } });
          }
        })
        .fail(function(response) {
          if (response.status === 400) {
            that.$store.commit('addMessage', { text: 'There was an error with your submission.', variant: 'danger' });
            that.apiValidationErrors = response.responseJSON;
          } else if (response.status === 404) {
            that.$store.commit('addMessage', { text: 'Either the application can not be updated, or the call has closed.', variant: 'danger' });
          } else {
            that.$store.commit('addMessage', {
              text: 'There was an unexpected error sending your applicaiton, please try again later.',
              variant: 'danger'
            });
          }
        })
        .always(function() {
          that.isBusyPostingApplication = false;
        });
    },
    filterForRowsWithData: function(fields, rows, emptyValues) {
      emptyValues = emptyValues || [];
      let rowsWithData = [];
      for (let row of rows) {
        let hasData = false;
        for (let field of fields) {
          if (row[field] && emptyValues.indexOf(row[field]) < 0) {
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
    getTimeRequestsForSubmissionBody: function() {
      // Only time requests that are at least partially filled out should be included in
      // the submission body. If the semester options dropdown is hidden, do not include
      // the semester field in the list of fields to check for data since a user will not
      // be able to update that field anyway - in this case, automatically set the semester
      // since there is only one viable option.
      let emptyValues = ['0'];
      let checkFieldsForData = ['instrument', 'std_time', 'rr_time', 'tc_time'];
      if (this.numberOfEligibleSemesters > 1) {
        checkFieldsForData.push('semester');
      }
      let timeRequests = this.filterForRowsWithData(checkFieldsForData, this.sciApp.timerequest_set, emptyValues);
      for (let timeRequest of timeRequests) {
        if (!timeRequest.semester && this.numberOfEligibleSemesters === 1) {
          timeRequest.semester = this.data.eligible_semesters[0];
        }
      }
      return timeRequests;
    },
    getCoInvestigatorsForSubmissionBody: function() {
      // Only CoIs that are at least partially filled out should be included in
      // the submission body.
      let checkFieldsForData = ['email', 'first_name', 'last_name', 'institution'];
      return this.filterForRowsWithData(checkFieldsForData, this.sciApp.coinvestigator_set);
    },
    getApplicationSubmissionBody: function(status) {
      var formData = new FormData();
      formData.append('status', status);
      formData.append('title', this.sciApp.title);
      formData.append('call', this.callId);
      formData.append('abstract', this.sciApp.abstract);
      formData.append('pi', this.sciApp.pi);
      formData.append('pi_first_name', this.sciApp.pi_first_name);
      formData.append('pi_last_name', this.sciApp.pi_last_name);
      formData.append('pi_institution', this.sciApp.pi_institution);
      formData.append('tac_rank', this.sciApp.tac_rank);

      let coInvestigators = this.getCoInvestigatorsForSubmissionBody();
      let timeRequests = this.getTimeRequestsForSubmissionBody();
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
      if (this.sciApp.pdf) {
        formData.append('pdf', this.sciApp.pdf);
      }
      if (this.clearPdf) {
        formData.append('clear_pdf', true);
      }
      return formData;
    },
    saveApplication: function() {
      this.sendApplication(this.getApplicationSubmissionBody('DRAFT'));
    },
    submitApplication: function() {
      this.sendApplication(this.getApplicationSubmissionBody('SUBMITTED'));
    },
    deleteApplication: function() {
      if (this.initialSciApp) {
        this.$store.commit('clearAllMessages');
        this.isBusyDeletingApplication = true;
        let that = this;
        $.ajax({
          url: this.observationPortalApiUrl + '/api/scienceapplications/' + this.initialSciApp.id + '/',
          method: 'DELETE'
        })
          .done(function() {
            that.$store.commit('addMessage', { text: 'Application deleted.', variant: 'success' });
            that.$router.replace({ name: 'apply', params: { persistMessage: true } });
          })
          .fail(function() {
            that.$store.commit('addMessage', {
              text: 'There was a problem deleting the application, please try again.',
              variant: 'danger'
            });
          })
          .always(function() {
            that.isBusyDeletingApplication = false;
          });
      }
    }
  }
};
</script>
