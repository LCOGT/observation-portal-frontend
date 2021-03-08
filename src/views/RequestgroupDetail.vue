<template>
  <ocs-data-loader :data-loaded="requestgroupLoaded" :data-load-error="requestgroupLoadError" :data-not-found="requestgroupNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
    <b-row>
      <b-col>
        <h2 class="text-break">
          {{ requestgroup.name }}
        </h2>
        <h4>RequestGroup # {{ requestgroup.id }}</h4>
      </b-col>
    </b-row>
    <ocs-request-group-header
      :requestgroup="requestgroup"
      :proposal-link="{ to: { name: 'proposalDetail', params: { id: requestgroup.proposal } } }"
      show-extra-column
    >
      <template v-slot:extra-column-content>
        <div class="dropdown">
          <button
            id="rgOptionsButton"
            type="button"
            class="btn btn-outline-secondary dropdown-toggle btn-block px-0"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            title="Options"
            block
          >
            <i class="fas fa-cog"></i><span class="d-inline-block d-lg-none">&nbsp;Options</span>
          </button>
          <div class="dropdown-menu dropdown-menu-right" aria-labelledby="rgOptionsButton">
            <router-link class="dropdown-item" title="Copy this request" :to="{ name: 'create', query: { requestgroupid: requestgroup.id } }">
              <i class="fa fa-copy" /> Copy
            </router-link>
            <a
              v-if="userIsAuthenticated && requestgroup.state == 'PENDING'"
              class="dropdown-item"
              title="Cancel this request"
              @click="cancelRequestGroup"
            >
              <i class="fa fa-times" /> Cancel
            </a>
          </div>
        </div>
      </template>
    </ocs-request-group-header>
    <b-row>
      <b-col>
        <b-breadcrumb class="bg-light">
          <template v-if="requestDetail">
            <b-breadcrumb-item :to="{ name: 'requestgroupDetail', params: { id: requestgroup.id } }">
              Sub-requests
            </b-breadcrumb-item>
            <b-breadcrumb-item active> #{{ request.id }} </b-breadcrumb-item>
          </template>
          <b-breadcrumb-item v-else active>
            Sub-requests
          </b-breadcrumb-item>
        </b-breadcrumb>
      </b-col>
    </b-row>
    <template v-if="requestDetail">
      <request-row :request="request" :instruments="instruments" />
      <request-detail :request="request" />
    </template>
    <template v-else>
      <b-table
        id="requests-table"
        :fields="fields"
        :items="requestgroup.requests"
        :per-page="perPage"
        thead-class="d-none"
        details-td-class="p-0"
        :current-page="currentPage"
        borderless
        small
      >
        <template v-slot:cell(requestRow)="data">
          <request-row :request="data.item" :instruments="instruments" :link="true" />
        </template>
      </b-table>
      <b-pagination
        v-if="numberOfRequests > perPage"
        v-model="currentPage"
        :total-rows="numberOfRequests"
        :per-page="perPage"
        aria-controls="requests-table"
      />
    </template>
  </ocs-data-loader>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import RequestDetail from '@/components/RequestDetail.vue';
import RequestRow from '@/components/RequestRow.vue';
import NotFound from '@/components/NotFound.vue';

export default {
  name: 'RequestgroupDetail',
  components: {
    RequestDetail,
    RequestRow,
    NotFound
  },
  data: function() {
    return {
      requestgroup: {},
      instruments: {},
      requestgroupLoaded: false,
      archiveTokenLoaded: false,
      requestgroupLoadError: false,
      requestgroupNotFound: false,
      fields: [{ key: 'requestRow', tdClass: 'p-0' }],
      currentPage: 1,
      perPage: 25
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    userIsAuthenticated: function() {
      return this.$store.state.userIsAuthenticated;
    },
    numberOfRequests: function() {
      if (this.requestgroup.requests) {
        return this.requestgroup.requests.length;
      } else {
        return 0;
      }
    },
    requestDetail: function() {
      return this.$route.name === 'requestDetail';
    },
    id: function() {
      return this.$route.params.id;
    },
    request: function() {
      let requestDict = {};
      if (this.requestDetail) {
        for (let request of _.get(this.requestgroup, 'requests', [])) {
          if (String(request.id) === String(this.id)) {
            requestDict = request;
            break;
          }
        }
      }
      return requestDict;
    }
  },
  created: function() {
    let that = this;
    // Get the archive token here before the rest of the components are rendered since
    // a variety of them need the token, and doing this ensures only one request to get
    // the token is sent.
    this.$store.dispatch('getArchiveToken').finally(() => {
      that.archiveTokenLoaded = true;
      if (that.requestDetail) {
        that.getRequestgroupByRequestId();
      } else {
        that.getRequestgroupByRequestgroupId();
      }
    });
    this.getInstruments();
  },
  methods: {
    getInstruments: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/instruments/',
        dataType: 'json'
      }).done(function(response) {
        that.instruments = response;
      });
    },
    getRequestgroupByRequestgroupId: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/requestgroups/' + this.id + '/',
        dataType: 'json'
      })
        .done(function(response) {
          that.requestgroup = response;
          if (response.requests.length === 1) {
            that.$router.replace({
              name: 'requestDetail',
              params: { id: response.requests[0].id }
            });
          }
        })
        .fail(function(response) {
          if (response.status === 404) {
            that.requestgroupNotFound = true;
          } else {
            that.requestgroupLoadError = true;
          }
        })
        .always(function() {
          that.requestgroupLoaded = true;
        });
    },
    getRequestgroupByRequestId: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/requestgroups/' + '?request_id=' + this.id,
        dataType: 'json'
      })
        .done(function(response) {
          if (response.results.length > 0) {
            that.requestgroup = response.results[0];
          } else {
            that.requestgroupNotFound = true;
          }
        })
        .fail(function(response) {
          if (response.status === 404) {
            that.requestgroupNotFound = true;
          } else {
            that.requestgroupLoadError = true;
          }
        })
        .always(function() {
          that.requestgroupLoaded = true;
        });
    },
    cancelRequestGroup: function() {
      let that = this;
      if (confirm('Cancel this request? This action cannot be undone')) {
        $.ajax({
          type: 'POST',
          url: this.observationPortalApiUrl + '/api/requestgroups/' + this.requestgroup.id + '/cancel/',
          contentType: 'application/json',
          success: function() {
            // TODO: Redirect with router
            window.location = '/requestgroups/' + that.requestgroup.id + '/';
          },
          error: function(response) {
            if (response.status === 429) {
              alert(
                'Your account has submitted too many cancel requests in a day, so your request to cancel has been throttled. Please contact support.'
              );
            } else {
              alert(response.responseJSON.errors[0]);
            }
          }
        });
      }
    }
  }
};
</script>
