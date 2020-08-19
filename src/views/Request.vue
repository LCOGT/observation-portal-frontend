<template>
  <b-col>
    <template v-if="!requestLoaded">
      <p>Loading request</p>
    </template>
    <template v-else-if="requestLoadingError">
      <p>Oops, there was a problem getting your request, please try again</p>
    </template>
    <template v-else-if="requestLoaded && !request.id">
      <not-found></not-found>
    </template>
    <template v-else>
      <requestgroup-header :requestgroup="requestgroup"></requestgroup-header>
      <b-row>
        <b-col>
          <b-breadcrumb class="bg-light">
            <b-breadcrumb-item :to="{ name: 'requestgroupDetail', params: { id: requestgroup.id } }">
              Sub-requests
            </b-breadcrumb-item>
            <b-breadcrumb-item active> #{{ request.id }} </b-breadcrumb-item>
          </b-breadcrumb>
        </b-col>
      </b-row>
      <request-row :request="request" :instruments="instruments"></request-row>
      <request-detail :request="request"></request-detail>
    </template>
  </b-col>
</template>
<script>
import $ from 'jquery';

import RequestgroupHeader from '@/components/RequestgroupHeader.vue';
import RequestDetail from '@/components/RequestDetail.vue';
import RequestRow from '@/components/RequestRow.vue';
import NotFound from '@/views/NotFound.vue';

export default {
  name: 'Request',
  components: {
    RequestgroupHeader,
    RequestDetail,
    RequestRow,
    NotFound,
  },
  data: function () {
    return {
      id: this.$route.params.id,
      requestgroup: {},
      request: {},
      instruments: {},
      requestLoadingError: false,
      requestLoaded: false,
    };
  },
  computed: {
    observationPortalApiUrl: function () {
      return this.$store.state.urls.observationPortalApi;
    },
  },
  created: function () {
    this.getRequest();
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
    getRequest: function () {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/requestgroups/?request_id=' + this.id,
        dataType: 'json',
      })
        .done(function (response) {
          let requestgroup = response.results;
          if (requestgroup.length > 0) {
            that.requestgroup = requestgroup[0];
            for (let request of requestgroup[0].requests) {
              // TODO: Is there a better way to check this
              if (String(request.id) === String(that.id)) {
                that.request = request;
                break;
              }
            }
          }
        })
        .fail(function () {
          that.requestLoadingError = true;
        })
        .always(function () {
          that.requestLoaded = true;
        });
    },
  },
};
</script>
