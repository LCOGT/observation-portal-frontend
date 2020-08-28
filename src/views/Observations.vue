<template>
  <b-row class="p-3">
    <b-col cols="10" md="10">
      <b-row>
        <b-col md="9" cols="12">
          <b-pagination
            v-if="!isBusy && observations.count > observationsQueryParams.limit"
            :value="currentPage"
            :total-rows="observations.count"
            :per-page="observationsQueryParams.limit"
            aria-controls="observations-table"
            @change="onPageChange"
          />
        </b-col>
        <b-col md="3" cols="12" class="text-right font-weight-bold">
          <template v-if="!isBusy && observations.count > 0">
            <div>{{ observations.count }} observations</div>
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
            <div>
              <center>
                <br />
                <h2>No observations found</h2>
                <br />
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
            <span v-for="instrument in parseInstrumentsInObservation(data.item)" :key="instrument">{{ instrument }}</span
            ><br />
          </template>
        </b-table>
      </b-row>
      <b-row>
        <b-col md="9" cols="12">
          <b-pagination
            v-if="!isBusy && observations.count > observationsQueryParams.limit"
            :value="currentPage"
            :total-rows="observations.count"
            :per-page="observationsQueryParams.limit"
            aria-controls="observations-table"
            @change="onPageChange"
          />
        </b-col>
        <b-col md="3" cols="12" class="text-right font-weight-bold">
          <template v-if="!isBusy && observations.count > 0">
            <div>{{ observations.count }} observations</div>
          </template>
        </b-col>
      </b-row>
    </b-col>
    <b-col cols="2" md="2">
      <template v-if="filtersLoaded">
        <b-form @submit="onSubmit" @reset="onReset">
          <b-button-group class="my-2">
            <b-button type="submit" variant="outline-info" :disabled="isBusy">
              <span>Filter</span>
            </b-button>
            <b-button type="reset" variant="outline-danger" :disabled="isBusy">
              <span>Reset</span>
            </b-button>
          </b-button-group>
          <b-form-group id="input-group-site" label="Site" label-for="input-site">
            <b-form-select id="input-site" v-model="observationsQueryParams.site" :options="formattedFilterOptions.site" multiple></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-enclosure" label="Enclosure" label-for="input-enclosure">
            <b-form-select
              id="input-enclosure"
              v-model="observationsQueryParams.enclosure"
              :options="formattedFilterOptions.enclosure"
              multiple
            ></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-telescope" label="Telescope" label-for="input-telescope">
            <b-form-select
              id="input-telescope"
              v-model="observationsQueryParams.telescope"
              :options="formattedFilterOptions.telescope"
              multiple
            ></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-priority" label="Priority" label-for="input-priority">
            <b-form-input id="input-priority" v-model="observationsQueryParams.priority" type="number"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-state" label="State" label-for="input-state">
            <b-form-select id="input-state" v-model="observationsQueryParams.state" :options="formattedFilterOptions.state" multiple></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-time-span" label="Time Span" label-for="input-time-span">
            <b-form-select
              id="input-time-span"
              v-model="observationsQueryParams.time_span"
              :options="formattedFilterOptions.time_span"
            ></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-start-after" label="Start After (Inclusive)" label-for="input-start-after">
            <b-form-input id="input-start-after" v-model="observationsQueryParams.start_after" type="date"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-start-before" label="Start Before" label-for="input-start-before">
            <b-form-input id="input-start-before" v-model="observationsQueryParams.start_before" type="date"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-modified-after" label="Modified After (Inclusive)" label-for="input-modified-after">
            <b-form-input id="input-modified-after" v-model="observationsQueryParams.modified_after" type="date"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-request-id" label="Request ID" label-for="input-request-id">
            <b-form-input id="input-request-id" v-model="observationsQueryParams.request_id" type="number"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-request-group-id" label="Request Group ID" label-for="input-request-group-id">
            <b-form-input id="input-request-group-id" v-model="observationsQueryParams.request_group_id" type="number"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-observation-type" label="Observation Type" label-for="input-observation-type">
            <b-form-select
              id="input-observation-type"
              v-model="observationsQueryParams.observation_type"
              :options="formattedFilterOptions.observation_type"
              multiple
            ></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-request-state" label="Request State" label-for="input-request-state">
            <b-form-select
              id="input-request-state"
              v-model="observationsQueryParams.request_state"
              :options="formattedFilterOptions.request_state"
              multiple
            ></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-proposal" label="Proposal" label-for="input-proposal">
            <b-form-input id="input-proposal" v-model="observationsQueryParams.proposal" type="text"></b-form-input>
          </b-form-group>
          <b-form-group id="input-group-instrument-type" label="Instrument Type" label-for="input-instrument-type">
            <b-form-select
              id="input-instrument-type"
              v-model="observationsQueryParams.instrument_type"
              :options="formattedFilterOptions.instrument_type"
              multiple
            ></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-configuration-type" label="Configuration Type" label-for="input-configuration-type">
            <b-form-select
              id="input-configuration-type"
              v-model="observationsQueryParams.configuration_type"
              :options="formattedFilterOptions.configuration_type"
              multiple
            ></b-form-select>
          </b-form-group>
          <b-form-group id="input-group-ordering" label="Ordering" label-for="input-ordering">
            <b-form-select id="input-ordering" v-model="observationsQueryParams.ordering" :options="formattedFilterOptions.ordering"></b-form-select>
          </b-form-group>
          <b-button-group>
            <b-button type="submit" variant="outline-info" :disabled="isBusy">
              <span>Filter</span>
            </b-button>
            <b-button type="reset" variant="outline-danger" :disabled="isBusy">
              <span>Reset</span>
            </b-button>
          </b-button-group>
        </b-form>
      </template>
      <template v-else>
        <div class="text-center">
          <i class="fa fa-spin fa-spinner" />
        </div>
      </template>
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
      site: [],
      enclosure: [],
      telescope: [],
      state: ['COMPLETED', 'PENDING', 'IN_PROGRESS', 'ABORTED', 'FAILED'],
      time_span: '',
      observation_type: [],
      request_state: [],
      instrument_type: [],
      configuration_type: [],
      ordering: '',
      start_after: '',
      start_before: '',
      modified_after: '',
      request_id: '',
      request_group_id: '',
      priority: '',
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
      currentPage: currentPage,
      filtersLoaded: false,
      filterOptions: { fields: [], choice_fields: [] }
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    apiRequestQueryParams: function() {
      // These are the query parameters that will be used in the request sent to the API,
      // and are also the params that will be placed in the current url. These are used in
      // the current url because 1) it is nicer to see only the active filters in the url bar
      // instead of seeing a bunch of empty query params, and 2) so that the url can be replaced
      // with /api/ between the domain and the rest of the url, and you'll be able to see the
      // same exact results from the api.
      let queryParams = {};
      for (let key in this.observationsQueryParams) {
        if (this.observationsQueryParams[key] instanceof Array) {
          let nonEmptyValues = [];
          for (let value of this.observationsQueryParams[key]) {
            if (value) nonEmptyValues.push(value);
          }
          if (nonEmptyValues.length > 0) {
            queryParams[key] = nonEmptyValues;
          }
        } else {
          if (this.observationsQueryParams[key]) {
            queryParams[key] = this.observationsQueryParams[key];
          }
        }
      }
      return queryParams;
    },
    formattedFilterOptions: function() {
      let options = {};
      for (let choiceField of this.filterOptions.choice_fields) {
        options[choiceField.name] = [];
        for (let option of choiceField.options) {
          options[choiceField.name].push({ value: option[0], text: option[1] });
        }
      }
      return options;
    }
  },
  created: function() {
    this.getFilterOptions();
    this.updateObservations();
  },
  methods: {
    parseInstrumentsInObservation: function(observation) {
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
          if (mergedObservationsQueryParams[key] instanceof Array) {
            if (this.$route.query[key] instanceof Array) {
              mergedObservationsQueryParams[key] = this.$route.query[key];
            } else {
              mergedObservationsQueryParams[key] = [this.$route.query[key]];
            }
          } else {
            mergedObservationsQueryParams[key] = this.$route.query[key];
          }
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
    getFilterOptions: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/observations/filters/'
      }).done(function(response) {
        that.filterOptions = response;
        that.filtersLoaded = true;
      });
    },
    getObservations: function() {
      this.isBusy = true;
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/observations/',
        data: this.apiRequestQueryParams,
        traditional: true
      })
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
      if (this.$route.fullPath !== this.$router.resolve({ query: this.apiRequestQueryParams }).href) {
        this.$router.push({ query: this.apiRequestQueryParams });
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
