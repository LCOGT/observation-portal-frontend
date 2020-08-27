<template>
  <b-row class="p-3">
    <b-col cols="10" md="10">
      <b-row>
        <b-col md="9" cols="12">
          <b-pagination
            v-if="observations.count > observationsQueryParams.limit"
            :value="currentPage"
            :total-rows="observations.count"
            :per-page="observationsQueryParams.limit"
            aria-controls="observations-table"
            @change="onPageChange"
          />
        </b-col>
        <b-col md="3" cols="12">
          <template v-if="lastUpdated">
            <div>{{ observationsCount }} observations</div>
            <div>
              Last update: <span class="font-weight-bold">{{ lastUpdated | formatDate }}</span>
            </div>
          </template>
        </b-col>
      </b-row>
      <b-row>
        <b-table
          id="observations-table"
          :items="observations.results"
          :fields="fields"
          :tbody-tr-class="observationGroupRowClass"
          :busy="isBusy"
          small
          show-empty
          responsive
        >
          <template v-slot:table-busy>
            <br />
            <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading observations...</div>
            <br />
          </template>
          <template v-slot:empty>
            <!-- TODO: Check the style -->
            <div>
              <center>
                <h2>No observations found.</h2>
              </center>
            </div>
          </template>
          <template v-slot:cell(id)="data">
            <router-link :to="{ name: 'observationDetail', params: { id: data.item.id } }">{{ data.item.id }}</router-link>
          </template>
          <template v-slot:cell(start)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(end)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(modified)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(created)="data">
            <span>{{ data.value | formatDate }}</span>
          </template>
          <template v-slot:cell(requestId)="data">
            <router-link :to="{ name: 'requestDetail', params: { id: data.item.request.id } }">{{ data.item.request.id }}</router-link>
          </template>
          <template v-slot:cell(instruments)="data">
            <span v-for="instrument in getObservationInstruments(data.item)" :key="instrument">{{ instrument }}</span
            ><br />
          </template>
        </b-table>
      </b-row>
      <b-row>
        <b-col md="9" cols="12">
          <b-pagination
            v-if="observations.count > observationsQueryParams.limit"
            :value="currentPage"
            :total-rows="observations.count"
            :per-page="observationsQueryParams.limit"
            aria-controls="observations-table"
            @change="onPageChange"
          />
        </b-col>
        <b-col md="3" cols="12">
          <template v-if="lastUpdated">
            <div>{{ observationsCount }} observations</div>
            <div>
              Last update: <span class="font-weight-bold">{{ lastUpdated | formatDate }}</span>
            </div>
          </template>
        </b-col>
      </b-row>
    </b-col>
    <b-col cols="2" md="2">
      <b-form @submit="onSubmit" @reset="onReset">
        <!-- TODO: Add filters -->
        <b-button-group>
          <b-button type="submit" variant="outline-info">
            <span>Filter</span>
          </b-button>
          <b-button type="reset" variant="outline-danger">
            <span>Reset</span>
          </b-button>
        </b-button-group>
      </b-form>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { formatDate, copyObject } from '@/utils.js';

export default {
  name: 'ObservationsList',
  filters: {
    formatDate(value) {
      return formatDate(value);
    }
  },
  data: function() {
    const defaultObservationsQueryParams = {
      limit: 5,
      offset: 0
    };
    let observationsQueryParams = this.getMergedObservationQueryParams(defaultObservationsQueryParams);
    let currentPage = this.calculateCurrentPage(observationsQueryParams.offset, observationsQueryParams.limit);
    return {
      observationsQueryParams: observationsQueryParams,
      defaultObservationsQueryParams: defaultObservationsQueryParams,
      observations: { count: 0, results: [] },
      fields: [
        { key: 'id' },
        'site',
        { key: 'enclosure', label: 'Enc.' },
        { key: 'telescope', label: 'Tel.' },
        { key: 'start' },
        { key: 'end' },
        { key: 'requestId', label: 'Req.ID' },
        'proposal',
        'instruments',
        { key: 'modified' },
        { key: 'created' }
      ],
      observationsQueryErrors: [],
      isBusy: false,
      currentPage: currentPage
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    observationsCount: function() {
      return this.observations.count || 0;
    },
    lastUpdated: function() {
      // TODO: Fix this. This maintains the current behavior, but this is only actually correct
      // if the selected ordering is "-modified".
      if (this.observations.results.length > 0) {
        return this.observations.results[0].modified;
      } else {
        return null;
      }
    },
    apiRequestQueryParams: function() {
      let queryParams = {};
      for (let key in this.observationsQueryParams) {
        if (this.observationsQueryParams[key]) {
          queryParams[key] = this.observationsQueryParams[key];
        }
      }
      return queryParams;
    }
  },
  created: function() {
    this.updateObservations();
  },
  methods: {
    getObservationInstruments: function(observation) {
      let instruments = [];
      if (observation.request) {
        for (let configuration of observation.request.configurations) {
          if (instruments.indexOf(configuration.instrument_type) === -1) {
            instruments.push(configuration.instrument_type);
          }
        }
      }
      return instruments;
    },
    observationGroupRowClass: function(item, type) {
      if (!item || type !== 'row') {
        return;
      } else {
        if (item.state === 'COMPLETED') {
          return 'table-success';
        } else if (item.state === 'CANCELED') {
          return 'table-secondary';
        } else if (item.state === 'FAILED' || item.state === 'ABORTED') {
          return 'table-danger';
        } else if (item.state === 'IN_PROGRESS') {
          return 'table-warning';
        } else {
          return 'table-default';
        }
      }
    },
    getMergedObservationQueryParams: function(baseObservationsQueryParams) {
      // Add any observation query parameters that are in the url to the
      // observation query param object so that the API request will include them.
      let mergedObservationsQueryParams = copyObject(baseObservationsQueryParams);
      for (let key in this.$route.query) {
        if (_.has(mergedObservationsQueryParams, key)) {
          mergedObservationsQueryParams[key] = this.$route.query[key];
        }
      }
      return mergedObservationsQueryParams;
    },
    calculateCurrentPage(offset, limit) {
      // The offset is always a multiple of the limit
      return offset / limit + 1;
    },
    calculateOffset(currentPage) {
      return (currentPage - 1) * this.observationsQueryParams.limit;
    },
    clearErrors: function() {
      for (let error of this.observationsQueryErrors) {
        this.$store.commit('deleteMessage', error);
      }
      this.observationsQueryErrors = [];
    },
    setErrors: function(errorsObject) {
      for (let field in errorsObject) {
        let message = '';
        if (field === 'retrieving') {
          message = errorsObject[field];
        } else {
          message = field + ': ' + errorsObject[field];
        }
        this.observationsQueryErrors.push(message);
        this.$store.commit('addMessage', { text: message, variant: 'danger' });
      }
    },
    getObservations: function() {
      // TODO: Cancel any currently running request
      this.isBusy = true;
      let url = this.observationPortalApiUrl + '/api/observations/';
      let that = this;
      $.getJSON(url, this.apiRequestQueryParams)
        .done(function(data) {
          that.observations = data;
          that.clearErrors();
        })
        .fail(function(data) {
          that.observations = { count: 0, results: [] };
          that.currentPage = 1;
          that.clearErrors();
          if (data.status === 400) {
            that.setErrors(data.responseJSON);
          } else {
            that.setErrors({ retrieving: 'There was a problem retrieving observations, please try again.' });
          }
        })
        .always(function() {
          that.isBusy = false;
        });
    },
    updateObservations: function() {
      this.getObservations();
      let newQueryParams = copyObject(this.$route.query);
      for (let obsKey in this.apiRequestQueryParams) {
        newQueryParams[obsKey] = this.apiRequestQueryParams[obsKey];
      }
      if (!_.isEqual(newQueryParams, this.$route.query)) {
        this.$router.push({ query: newQueryParams });
      }
    },
    goToFirstPage: function() {
      this.currentPage = 1;
      this.observationsQueryParams.offset = 0;
    },
    isNumberAndChanged: function(newInt, oldInt) {
      newInt = _.parseInt(newInt);
      oldInt = _.parseInt(oldInt);
      return _.isNumber(newInt) && newInt !== oldInt;
    },
    onSubmit: function(event) {
      event.preventDefault();
      this.goToFirstPage();
      this.updateObservations();
    },
    onReset: function(event) {
      event.preventDefault();
      this.observationsQueryParams = copyObject(this.defaultObservationsQueryParams);
      this.goToFirstPage();
      this.updateObservations();
    },
    onPageChange: function(newPage) {
      if (this.isNumberAndChanged(newPage, this.currentPage)) {
        this.currentPage = newPage;
        this.observationsQueryParams.offset = this.calculateOffset(newPage);
        this.updateObservations();
      }
    }
  }
};
</script>
