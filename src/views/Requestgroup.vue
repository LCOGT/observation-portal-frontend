<template>
  <b-col>
    <template v-if="!dataLoaded">
      <p>Loading requestgroup</p>
    </template>
    <template v-else-if="requestgroupLoadError">
      <p>Oops, there was a problem getting your requestgroup, please try again</p>
    </template>
    <template v-else-if="dataLoaded && !requestgroup.id">
      <not-found></not-found>
    </template>
    <template v-else>
      <requestgroup-header :requestgroup="requestgroup"></requestgroup-header>
      <b-row>
        <b-col>
          <b-breadcrumb class="bg-light">
            <b-breadcrumb-item active>
              Sub-requests
            </b-breadcrumb-item>
          </b-breadcrumb>
        </b-col>
      </b-row>
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
          <request-row 
            :request="data.item"
            :instruments="instruments"
            :link="true"
          />
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
  </b-col>
</template>
<script>
import $ from 'jquery';

import RequestgroupHeader from '@/components/RequestgroupHeader.vue';
import RequestRow from '@/components/RequestRow.vue';

export default {
  name: 'Requestgroup',
  components: {
    RequestgroupHeader,
    RequestRow
  },
  data: function() {
    return {
      id: this.$route.params.id,
      requestgroup: {},
      instruments: {},
      requestgroupLoaded: false,
      archiveTokenLoaded: false,
      requestgroupLoadError: false,
      fields: [{key: 'requestRow', tdClass: 'p-0'}],
      currentPage: 1,
      perPage: 10
    }
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    dataLoaded: function() {
      return this.requestgroupLoaded && this.archiveTokenLoaded;
    },
    numberOfRequests: function() {
      if (this.requestgroup.requests) {
        return this.requestgroup.requests.length;
      } else {
        return 0;
      }
    }
  },
  created: function() {
    let that = this;
    // Get the archive token here to keep each request row from sending off its own request to get it
    this.$store.dispatch('getArchiveToken').finally(() => {
      that.archiveTokenLoaded = true;
    })
    this.getRequestgroup();
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
      })
    },
    getRequestgroup: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/requestgroups/' + this.id + '/',
        dataType: 'json'
      }).done(function(response) {
        if (response.requests.length == 1) {
          // TODO: Can this be done without needing to get the request again
          that.$router.push({name: 'requestDetail', params: {id: response.requests[0].id}});
        }
        that.requestgroup = response;
      }).fail(function() {
        that.requestgroupLoadError = true;
      }).always(function() {
        that.requestgroupLoaded = true;
      })
    }
  }
}
</script>
