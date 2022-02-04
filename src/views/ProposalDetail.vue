<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
    <b-row>
      <b-col>
        <b-row>
          <b-col md="8" cols="12">
            <h3>
              {{ data.id }} <small class="text-muted">{{ data.title }}</small>
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
            <template v-if="data.tags && data.tags.length > 0">
              <span class="font-weight-bolder">Proposal Tags</span>
              <div>
                <b-badge v-for="tag in data.tags" :key="tag" variant="primary" class="mr-1">{{ tag }}</b-badge>
              </div>
              <br />
            </template>
            <span class="font-weight-bolder"> Email Notifications </span>
            <sup
              v-b-tooltip="tooltipConfig"
              class="text-primary"
              title="If notifications are enabled, you will receive notifications whenever a requested observation on this proposal is completed."
            >
              ?
            </sup>
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
        <template v-if="userIsCI">
          <h2>
            Co-Investigator Time Allocation
            <small>
              <b-link v-b-toggle.collapse-coi-time-allocation href="#">
                <span class="when-open"><i class="fa fa-eye"></i></span>
                <span class="when-closed"><i class="fa fa-eye fa-eye-slash"></i></span>
              </b-link>
            </small>
          </h2>
          <b-collapse id="collapse-coi-time-allocation" class="w-100" visible>
            <b-col v-if="coInvestigatorHasNoTimeLimit" md="9" class="mb-4">
              <span>
                {{ coInvestigatorTimeInformation.timeUsed | formatFloat(1) }} hours used. The Principal Investigator has not set a time limit for this
                Co-Investigator.
              </span>
            </b-col>
            <b-col v-else md="9">
              <span>
                {{ coInvestigatorTimeInformation.timeUsed | formatFloat(1) }} hours used /
                {{ coInvestigatorTimeInformation.timeLimit | formatFloat(1) }} hours allocated
              </span>
              <b-progress :max="coInvestigatorTimeInformation.timeLimit" class="mb-4">
                <b-progress-bar :value="coInvestigatorTimeInformation.timeUsed" />
              </b-progress>
            </b-col>
          </b-collapse>
        </template>
      </b-col>
    </b-row>
    <h2>Time Allocation</h2>
    <b-row>
      <b-col>
        <div class="table-responsive">
          <b-table id="time-allocation-table" :fields="['semester']" :items="timeAllocationsBySemesterAsList" responsive show-empty>
            <template #cell(semester)="row">
              <span class="font-weight-bold">Semester {{ row.item.semester }}</span>
              <span class="float-right">
                <b-link v-if="row.detailsShowing" class="px-1" @click="row.toggleDetails">
                  <i class="fas fa-angle-double-up fa-lg"></i>
                </b-link>
                <b-link v-else class="px-1" @click="row.toggleDetails">
                  <i class="fas fa-angle-double-down fa-lg"></i>
                </b-link>
              </span>
            </template>
            <template #empty>
              No time is allocated for this proposal.
            </template>
            <template #row-details="data">
              <div v-for="timeallocation in data.item.data" :key="timeallocation.id">
                <b-card header-tag="header" border-variant="light">
                  <template #header>
                    <span>
                      Instrument Type{{ timeallocation.instrument_types.length > 1 ? 's' : '' }}
                      {{ timeallocation.instrument_types.join(', ') }}
                    </span>
                  </template>
                  <b-list-group flush>
                    <b-list-group-item v-if="timeallocation.std_allocation > 0">
                      <b-row v-if="timeallocation.std_allocation > 0">
                        <b-col md="3">Standard Hours</b-col>
                        <b-col md="9">
                          <span>
                            {{ timeallocation.std_time_used | formatFloat(1) }} used / {{ timeallocation.std_allocation | formatFloat(1) }} allocated
                          </span>
                          <b-progress :max="timeallocation.std_allocation">
                            <b-progress-bar :value="timeallocation.std_time_used" />
                          </b-progress>
                        </b-col>
                      </b-row>
                    </b-list-group-item>
                    <b-list-group-item v-if="timeallocation.tc_allocation > 0">
                      <b-row v-if="timeallocation.tc_allocation > 0">
                        <b-col md="3">Time Critical Hours</b-col>
                        <b-col md="9">
                          <span>
                            {{ timeallocation.tc_time_used | formatFloat(1) }} used / {{ timeallocation.tc_allocation | formatFloat(1) }} allocated
                          </span>
                          <b-progress class="progress-text" :max="timeallocation.tc_allocation">
                            <b-progress-bar :value="timeallocation.tc_time_used" />
                          </b-progress>
                        </b-col>
                      </b-row>
                    </b-list-group-item>
                    <b-list-group-item v-if="timeallocation.rr_allocation > 0">
                      <b-row v-if="timeallocation.rr_allocation > 0">
                        <b-col md="3">Rapid Response Hours</b-col>
                        <b-col md="9">
                          <span>
                            {{ timeallocation.rr_time_used | formatFloat(1) }} used / {{ timeallocation.rr_allocation | formatFloat(1) }} allocated
                          </span>
                          <b-progress :max="timeallocation.rr_allocation">
                            <b-progress-bar :value="timeallocation.rr_time_used" />
                          </b-progress>
                        </b-col>
                      </b-row>
                    </b-list-group-item>
                    <b-list-group-item>
                      <b-row>
                        <b-col md="3">IPP</b-col>
                        <b-col md="9">
                          <span>
                            Available: {{ timeallocation.ipp_time_available | formatFloat(1) }}, Limit:
                            {{ timeallocation.ipp_limit | formatFloat(1) }}
                          </span>
                        </b-col>
                      </b-row>
                    </b-list-group-item>
                  </b-list-group>
                </b-card>
              </div>
            </template>
          </b-table>
        </div>
      </b-col>
    </b-row>
  </ocs-data-loader>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';
import { OCSUtil, OCSMixin } from 'ocs-component-lib';

import { tooltipConfig } from '@/utils.js';
import NotFound from '@/components/NotFound.vue';
import CoInvestigatorTable from '@/components/CoInvestigatorTable.vue';
import ProposalInvitations from '@/components/ProposalInvitations.vue';
import InviteCoInvestigatorsForm from '@/components/InviteCoInvestigatorsForm.vue';

export default {
  name: 'ProposalDetail',
  filters: {
    formatFloat: function(value, precision) {
      return OCSUtil.formatFloat(value, precision);
    }
  },
  components: {
    CoInvestigatorTable,
    ProposalInvitations,
    InviteCoInvestigatorsForm,
    NotFound
  },
  mixins: [OCSMixin.getDataMixin],
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
      },
      coInvestigatorTimeInformation: {
        timeUsed: 0,
        timeLimit: 0,
        role: ''
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
    userIsCI: function() {
      return this.coInvestigatorTimeInformation.role === 'CI' ? true : false;
    },
    coInvestigatorHasNoTimeLimit: function() {
      return this.coInvestigatorTimeInformation.timeLimit === -1 ? true : false;
    },
    timeAllocationsBySemesterAsList: function() {
      let groupedTimeAllocationsBySemester = _.groupBy(this.data.timeallocation_set, 'semester');
      let groupedTimeAllocationsBySemesterAsList = [];
      for (let semester in groupedTimeAllocationsBySemester) {
        groupedTimeAllocationsBySemesterAsList.push({
          semester: semester,
          data: groupedTimeAllocationsBySemester[semester]
        });
      }
      // The time allocations of the first semester displayed should initially be expanded
      if (groupedTimeAllocationsBySemesterAsList.length > 0) {
        groupedTimeAllocationsBySemesterAsList[0]['_showDetails'] = true;
      }
      return groupedTimeAllocationsBySemesterAsList;
    }
  },
  created: function() {
    if (this.$store.state.profile.proposal_notifications.indexOf(this.id) > -1) {
      this.proposalNotification.enabled = true;
    }
    this.getCoInvestigatorTimeAllocationInformation();
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/proposals/' + this.id + '/';
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
    },
    updateCoInvestigatorTimeAllocationInformation: function(data) {
      if (data.results.length > 0) {
        let timeLimit = 0;
        let timeUsed = 0;
        // there should only be one result, but future-proof this just in case
        for (let result of data.results) {
          timeLimit += result.time_limit;
          timeUsed += result.time_used_by_user;
        }
        this.coInvestigatorTimeInformation.timeLimit = Math.floor(timeLimit / 3600);
        this.coInvestigatorTimeInformation.timeUsed = Math.floor(timeUsed / 3600);
        this.coInvestigatorTimeInformation.role = 'CI';
      }
    },
    getCoInvestigatorTimeAllocationInformation: function() {
      let that = this;
      $.ajax({
        method: 'GET',
        url: this.observationPortalApiUrl + '/api/memberships/',
        data: { proposal: this.id, username: this.$store.state.profile.username, role: 'CI' }
      }).done(function(data) {
        that.updateCoInvestigatorTimeAllocationInformation(data);
      });
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
<style>
#time-allocation-table > thead {
  display: none;
}
#time-allocation-table > tbody > tr > td {
  padding-left: 0px;
  padding-right: 0px;
}
</style>
