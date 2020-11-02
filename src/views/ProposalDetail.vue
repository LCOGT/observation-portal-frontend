<template>
  <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <b-row>
      <b-col>
        <b-row>
          <b-col md="8" cols="12">
            <h3>
              {{ data.id }} <small>{{ data.title }}</small>
            </h3>
            <p>{{ data.abstract }}</p>
            <template v-if="principleInvestigators.length === 1">
              <span class="font-weight-bolder">
                Principal Investigator: {{ principleInvestigators[0].first_name }} {{ principleInvestigators[0].last_name }}
                <a :href="'mailto:' + principleInvestigators[0].email">{{ principleInvestigators[0].email }}</a>
              </span>
              <br />
              <br />
            </template>
            <template v-else>
              <span class="font-weight-bolder">
                Principal Investigators:
              </span>
              <ul>
                <li v-for="pi in principleInvestigators" :key="pi.username">
                  <span>{{ pi.first_name }} {{ pi.last_name }}</span> <a :href="'mailto:' + pi.email">{{ pi.email }}</a>
                </li>
              </ul>
              <br />
            </template>
          </b-col>
          <b-col md="4" cols="12">
            <span class="font-weight-bolder"> Email Notifications </span
            ><sup
              v-b-tooltip="tooltipConfig"
              class="text-primary"
              title="If notifications are enabled, you will recieve notifications whenever a requested observation on this proposal is completed."
              >?</sup
            >
            <b-form @submit="updateProposalNotification">
              <b-form-group id="checkbox-group-proposal-notification" label-for="checkbox-proposal-notification">
                <b-form-checkbox id="checkbox-proposal-notification" v-model="proposalNotification.enabled">
                  <span>Notifications enabled</span>
                </b-form-checkbox>
              </b-form-group>
              <b-button type="submit" variant="outline-primary" :disabled="proposalNotification.isBusy"
                ><i class="fas fa-save"></i> Save Preferences</b-button
              >
            </b-form>
            <br />
            <span class="font-weight-bolder">
              Observation Requests
            </span>
            <div>Total: {{ data.requestgroup_count }}</div>
            <ul>
              <li class="observation-requests-links">
                <b-link :to="{ name: 'home', query: { proposal: id } }" class="ml-1">View observation requests</b-link>
              </li>
              <li class="observation-requests-links">
                <b-link :href="archiveLink" target="_blank" variant="primary" class="pt-1 ml-1">View data on the LCO Science Archive</b-link>
              </li>
            </ul>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row>
      <template v-if="userIsPI">
        <hr class="w-100" />
        <b-col>
          <h4>
            Co-Investigators
            <small>
              <b-link v-b-toggle.collapse-cois href="#">
                <span class="when-open"><i class="fa fa-eye"></i></span>
                <span class="when-closed"><i class="fa fa-eye fa-eye-slash"></i></span>
              </b-link>
            </small>
          </h4>
        </b-col>
        <b-collapse id="collapse-cois" class="w-100" visible>
          <b-col>
            <b-row>
              <b-col md="4" cols="12">
                <div class="mt-3">
                  Manage Global Hour Limit<sup
                    v-b-tooltip="tooltipConfig"
                    class="text-primary"
                    title="Use this form to set an hour limit, or remove the hour limit, for every co-investigator on the proposal."
                    >?</sup
                  >
                </div>
                <b-form @submit="setGlobalLimit" @reset="resetGlobalLimit">
                  <b-form-group id="input-group-global-time-limit" label-for="input-global-time-limit" label="Global Limit (Hours)" label-sr-only>
                    <b-form-input
                      id="input-global-time-limit"
                      v-model="globallimit.timeLimit"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Hours"
                      required
                    />
                  </b-form-group>
                  <b-button type="submit" variant="outline-primary" :disabled="globallimit.isBusy" class="mr-1">
                    Set Global Limit
                  </b-button>
                  <b-button type="reset" variant="outline-warning" :disabled="globallimit.isBusy">
                    Remove Limit
                  </b-button>
                </b-form>
              </b-col>
              <b-col md="4" cols="12">
                <!-- TODO: Translate the title -->
                <div class="mt-3">
                  Invite Co-Investigators<sup v-b-tooltip="tooltipConfig" class="text-primary" :title="inviteCoIHelpText">?</sup>
                </div>
                <invite-co-investigators-form
                  :proposal-id="id"
                  :user-is-p-i="userIsPI"
                  @coInvestigatorsInvited="onCoInvestigatorsInvited"
                ></invite-co-investigators-form>
              </b-col>
              <b-col md="4" cols="12">
                <!-- TODO: Translate this -->
                <div class="mt-3">Pending Invitations</div>
                <proposal-invitations :key="proposalInvitationsListKey" :user-is-p-i="userIsPI" :proposal-id="id"></proposal-invitations>
              </b-col>
            </b-row>
            <br />
            <b-row>
              <b-col>
                <co-investigator-table :key="coInvestigatorTableKey" :user-is-p-i="userIsPI" :proposal-id="id" :proposal-is-public="data.public">
                </co-investigator-table>
              </b-col>
            </b-row>
          </b-col>
        </b-collapse>
      </template>
    </b-row>
    <b-row>
      <b-col>
        <h4>Time Allocation</h4>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Telescope Class</th>
                <th>Hours</th>
                <th>Used/Allocated</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(timeallocations, semester) in timeallocationsBySemester">
                <tr :key="semester">
                  <td colspan="4">{{ semester }}</td>
                </tr>
                <template v-for="(timeallocation, idx) in timeallocations">
                  <tr :key="semester + '-instrument-type-' + idx">
                    <td></td>
                    <td>{{ timeallocation.instrument_type }}</td>
                    <td colspan="2"></td>
                  </tr>
                  <tr :key="semester + '-std-time-' + idx">
                    <td colspan="2"></td>
                    <td>Standard</td>
                    <td>
                      <b-progress :max="timeallocation.std_allocation">
                        <b-progress-bar :value="timeallocation.std_time_used" class="progress-style">
                          <span>{{ timeallocation.std_time_used | formatFloat(1) }}/{{ timeallocation.std_allocation | formatFloat(1) }}</span>
                        </b-progress-bar>
                      </b-progress>
                    </td>
                  </tr>
                  <tr :key="semester + '-tc-time-' + idx">
                    <td colspan="2"></td>
                    <td>Time Critical</td>
                    <td>
                      <b-progress class="progress-text" :max="timeallocation.tc_allocation">
                        <b-progress-bar :value="timeallocation.tc_time_used" class="progress-style">
                          <span>{{ timeallocation.tc_time_used | formatFloat(1) }}/{{ timeallocation.tc_allocation | formatFloat(1) }}</span>
                        </b-progress-bar>
                      </b-progress>
                    </td>
                  </tr>
                  <tr :key="semester + '-rr-time-' + idx">
                    <td colspan="2"></td>
                    <td>Rapid Response</td>
                    <td>
                      <b-progress :max="timeallocation.rr_allocation">
                        <b-progress-bar :value="timeallocation.rr_time_used" class="progress-style">
                          <span>{{ timeallocation.rr_time_used | formatFloat(1) }}/{{ timeallocation.rr_allocation | formatFloat(1) }}</span>
                        </b-progress-bar>
                      </b-progress>
                    </td>
                  </tr>
                  <tr :key="semester + '-ipp-' + idx">
                    <td colspan="2"></td>
                    <td>IPP</td>
                    <td>Available: {{ timeallocation.ipp_time_available | formatFloat(1) }} Limit: {{ timeallocation.ipp_limit }}</td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </b-col>
    </b-row>
  </data-loader>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

import { formatFloat, tooltipConfig } from '@/utils.js';
import DataLoader from '@/components/DataLoader.vue';
import CoInvestigatorTable from '@/components/CoInvestigatorTable.vue';
import ProposalInvitations from '@/components/ProposalInvitations.vue';
import InviteCoInvestigatorsForm from '@/components/InviteCoInvestigatorsForm.vue';
import { getDataMixin } from '@/components/util/getDataMixins.js';
import { confirmMixin } from '@/components/util/utilMixins.js';

export default {
  name: 'ProposalDetail',
  filters: {
    formatFloat: function(value, precision) {
      return formatFloat(value, precision);
    }
  },
  components: {
    DataLoader,
    CoInvestigatorTable,
    ProposalInvitations,
    InviteCoInvestigatorsForm
  },
  mixins: [getDataMixin, confirmMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      inviteCoIHelpText:
        'Invite co-investigators by entering their email address below and clicking "invite". If you would like to add multiple address at once, enter' +
        'them below, comma separated. If the user is already registered with LCO, they will be added to this proposal. If not, they will be invited.',
      tooltipConfig: tooltipConfig,
      // Changing this key forces a reload of the CoInvestigator table
      coInvestigatorTableKey: 0,
      // Changing this key forces a reload of the pending invitations list
      proposalInvitationsListKey: 0,
      proposalNotification: {
        enabled: false,
        isBusy: false
      },
      globallimit: {
        timeLimit: null,
        isBusy: false
      },
      deleteMembership: {
        isBusy: false
      }
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    archiveLink: function() {
      return this.$store.state.urls.archiveClient + '?PROPID=' + this.id;
    },
    principleInvestigators: function() {
      return _.get(this.data, 'pis', []);
    },
    userIsPI: function() {
      for (let pi of this.principleInvestigators) {
        if (pi.username === this.$store.state.profile.username) {
          return true;
        }
      }
      return false;
    },
    timeallocationsBySemester: function() {
      return _.groupBy(this.data.timeallocation_set, 'semester');
    }
  },
  created: function() {
    if (this.$store.state.profile.proposal_notifications.indexOf(this.id) > -1) {
      this.proposalNotification.enabled = true;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/proposals/' + this.id + '/';
    },
    clearMessages: function() {
      this.$store.commit('clearAllMessages');
    },
    updateProposalNotification: function(evt) {
      evt.preventDefault();
      this.clearMessages();
      this.proposalNotification.isBusy = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/notification/',
        data: { enabled: this.proposalNotification.enabled }
      })
        .done(function(response) {
          that.$store.dispatch('getProfileData');
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
        })
        .fail(function() {
          that.$store.commit('addMessage', { text: 'There was a problem updating your proposal notification, please try again', variant: 'danger' });
        })
        .always(function() {
          that.proposalNotification.isBusy = false;
        });
    },
    setGlobalMembershipLimit: function(timeLimitHours) {
      this.clearMessages();
      this.globallimit.isBusy = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/globallimit/',
        data: { time_limit_hours: timeLimitHours }
      })
        .done(function(response) {
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
          that.reloadCoInvestigatorTable();
        })
        .fail(function(response) {
          if (response.status === 400) {
            that.$store.commit('addMessage', { text: 'Please enter a valid limit', variant: 'danger' });
          } else if (response.status === 403) {
            // This should never actually happen given that only PIs are shown the forms to update the limits
            that.$store.commit('addMessage', { text: 'You must be a principle investigator to update limits', variant: 'danger' });
          } else {
            that.$store.commit('addMessage', { text: 'There was a problem updating the global limit, please try again', variant: 'danger' });
          }
        })
        .always(function() {
          that.globallimit.isBusy = false;
        });
    },
    reloadCoInvestigatorTable: function() {
      this.coInvestigatorTableKey += 1;
    },
    reloadProposalInvitationsList: function() {
      this.proposalInvitationsListKey += 1;
    },
    onCoInvestigatorsInvited: function() {
      this.reloadCoInvestigatorTable();
      this.reloadProposalInvitationsList();
    },
    setGlobalLimit: function(evt) {
      evt.preventDefault();
      this.setGlobalMembershipLimit(this.globallimit.timeLimit);
      this.globallimit.timeLimit = null;
    },
    resetGlobalLimit: function(evt) {
      evt.preventDefault();
      // A negative number means no limit
      this.setGlobalMembershipLimit(-1);
      this.globallimit.timeLimit = null;
    }
  }
};
</script>
<style scoped>
/* Control what is displayed when toggle is open vs. closed */
.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}
.progress-style {
  min-width: 3em;
}
h4 {
  padding-top: 0.7em;
  padding-bottom: 0.4em;
}
ul {
  padding-inline-start: 0;
}
li {
  list-style: none;
}
li.observation-requests-links::before {
  content: '\00BB';
}
</style>
