<template>
  <div>
    <b-row>
      <b-col>
        <h2>
          {{ requestgroup.name }}<br />
          <small>RequestGroup # {{ requestgroup.id }}</small>
        </h2>
      </b-col>
    </b-row>
    <div class="d-flex flex-wrap">
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <div class="font-weight-bold">State</div>
        <div :class="requestgroup.state | stateToBsClass('text')" class="text-truncate" :title="requestgroup.state">
          <i :class="requestgroup.state | stateToIcon" />{{ requestgroup.state }}
        </div>
      </b-col>
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <!-- TODO: Translate this -->
        <div class="font-weight-bold">Updated</div>
        <div>{{ requestgroup.modified | formatDate }}</div>
      </b-col>
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <div class="font-weight-bold">Submitted</div>
        <div>{{ requestgroup.created | formatDate }}</div>
      </b-col>
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <div class="font-weight-bold">Proposal</div>
        <div>
          <router-link :to="{ name: 'proposalDetail', params: { id: requestgroup.proposal } }">
            {{ requestgroup.proposal }}
          </router-link>
        </div>
      </b-col>
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <div class="font-weight-bold text-truncate">Submitter</div>
        <div>{{ requestgroup.submitter }}</div>
      </b-col>
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <div class="font-weight-bold">IPP</div>
        <div>{{ requestgroup.ipp_value | formatIpp }}</div>
      </b-col>
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <!-- TODO: Translate this -->
        <div class="font-weight-bold" title="Observation Type">Type</div>
        <div>{{ requestgroup.observation_type }}</div>
      </b-col>
      <b-col lg="auto" cols="12" class="p-1 flex-lg-fill">
        <span class="mr-0 px-0">
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
        </span>
      </b-col>
    </div>
  </div>
</template>
<script>
import $ from 'jquery';

import { stateToBsClass, stateToIcon, formatDate, formatFloat } from '@/utils.js';

export default {
  name: 'RequestgroupHeader',
  filters: {
    stateToBsClass: function(state, prefix) {
      return stateToBsClass(state, prefix);
    },
    stateToIcon: function(state) {
      return stateToIcon(state);
    },
    formatIpp: function(ipp) {
      return formatFloat(ipp, 6);
    },
    formatDate: function(date) {
      return formatDate(date);
    }
  },
  props: {
    requestgroup: {
      type: Object,
      required: true
    }
  },
  computed: {
    userIsAuthenticated: function() {
      return this.$store.state.userIsAuthenticated;
    },
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  methods: {
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
