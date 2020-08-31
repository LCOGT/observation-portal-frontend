import _ from 'lodash';
import $ from 'jquery';

import { copyObject } from '@/utils.js';

export var paginationAndFilteringMixin = {
  /* 
  Mixin that provides basic functionality for pagination and filtering of results from an API endpoint.

  Results from the endpoint are filtered using query parameters, and results are in the form
  of `{ count: totalNumberOfResults, results: listOfAPageOfResults }`.
  
  The query parameter filters that are used in API requests are set in the current URL as well. This allows
  the user to copy the query params and paste them into a separate request to the API endpoint if they wish to see
  the exact results returned by the API.
  
  Query parameters that are set multiple times are represented as arrays in the `queryParams` object. For example,
  when filtering for observations from two sites, the query string will include "site=abc&site=def", which in the
  `queryParams` object is represented as `{ ..., site: ["abc", "def"], ... }`.
  */
  data: function() {
    const dataEndpoint = this.initializeDataEndpoint();
    const defaultQueryParams = this.initializeDefaultQueryParams();
    let queryParams = this.getMergedQueryParams(defaultQueryParams);
    let currentPage = this.calculateCurrentPage(queryParams.offset, queryParams.limit);
    return {
      // Object containing the query parameters available to filter API result
      queryParams: queryParams,
      defaultQueryParams: defaultQueryParams,
      // Object containing the API results
      data: { count: 0, results: [] },
      errorMessages: [],
      // Number representing which page of results are currently retrieved
      currentPage: currentPage,
      // Boolean that is `true` when a new set of data is being retrieved, else `false`
      isBusy: false,
      dataEndpoint: dataEndpoint
    };
  },
  created: function() {
    this.updateData();
  },
  computed: {
    url: function() {
      return this.$store.state.urls.observationPortalApi + this.dataEndpoint;
    },
    apiRequestQueryParams: function() {
      /*
      These are the query parameters that will be used in the request sent to the API, and are also the query
      params that will be placed in the current URL. `apiRequestQueryParams` are a subset of `queryParams`,
      and include only those query params that have a value. This is both because empty values, which mean no
      filtering on that field, aren't always valid options for the request sent to the API -- filters with a
      set of choices do not all have an empty value as a valid choice -- and because it is a lot nicer just to
      see the filters that are used in the URL bar, rather than seeing potentially many filters with no value,
      which makes the URL uneccessarily long.
      */
      let queryParams = {};
      for (let key in this.queryParams) {
        if (this.queryParams[key] instanceof Array) {
          let nonEmptyValues = [];
          for (let value of this.queryParams[key]) {
            if (value) nonEmptyValues.push(value);
          }
          if (nonEmptyValues.length > 0) {
            queryParams[key] = nonEmptyValues;
          }
        } else {
          if (this.queryParams[key]) {
            queryParams[key] = this.queryParams[key];
          }
        }
      }
      return queryParams;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      // Override this method to initialize the endpoint from which data will be retrieved.
      return '';
    },
    initializeDefaultQueryParams: function() {
      // Override this method to initialize the default query parameters. The default query params
      // should be a `const`, and must include `limit` and `offset` as fields.
      const defaultQueryParams = {
        limit: 10,
        offset: 0
      };
      return defaultQueryParams;
    },
    getMergedQueryParams: function(baseQueryParams) {
      // Add any query parameters that are in the url that are used in the API call to `queryParams`
      // so that the request sent to the API will include them.
      let mergedQueryParams = copyObject(baseQueryParams);
      for (let key in this.$route.query) {
        if (_.has(mergedQueryParams, key)) {
          if (mergedQueryParams[key] instanceof Array) {
            if (this.$route.query[key] instanceof Array) {
              mergedQueryParams[key] = this.$route.query[key];
            } else {
              mergedQueryParams[key] = [this.$route.query[key]];
            }
          } else {
            mergedQueryParams[key] = this.$route.query[key];
          }
        }
      }
      return mergedQueryParams;
    },
    clearErrors: function() {
      for (let message of this.errorMessages) {
        this.$store.commit('deleteMessage', message);
      }
      this.messages = [];
    },
    setErrors: function(errorMessagesObject) {
      for (let field in errorMessagesObject) {
        let message = '';
        if (field === 'retrieving') {
          message = errorMessagesObject[field];
        } else {
          message = field + ': ' + errorMessagesObject[field];
        }
        this.errorMessages.push(message);
        this.$store.commit('addMessage', { text: message, variant: 'danger' });
      }
    },
    getData: function() {
      this.isBusy = true;
      let that = this;
      $.ajax({
        url: this.url,
        data: this.apiRequestQueryParams,
        traditional: true
      })
        .done(function(data) {
          that.data = data;
          that.clearErrors();
        })
        .fail(function(data) {
          that.data = { count: 0, results: [] };
          that.currentPage = 1;
          that.clearErrors();
          if (data.status === 400) {
            that.setErrors(data.responseJSON);
          } else {
            that.setErrors({ retrieving: 'There was a problem retrieving your data, please try again.' });
          }
        })
        .always(function() {
          that.isBusy = false;
        });
    },
    beforeDataUpdate: function() {
      // Override this method in the component to include other actions that must be run
      // before a new set of data is retrieved.
      return;
    },
    updateData: function() {
      this.beforeDataUpdate();
      this.getData();
      if (this.$route.fullPath !== this.$router.resolve({ query: this.apiRequestQueryParams }).href) {
        this.$router.push({ query: this.apiRequestQueryParams });
      }
    },
    calculateCurrentPage: function(offset, limit) {
      // The offset is always a multiple of the limit
      return offset / limit + 1;
    },
    calculateOffset: function(currentPage) {
      return (currentPage - 1) * this.queryParams.limit;
    },
    goToFirstPage: function() {
      this.currentPage = 1;
      this.queryParams.offset = 0;
    },
    isNumberAndChanged: function(newInt, oldInt) {
      newInt = _.parseInt(newInt);
      oldInt = _.parseInt(oldInt);
      return _.isNumber(newInt) && newInt !== oldInt;
    },
    onSubmit: function(event) {
      // Call this method to get a new set of results when new query parameters
      // have been set.
      event.preventDefault();
      this.goToFirstPage();
      this.updateData();
    },
    onReset: function(event) {
      // Call this method to reset the query parameters to their default values.
      event.preventDefault();
      this.queryParams = copyObject(this.defaultQueryParams);
      this.goToFirstPage();
      this.updateData();
    },
    onPageChange: function(newPage) {
      // Call this method to get a new page of results.
      if (this.isNumberAndChanged(newPage, this.currentPage)) {
        this.currentPage = newPage;
        this.queryParams.offset = this.calculateOffset(newPage);
        this.updateData();
      }
    },
    onLimitChange: function(newLimit) {
      // Call this method to update the total number of results per page.
      if (this.isNumberAndChanged(newLimit, this.queryParams.limit)) {
        this.queryParams.limit = newLimit;
        this.goToFirstPage();
        this.updateData();
      }
    }
  }
};
