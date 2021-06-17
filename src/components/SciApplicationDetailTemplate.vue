<template>
  <div class="sciapp-detail-content">
    <ul v-if="!isCombinedPdf" style="float:right;">
      <li><b-link href="#" @click="goBack()">Back</b-link></li>
      <li><b-link href="#" @click="printPage()">Print this page</b-link></li>
      <li><router-link :to="{ name: 'appCombinedPdf', params: { sciAppId: sciApp.id } }" target="_blank">View Pdf</router-link></li>
    </ul>
    <template v-if="sciApp.title">
      <h1>{{ sciApp.title }}</h1>
      <br />
    </template>
    <h2>
      Semester: <span>{{ sciApp.call.semester }}</span>
    </h2>
    <template v-if="appHasBeenSubmitted">
      <h2>
        Submitted: <span>{{ sciApp.submitted | formatDate }}</span>
      </h2>
    </template>
    <template v-if="sciApp.abstract">
      <!-- TODO: Translate this -->
      <h2>Abstract</h2>
      <p>{{ sciApp.abstract }}</p>
    </template>
    <template v-if="timeRequests.length > 0">
      <!-- TODO: Translate this -->
      <h2>Observing Budget</h2>
      <table class="observing-budget-table">
        <thead>
          <tr>
            <th v-if="isKeyApplication">Semester</th>
            <th>Instrument</th>
            <th>Standard Time</th>
            <th>Rapid Response</th>
            <th>Time Critical</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(timeRequestGroup, semester) in timeRequestsBySemester">
            <tr v-if="isKeyApplication" :key="semester">
              <td class="semester-row" colspan="5">{{ semester }}</td>
            </tr>
            <tr v-for="(timeRequest, index) in timeRequestGroup" :key="semester + '-' + index">
              <td v-if="isKeyApplication"></td>
              <td>{{ timeRequest.instrument_names.join(', ') }}</td>
              <td class="centered-text">{{ timeRequest.std_time }}</td>
              <td class="centered-text">{{ timeRequest.rr_time }}</td>
              <td class="centered-text">{{ timeRequest.tc_time }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
    <template v-if="sciApp.call && sciApp.call.proposal_type !== 'DDT'">
      <div class="page-break"></div>
    </template>
    <template v-if="!isCombinedPdf">
      <!-- TODO: Translate this -->
      <h2>Principal Investigator</h2>
      <template v-if="sciApp.pi">
        <p>{{ sciApp.pi_first_name | first }}. {{ sciApp.pi_last_name }} ({{ sciApp.pi_institution }})</p>
      </template>
      <template v-else>
        <p>{{ submitter.first_name | first }}. {{ submitter.last_name }} ({{ submitter.institution }})</p>
      </template>
      <template v-if="coInvestigators.length > 0">
        <!-- TODO: Translate this -->
        <h2>Co Investigators</h2>
        <table class="coi-table coi-table-border">
          <thead>
            <tr class="coi-table-border">
              <th>Name</th>
              <th>Institution</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(coi, index) in coInvestigators" :key="index">
              <td>{{ coi.first_name | first }}. {{ coi.last_name }}</td>
              <td>{{ coi.institution }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </template>
    <template v-if="sciApp.pdf && !isCombinedPdf">
      <h2>Uploaded PDF</h2>
      <p><a :href="sciApp.pdf" target="_blank">Download</a></p>
    </template>
    <!-- eslint-disable -->
    <component :is="'style'">
      <!-- These are styles for this component, and will remain enabled even if this component is rendered
      on a route that is marked as a plain page. -->
      @page {
        size: 8.5in 11in;
        margin: 2.5cm;
      }
      body {
        margin: 15px;
        font-size: 11pt;
        font-family: sans-serif;
        line-height: 1.1;
      }
      .observing-budget-table, .coi-table {
        border-collapse: collapse;
        border-spacing: 10px;
        table-layout: fixed;
      }
      .observing-budget-table {
        border-top: 1px solid black;
        border-right: 1px solid black;
      }
      .observing-budget-table thead tr th,
      .observing-budget-table tbody tr td {
        border-bottom: 1px solid black;
        border-left: 1px solid black;
        border-collapse: collapse;
      }
      .semester-row {
        border-collapse: collapse;
        border-left: 1px solid black;
      }
      .coi-table thead tr th,
      .coi-table tbody tr td,
      .observing-budget-table thead tr th,
      .observing-budget-table tbody tr td {
        padding: 5px;
        max-width: 200px;
        word-wrap: break-word;
      }
      .sciapp-detail-content h1 {
        font-size: 24px;
        font-weight: 700;
        font-family: sans-serif;
      }
      .sciapp-detail-content h2 {
        font-size: 16px;
        font-weight: 700;
        font-family: sans-serif;
      }
      .sciapp-detail-content h2 span {
        font-size: 14px;
        font-weight: 700;
        padding-left: 1px;
      }
      .sciapp-detail-content p {
        page-break-inside: avoid;
        text-align: justify;
      }
      .page-break {
        page-break-after: always;
      }
      .centered-text {
        text-align: center;
      }
      .coi-table-border {
        border-bottom: 1px solid black;
      }
    </component>
  </div>
</template>
<script>
import _ from 'lodash';
import { OCSUtil } from 'ocs-component-lib';

export default {
  filters: {
    formatDate: function(value) {
      return OCSUtil.formatDate(value, 'D MMM YYYY, h:mm a z');
    },
    first: function(value) {
      if (value) {
        return _.head(value);
      } else {
        return '';
      }
    }
  },
  props: {
    sciApp: {
      type: Object,
      required: true
    },
    isCombinedPdf: {
      type: Boolean
    }
  },
  computed: {
    timeRequests: function() {
      return _.get(this.sciApp, 'timerequest_set', []);
    },
    coInvestigators: function() {
      return _.get(this.sciApp, 'coinvestigator_set', []);
    },
    timeRequestsBySemester: function() {
      return _.groupBy(this.timeRequests, 'semester');
    },
    isKeyApplication: function() {
      return _.get(this.sciApp, ['call', 'proposal_type'], '') === 'KEY';
    },
    submitter: function() {
      return _.get(this.sciApp, 'submitter', {});
    },
    appHasBeenSubmitted: function() {
      return this.sciApp.status === 'SUBMITTED' && this.sciApp.submitted;
    }
  },
  methods: {
    printPage: function() {
      window.print();
    },
    goBack: function() {
      window.history.back();
    }
  }
};
</script>
