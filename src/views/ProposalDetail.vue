<template>
  <b-row>
    <b-col md="8">
      <data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
        <h3>
          {{ data.id }} <small>{{ data.title }}</small>
        </h3>
        <p>{{ data.abstract }}</p>
        <h4>
          Total Observation Requests:
          <router-link :to="{ name: 'home', query: { proposal: id } }" title="View requests">{{ data.requestgroup_count }}</router-link>
        </h4>
        <template v-if="principleInvestigators.length === 1">
          <h4>
            Principal Investigator: {{ principleInvestigators[0].first_name }} {{ principleInvestigators[0].last_name }}
            <a :href="'mailto:' + principleInvestigators[0].email">{{ principleInvestigators[0].email }}</a>
          </h4>
        </template>
        <template v-else>
          <h4>
            Principal Investigators:
            <ul>
              <li v-for="pi in principleInvestigators" :key="pi.username">
                {{ pi.first_name }} {{ pi.last_name }} <a :href="'mailto:' + pi.email">{{ pi.email }}</a>
              </li>
            </ul>
          </h4>
        </template>
        <template v-if="userIsPI">
          <h4>
            Co Investigators
            <small>
              <b-link v-b-toggle.collapse-cois href="#">
                <span class="when-open"><i class="fa fa-eye"></i></span>
                <span class="when-closed"><i class="fa fa-eye fa-eye-slash"></i></span>
              </b-link>
            </small>
          </h4>
          <b-collapse id="collapse-cois" visible>
            <div id="cilist">
              <br />
              <b-form-group v-if="paginateCoInvestigatorTable" label="Filter" label-for="CoIfilterInput" label-sr-only>
                <b-input-group>
                  <b-form-input id="CoIfilterInput" v-model="coInvestigatorTable.filter" type="search" placeholder="Type to Search"></b-form-input>
                  <b-input-group-append>
                    <b-button :disabled="!coInvestigatorTable.filter" @click="coInvestigatorTable.filter = ''">Clear</b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
              <b-table
                id="coinvestigator-table"
                :items="coInvestigators"
                :fields="coInvestigatorTable.fields"
                :per-page="coInvestigatorTable.perPage"
                :current-page="coInvestigatorTable.currentPage"
                :filter-included-fields="coInvestigatorTable.filterOn"
                :filter="coInvestigatorTable.filter"
                responsive
                @filtered="onFiltered"
              >
                <template v-slot:cell(remove_member)="data">
                  <b-link
                    href="#"
                    :disabled="deleteMembership.isBusy"
                    @click="
                      confirm(getMembershipDeleteConfirmationMessage(data.item.email), deleteCoInvestigatorMembership, { membershipId: data.item.id })
                    "
                  >
                    <i class="fa fa-trash"></i>
                  </b-link>
                </template>
                <template v-slot:cell(simple_interface)="data">
                  <i v-if="data.item.simple_interface" class="fa fa-check"></i>
                </template>
                <template v-slot:cell(email)="data">
                  <a :href="'mailto:' + data.item.email">{{ data.item.email }}</a>
                </template>
                <template v-slot:cell(time_limit)="data">
                  <span v-if="data.item.time_limit < 0">No Limit</span>
                  <span v-else>{{ (data.item.time_limit / 3600) | formatFloat(3) }}</span>
                  <template v-if="userIsPI">
                    <b-link v-b-toggle="'collapse-' + data.item.username" href="#"><i class="fas fa-edit"></i></b-link>
                    <b-collapse :id="'collapse-' + data.item.username">
                      <b-form>
                        <b-form-group>
                          <b-form-input
                            :id="'dropdown-form-user-limit-' + data.item.username"
                            v-model="limit.timeLimitPerUser[data.item.id]"
                            type="number"
                            size="sm"
                            min="0"
                            step="0.01"
                            placeholder="Hours"
                          ></b-form-input>
                        </b-form-group>
                        <b-button variant="outline-secondary" size="sm" block :disabled="limit.isBusy" @click="resetUserLimit(data.item.id)">
                          Remove Limit
                        </b-button>
                        <b-button variant="outline-secondary" size="sm" block :disabled="limit.isBusy" @click="setUserLimit(data.item.id)">
                          Set Limit
                        </b-button>
                      </b-form>
                    </b-collapse>
                  </template>
                </template>
                <template v-slot:cell(time_used_by_user)="data">
                  {{ data.item.time_used_by_user | formatFloat(3) }}
                </template>
              </b-table>
              <custom-pagination
                v-if="paginateCoInvestigatorTable"
                table-id="coinvestigator-table"
                :total-rows="coInvestigatorTable.totalRows"
                :per-page="coInvestigatorTable.perPage"
                :current-page="coInvestigatorTable.currentPage"
                @pageChange="onPageChange"
              ></custom-pagination>
              <br />
            </div>
          </b-collapse>
        </template>
        <h4>Time Allocation</h4>
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
                    <div class="progress">
                      <div class="progress-bar" role="progress-bar">
                        {{ timeallocation.std_time_used | formatFloat(1) }}/{{ timeallocation.std_allocation | formatFloat(1) }}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr :key="semester + '-tc-time-' + idx">
                  <td colspan="2"></td>
                  <td>Time Critical</td>
                  <td>
                    <div class="progress">
                      <div class="progress-bar" role="progress-bar">
                        {{ timeallocation.tc_time_used | formatFloat(1) }}/{{ timeallocation.tc_allocation | formatFloat(1) }}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr :key="semester + '-rr-time-' + idx">
                  <td colspan="2"></td>
                  <td>Rapid Response</td>
                  <td>
                    <div class="progress">
                      <div class="progress-bar" role="progress-bar">
                        {{ timeallocation.rr_time_used | formatFloat(1) }}/{{ timeallocation.rr_allocation | formatFloat(1) }}
                      </div>
                    </div>
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
      </data-loader>
    </b-col>
    <b-col md="4">
      <strong>Email Notifications</strong>
      <div class="help-block">
        You will recieve notifications whenever a requested observation on this proposal is completed.
      </div>
      <b-form @submit="updateProposalNotification">
        <b-form-group id="checkbox-group-proposal-notification" label-for="checkbox-proposal-notification">
          <b-form-checkbox id="checkbox-proposal-notification" v-model="proposalNotifications.enabled">
            Notifications enabled
          </b-form-checkbox>
        </b-form-group>
        <b-button type="submit" variant="primary" :disabled="proposalNotifications.isBusy">
          Save
        </b-button>
      </b-form>
      <br />
      <dl>
        <dt>Links</dt>
        <dd><a :href="archiveLink" target="_blank">View Data on the LCO Science Archive</a></dd>
      </dl>
      <template v-if="userIsPI">
        <strong>Global Hour Limit</strong>
        <div class="help-block">
          <!-- TODO: Translate this -->
          Use this form to set an hour limit for every Co-I on the proposal.
        </div>
        <b-form inline @submit="setGlobalLimit" @reset="resetGlobalLimit">
          <b-form-group id="input-group-global-time-limit" label-for="input-global-time-limit" label="Global Limit (Hours)" label-sr-only>
            <b-form-input
              id="input-global-time-limit"
              v-model="limit.globalTimeLimit"
              type="number"
              min="0"
              step="0.01"
              placeholder="Hours"
              required
            />
          </b-form-group>
          <b-button type="reset" variant="outline-secondary" :disabled="limit.isBusy">
            Remove Limit
          </b-button>
          <b-button type="submit" variant="outline-secondary" :disabled="limit.isBusy">
            Set Global Limit
          </b-button>
        </b-form>
        <br />
        <strong>Invite Co-Investigators</strong>
        <div class="help-block">
          <!-- TODO: translate -->
          Invite co-investigators by entering their email address below and pressing "add". If you would like to add multiple address at once, enter
          them below, comma separated. If the user is already registered with LCO, they will be added to this proposal. If not, they will be invited.
        </div>
        <b-form @submit="inviteCoInvestigators">
          <b-form-group
            id="input-group-invite-co-investigator"
            label-for="input-invite-co-investigator"
            label="Invite a Co-Investigator"
            label-sr-only
          >
            <b-form-input id="input-invite-co-investigator" v-model="invite.emailAddresses" placeholder="Email Address(s)" required />
          </b-form-group>
          <b-button type="submit" variant="outline-secondary" :disabled="invite.isBusy">
            Add
          </b-button>
        </b-form>
        <br />
        <dl>
          <!-- TODO: Translate this -->
          <dt>Pending Invitations</dt>
          <template v-if="invitationsList.isBusy">
            <div class="text-center my-2">
              <i class="fa fa-spin fa-spinner" />
            </div>
          </template>
          <template v-else-if="pendingInvitations.length > 0">
            <dd v-for="invitation in pendingInvitations" :key="invitation.id">
              <div>
                <a :href="'mailto:' + invitation.email">{{ invitation.email }}</a>
              </div>
              <div>Invited: {{ invitation.sent | formatDate }}</div>
              <b-link
                :disabled="deleteInvite.isBusy"
                @click="confirm(getDeleteInvitationConfirmationMessage(invitation.email), deleteInvitation, { invitationId: invitation.id })"
              >
                Delete Invitation
              </b-link>
            </dd>
            <br />
          </template>
          <template v-else>
            <p>No pending invitations.</p>
          </template>
        </dl>
      </template>
    </b-col>
  </b-row>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

import { formatFloat, formatDate } from '@/utils.js';
import CustomPagination from '@/components/util/CustomPagination.vue';
import DataLoader from '@/components/DataLoader.vue';
import { getDataMixin } from '@/components/util/getDataMixins.js';

export default {
  name: 'ProposalDetail',
  filters: {
    formatFloat: function(value, precision) {
      return formatFloat(value, precision);
    },
    formatDate: function(date) {
      return formatDate(date);
    }
  },
  components: {
    DataLoader,
    CustomPagination
  },
  mixins: [getDataMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      invitations: [],
      coInvestigatorTable: {
        perPage: 25,
        currentPage: 1,
        totalRows: 0,
        filterOn: ['first_name', 'last_name', 'username', 'email'],
        filter: null,
        fields: [
          {
            key: 'first_name',
            sortable: true
          },
          {
            key: 'last_name',
            sortable: true
          },
          {
            key: 'username',
            label: 'UserId',
            sortable: true
          },
          {
            key: 'email',
            sortable: true
          },
          {
            key: 'time_limit',
            label: 'Hour Limit',
            sortable: true
          },
          {
            key: 'time_used_by_user',
            label: 'Hours Requested',
            sortable: true
          }
        ]
      },
      proposalNotifications: {
        enabled: false,
        isBusy: false
      },
      limit: {
        timeLimitPerUser: {}, // Keys are membership IDs, values are time limit
        globalTimeLimit: null,
        isBusy: false
      },
      invite: {
        emailAddresses: '',
        isBusy: false
      },
      deleteInvite: {
        isBusy: false
      },
      deleteMembership: {
        isBusy: false
      },
      invitationsList: {
        isBusy: false
      }
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    archiveLink: function() {
      return this.$store.state.urls.archiveApi + '?PROPID=' + this.id;
    },
    coInvestigators: function() {
      return _.filter(this.data.users, { role: 'CI' });
    },
    paginateCoInvestigatorTable: function() {
      return this.coInvestigators.length > 25;
    },
    principleInvestigators: function() {
      return _.filter(this.data.users, { role: 'PI' });
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
    },
    pendingInvitations: function() {
      return _.filter(this.invitations, function(invitation) {
        return !invitation.used ? true : false;
      });
    }
  },
  watch: {
    coInvestigators: function(newCois) {
      this.coInvestigatorTable.totalRows = newCois.length;
      for (let coi of newCois) {
        if (coi.time_limit >= 0) {
          this.limit.timeLimitPerUser[coi.id] = coi.time_limit / 3600;
        } else {
          this.limit.timeLimitPerUser[coi.id] = null;
        }
      }
    },
    data: function(proposal) {
      let fieldDefinition = { key: 'simple_interface' };
      if (proposal.public && !this.fieldAlreadyExists(fieldDefinition.key)) {
        this.coInvestigatorTable.fields.push(fieldDefinition);
      }
    },
    userIsPI: function(userIsPI) {
      let fieldDefinition = { key: 'remove_member', label: 'Remove' };
      if (userIsPI && !this.fieldAlreadyExists(fieldDefinition.key)) {
        this.coInvestigatorTable.fields.push(fieldDefinition);
      }
    }
  },
  created: function() {
    this.getInvitations();
    if (this.$store.state.profile.proposal_notifications.indexOf(this.id) > -1) {
      this.proposalNotifications.enabled = true;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/proposals/' + this.id + '/';
    },
    initializeDataType: function() {
      return 'detail';
    },
    fieldAlreadyExists: function(key) {
      let fieldAlreadyExists = false;
      for (let field of this.coInvestigatorTable.fields) {
        if (field.key === key) {
          fieldAlreadyExists = true;
          break;
        }
      }
      return fieldAlreadyExists;
    },
    getInvitations: function() {
      this.invitationsList.isBusy = true;
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/invitations/?proposal=' + this.id
      })
        .done(function(response) {
          that.invitations = response.results;
        })
        .always(function() {
          that.invitationsList.isBusy = false;
        });
    },
    clearMessages: function() {
      this.$store.commit('clearAllMessages');
    },
    updateProposalNotification: function(evt) {
      evt.preventDefault();
      this.clearMessages();
      this.proposalNotifications.isBusy = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/notification/',
        data: { enabled: this.proposalNotifications.enabled }
      })
        .done(function(response) {
          that.$store.dispatch('getProfileData');
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
        })
        .fail(function() {
          that.$store.commit('addMessage', { text: 'There was a problem updating your proposal notification, please try again', variant: 'danger' });
        })
        .always(function() {
          that.proposalNotifications.isBusy = false;
        });
    },
    setMembershipLimit: function(membershipLimitPostData) {
      this.clearMessages();
      this.limit.isBusy = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/memberships/limit/',
        contentType: 'application/json',
        data: JSON.stringify(membershipLimitPostData)
      })
        .done(function(response) {
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
          that.getData();
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
          that.limit.isBusy = false;
        });
    },
    setGlobalLimit: function(evt, globalTimeLimit) {
      evt.preventDefault();
      this.setMembershipLimit({
        time_limit_hours: globalTimeLimit || this.limit.globalTimeLimit,
        membership_ids: _.map(this.coInvestigators, 'id')
      });
      this.limit.globalTimeLimit = null;
    },
    resetGlobalLimit: function(evt) {
      // A negative number means no limit
      this.setGlobalLimit(evt, -1);
    },
    setUserLimit: function(membershipId, timeLimit) {
      this.setMembershipLimit({
        time_limit_hours: timeLimit || this.limit.timeLimitPerUser[membershipId],
        membership_ids: [membershipId]
      });
    },
    resetUserLimit: function(membershipId) {
      // A negative number means no limit
      this.setUserLimit(membershipId, -1);
    },
    parseInviteBadRequestErrors: function(emails, errors) {
      // Put the errors returned from a bad request to send out invitations into a list of
      // strings that are useful to the user.
      let errorMessages = [];
      for (let error in errors) {
        if (error === 'emails') {
          for (let invalidEmailIndex in errors[error]) {
            let message;
            if (errors[error] instanceof Array) {
              message = errors[error].join(',');
            } else {
              message = errors[error][invalidEmailIndex];
            }
            errorMessages.push(emails[invalidEmailIndex] + ': ' + message);
          }
        } else {
          errorMessages.push(errors[error]);
        }
      }
      return errorMessages;
    },
    getArrayOfEmailsToInvite: function() {
      // Remove whitespace from the comma-separated emails that the user entered, and
      // turn it into an array of email addresses
      let emails = _.replace(this.invite.emailAddresses, /\s/g, '');
      emails = _.trim(emails, ',');
      emails = _.split(emails, ',');
      return emails;
    },
    inviteCoInvestigators: function(evt) {
      evt.preventDefault();
      this.clearMessages();
      this.invite.isBusy = true;
      let emails = this.getArrayOfEmailsToInvite();
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/invite/',
        data: JSON.stringify({ emails: emails }),
        contentType: 'application/json'
      })
        .done(function(response) {
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
          that.getInvitations();
          that.getData();
        })
        .fail(function(response) {
          if (response.status === 400) {
            for (let errorMessage of that.parseInviteBadRequestErrors(emails, response.responseJSON)) {
              that.$store.commit('addMessage', { text: errorMessage, variant: 'danger' });
            }
          } else {
            that.$store.commit('addMessage', { text: 'There was a problem adding co-investigators, please try again', variant: 'danger' });
          }
        })
        .always(function() {
          that.invite.isBusy = false;
        });
    },
    confirm: function(confirmationMessage, callback, args) {
      // Display a modal where the user can either proceed or cancel running the callback
      this.$bvModal.msgBoxConfirm(confirmationMessage).then(proceed => {
        if (proceed) {
          callback(args);
        }
      });
    },
    getDeleteInvitationConfirmationMessage: function(email) {
      return 'Are you sure you want to delete the invitation for ' + email + ' for this proposal?';
    },
    deleteInvitation: function(args) {
      this.clearMessages();
      this.deleteInvite.isBusy = true;
      let that = this;
      $.ajax({
        method: 'DELETE',
        url: this.observationPortalApiUrl + '/api/invitations/' + args.invitationId + '/'
      })
        .done(function() {
          that.$store.commit('addMessage', { text: 'Invitation deleted', variant: 'success' });
          that.getInvitations();
        })
        .fail(function(response) {
          if (response.status === 404) {
            // The proposal invitation does not exist, maybe it was deleted while this page was open.
            that.$store.commit('addMessage', {
              text: 'The invitation that you tried to delete does not exist, please try refreshing your page to get an updated list',
              variant: 'danger'
            });
          } else {
            that.$store.commit('addMessage', { text: 'There was a problem deleting the invitation, please try again', variant: 'danger' });
          }
        })
        .always(function() {
          that.deleteInvite.isBusy = false;
        });
    },
    getMembershipDeleteConfirmationMessage: function(email) {
      return 'Are you sure you want to remove ' + email + ' from this proposal?';
    },
    deleteCoInvestigatorMembership: function(args) {
      this.clearMessages();
      this.deleteMembership.isBusy = true;
      let that = this;
      $.ajax({
        method: 'DELETE',
        url: this.observationPortalApiUrl + '/api/memberships/' + args.membershipId + '/'
      })
        .done(function() {
          that.$store.commit('addMessage', { text: 'Membership deleted', variant: 'success' });
          that.getData();
        })
        .fail(function(response) {
          if (response.status === 404) {
            that.$store.commit('addMessage', {
              text: 'The membership that you tried to delete does not exist, please try refreshing your page to get an updated list',
              variant: 'danger'
            });
          } else {
            that.$store.commit('addMessage', { text: 'There was a problem deleting the membership, please try again', variant: 'danger' });
          }
        })
        .always(function() {
          that.deleteMembership.isBusy = false;
        });
    },
    onFiltered: function(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.coInvestigatorTable.totalRows = filteredItems.length;
      this.coInvestigatorTable.currentPage = 1;
    },
    onPageChange: function(newPage) {
      this.coInvestigatorTable.currentPage = newPage;
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
ul {
  list-style-type: none;
}
#input-global-time-limit {
  width: 90px;
}
</style>
