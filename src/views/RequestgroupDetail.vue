<template>
  <b-col>
    <template v-if="!dataLoaded">
      <p>Loading data</p>
    </template>
    <template v-else-if="requestgroupLoadError">
      <p>
        Oops, there was a problem getting your data, please try again
      </p>
    </template>
    <template v-else-if="dataLoaded && !requestgroup.id">
      <not-found></not-found>
    </template>
    <template v-else>
      <requestgroup-header :requestgroup="requestgroup"></requestgroup-header>
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
        <request-row :request="request" :instruments="instruments"></request-row>
        <request-detail :request="request"></request-detail>
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
        ></b-pagination>
      </template>
    </template>
  </b-col>
</template>
<script>
import $ from 'jquery';

import RequestgroupHeader from '@/components/RequestgroupHeader.vue';
import RequestDetail from '@/components/RequestDetail.vue';
import RequestRow from '@/components/RequestRow.vue';
import NotFound from '@/components/NotFound.vue';

export default {
  name: 'RequestgroupDetail',
  components: {
    RequestgroupHeader,
    RequestDetail,
    RequestRow,
    NotFound
  },
  data: function () {
    return {
      id: this.$route.params.id,
      requestgroup: {},
      request: {},
      instruments: {},
      requestgroupLoaded: false,
      archiveTokenLoaded: false,
      requestgroupLoadError: false,
      fields: [{ key: 'requestRow', tdClass: 'p-0' }],
      currentPage: 1,
      perPage: 10,
    };
  },
  computed: {
    observationPortalApiUrl: function () {
      return this.$store.state.urls.observationPortalApi;
    },
    dataLoaded: function () {
      return this.requestgroupLoaded && this.archiveTokenLoaded;
    },
    numberOfRequests: function () {
      if (this.requestgroup.requests) {
        return this.requestgroup.requests.length;
      } else {
        return 0;
      }
    },
    requestDetail: function() {
      return this.$route.name === 'requestDetail';
    }
  },
  created: function () {
    let that = this;
    // Get the archive token here before the rest of the components are rendered since
    // a variety of them need the token, and doing this ensures only one request to get
    // the token is sent.
    this.$store.dispatch('getArchiveToken').finally(() => {
      that.archiveTokenLoaded = true;
      that.getRequestgroup();
    });
    this.getInstruments();
  },
  methods: {
    getInstruments: function () {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/instruments/',
        dataType: 'json',
      }).done(function (response) {
        that.instruments = response;
      });
    },
    getRequestgroup: function () {
      let that = this;
      let url = this.observationPortalApiUrl + '/api/requestgroups/' + this.id + '/';
      if (this.requestDetail) {
        url = this.observationPortalApiUrl + '/api/requestgroups/?request_id=' + this.id;
      }
      $.ajax({
        url: url,
        dataType: 'json'
      })
        .done(function (response) {
          if (that.requestDetail) {
            if (response.results.length > 0) {
              that.requestgroup = response.results[0];
              for (let request of that.requestgroup[0].requests) {
                if (String(request.id) === String(that.id)) {
                  that.request = request;
                  break;
                }
              }
            }
          } else {
            that.requestgroup = response;
            if (response.requests.length == 1) {
              that.request = response.requests[0];
              that.$router.replace({
                name: 'requestDetail',
                params: { id: that.request.id },
              });
            }
          }
        })
        .fail(function () {
          that.requestgroupLoadError = true;
        })
        .always(function () {
          that.requestgroupLoaded = true;
        });
    },
  },
};
</script>
