<template>
  <div>
    <b-row>
      <b-col>
        <h2>
          {{ requestgroup.name }}<br/>
          <small>RequestGroup # {{ requestgroup.id }}</small>
        </h2>
      </b-col>
    </b-row>
    <b-row class="mx-auto">
      <dl class="col-auto ml-0 px-0">
        <!-- TODO: Translate this -->
        <dt>State</dt>
        <dd :class="requestgroup.state | stateToBsClass('text')">
          <i :class="requestgroup.state | stateToIcon"></i>
          {{ requestgroup.state }}
        </dd>
      </dl>
      <dl class="col-auto mx-auto px-0">
        <!-- TODO: Translate this -->
        <dt>Updated</dt>
        <dd>{{ requestgroup.modified | formatDate }}</dd>
      </dl>
      <dl class="col-auto mx-auto px-0">
        <!-- TODO: Translate this -->
        <dt>Submitted</dt>
        <dd>{{ requestgroup.created | formatDate }}</dd>
      </dl>
      <dl class="col-auto mx-auto px-0">
        <!-- TODO: Translate this -->
        <dt>Proposal</dt>
        <dd>
          <router-link
            :to="{ name: 'proposalDetail', params: {id: requestgroup.proposal} }"
          >{{ requestgroup.proposal }}</router-link>
        </dd>
      </dl>
      <dl class="col-auto mx-auto px-0">
        <!-- TODO: Translate this -->
        <dt>Submitter</dt>
        <dd>{{ requestgroup.submitter }}</dd>
      </dl>
      <dl class="col-auto mx-auto px-0">
        <dt>IPP</dt>
        <dd>{{ requestgroup.ipp_value | formatIpp }}</dd>
      </dl>
      <dl class="col-auto mx-auto px-0">
        <!-- TODO: Translate this -->
        <dt>Observation Type</dt>
        <dd>{{ requestgroup.observation_type }}</dd>
      </dl>
      <span class="col-auto mr-0 px-0">
        <div class="dropdown">
          <button
            type="button"
            class="btn btn-outline-secondary dropdown-toggle"
            id="rgOptionsButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >Options</button>
          <div class="dropdown-menu" aria-labelledby="rgOptionsButton">
            <router-link
              class="dropdown-item"
              title="Copy this request"
              :to="{ name: 'create', query: { requestgroupid: requestgroup.id} }"
            >
              <i class="fa fa-copy"></i> Copy
            </router-link>
            <a
              v-if="userIsAuthenticated && requestgroup.state == 'PENDING'"
              class="dropdown-item"
              title="Cancel this request"
              @click="cancelRequestGroup"
            >
              <i class="fa fa-times"></i> Cancel
            </a>
          </div>
        </div>
      </span>
    </b-row>
  </div>
</template>
<script>
import $ from 'jquery';

import { stateToBsClass, stateToIcon, formatDate } from "@/utils.js";

export default {
  name: "RequestgroupHeader",
  props: {
    requestgroup: {
      type: Object,
    },
  },
  filters: {
    stateToBsClass: function (state, prefix) {
      return stateToBsClass(state, prefix);
    },
    stateToIcon: function (state) {
      return stateToIcon(state);
    },
    formatIpp: function (ipp) {
      let ippAsNumber = Number(ipp);
      if (ippAsNumber === 0 || ippAsNumber) {
        return ippAsNumber.toFixed(6);
      } else {
        return ipp;
      }
    },
    formatDate: function(date) {
      return formatDate(date);
    }
  },
  computed: {
    userIsAuthenticated: function () {
      return this.$store.state.userIsAuthenticated;
    },
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  methods: {
    cancelRequestGroup: function() {
      let that = this;
      if(confirm('Cancel this request? This action cannot be undone')) {
        $.ajax({
          type: 'POST',
          url: this.observationPortalApiUrl + '/api/requestgroups/' + this.requestgroup.id + '/cancel/',
          contentType: 'application/json',
          success: function() {
            // TODO: Redirect with router
            window.location = '/requestgroups/' + that.requestgroup.id + '/';
          },
          error: function(response) {
            if(response.status === 429) {
              alert('Your account has submitted too many cancel requests in a day, so your request to cancel has been throttled. Please contact support.');
            } else {
              alert(response.responseJSON.errors[0]);
            }
          }
        })
      }
    }
  }
};
</script>
