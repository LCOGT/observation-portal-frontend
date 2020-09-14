<template>
  <b-col>
    <template v-if="proposalLoadError">
      <p class="text-center my-2">
        Oops, there was a problem getting your data, please try again
      </p>
    </template>
    <template v-else-if="!proposalLoaded">
      <div class="text-center my-2">
        <i class="fa fa-spin fa-spinner" />
      </div>
    </template>
    <template v-else-if="proposalLoaded && !proposal.id">
      <not-found />
    </template>
    <template v-else>
      <b-row>
        <b-col md="8">
          <h3>
            {{ proposal.id }} <small>{{ proposal.title }}</small>
          </h3>
          <p>{{ proposal.abstract }}</p>
          <h4>
            Total Observation Requests:
            <router-link :to="{ name: 'home', query: { proposal: id } }" title="View requests">{{ requestgroupCount }}</router-link>
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
                <!-- TODO: If there are more than 25 members, paginate the results -->
                <!-- <form method="get" role="form" action="">
          <div class="form-row">
            <div class="col mb-0 mt-auto">{% bootstrap_field members_filter.form.first_name form_group_class="form-group mb-0 mt-auto" %}</div>
            <div class="col mb-0 mt-auto">{% bootstrap_field members_filter.form.last_name form_group_class="form-group mb-0 mt-auto" %}</div>
            <div class="col mb-0 mt-auto">{% bootstrap_field members_filter.form.username form_group_class="form-group mb-0 mt-auto" %}</div>
            <div class="col mb-0 mt-auto">{% bootstrap_field members_filter.form.email form_group_class="form-group mb-0 mt-auto" %}</div>
            <div class="col-1 mb-0 mt-auto">{% bootstrap_button button_type="submit" content="Filter" button_class="btn-outline-secondary" %}</div>
          </div>
        </form> -->
                <br />
                <table class="table table-responsive">
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>UserId</th>
                      <th>Email</th>
                      <th>Hour Limit</th>
                      <th>Hours Requested</th>
                      <th v-if="proposal.public">Simple Interface</th>
                      <th v-if="userIsPI">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="coi in coInvestigators" :key="coi.username">
                      <td>{{ coi.first_name }}</td>
                      <td>{{ coi.last_name }}</td>
                      <td>{{ coi.username }}</td>
                      <td>
                        <a :href="'mailto:' + coi.email">{{ coi.email }}</a>
                      </td>
                      <td>
                        <span v-if="coi.time_limit < 0">No Limit</span>
                        <span v-else>{{ (coi.time_limit / 3600) | formatFloat(3) }}</span>
                        <template v-if="userIsPI">
                          <b-link v-b-toggle="'collapse-' + coi.username" href="#"><i class="fas fa-edit"></i></b-link>
                          <b-collapse :id="'collapse-' + coi.username">
                            <b-form>
                              <b-form-group>
                                <b-form-input
                                  :id="'dropdown-form-user-limit-' + coi.username"
                                  v-model="limit.timeLimitPerUser[coi.username]"
                                  type="number"
                                  size="sm"
                                  min="0"
                                  step="0.01"
                                  placeholder="Hours"
                                ></b-form-input>
                              </b-form-group>
                              <b-button variant="outline-secondary" size="sm" block :disabled="limit.isBusy" @click="resetUserLimit(coi.username)">
                                Remove Limit
                              </b-button>
                              <b-button variant="outline-secondary" size="sm" block :disabled="limit.isBusy" @click="setUserLimit(coi.username)">
                                Set Limit
                              </b-button>
                            </b-form>
                          </b-collapse>
                        </template>
                      </td>
                      <td>{{ coi.time_used_by_user | formatFloat(3) }}</td>
                      <td v-if="proposal.public"><i v-if="simpleInterface" class="fa fa-check"></i></td>
                      <td v-if="userIsPI">
                        <!-- TODO: Replace with button to delete membership {% url 'proposals:membership-delete' mem.id %} -->
                        <a href="#"><i class="fa fa-trash"></i></a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <!-- TODO: If there are more than 25 members, keep this row -->
                <div class="row">
                  <div class="col">
                    <!-- <span class="float-left"> {% bootstrap_pagination members_page size="small" parameter_name="ci_page" extra=request.GET.urlencode %}</span>
            <span class="float-right">{{ members_page.paginator.count }} Co Investigators</span> -->
                  </div>
                </div>
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
                    <td>
                      Available: {{ timeallocation.ipp_time_available | formatFloat(1) }} Limit: {{ timeallocation.ipp_limit | formatFloat(1) }}
                    </td>
                  </tr>
                </template>
              </template>
            </tbody>
          </table>
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
              Invite co-investigators by entering their email address below and pressing "add". If you would like to add multiple address at once,
              enter them below, comma separated. If the user is already registered with LCO, they will be added to this proposal. If not, they will be
              invited.
            </div>
            <!-- TODO: form to invite people -->
            <!-- <form method="POST" action="{% url 'proposals:invite' pk=object.id %}" class="form-inline">
        {% csrf_token %}
        <div class="form-group mr-md-2">
          <label class="sr-only" for="email">Invite a Co-Investigator</label>
          <input name="email" class="form-control" placeholder="Email Address(s)" />
        </div>
        <button type="submit" class="btn btn-outline-secondary">Add</button>
      </form> -->
            <br />
            <dl>
              <!-- TODO: Translate this -->
              <dt>Pending Invitations</dt>
              <!-- TODO: Add these after adding the endpoint that gets proposal invites -->

              <!-- {% for invite in object.proposalinvite_set.all %} {% if not invite.used %}
        <dd>
          <a href="mailto:{{ invite.email }}">{{ invite.email }}</a>
        </dd>
        <dd>Invited: {{ invite.sent }}</dd>
        <dd><a href="{% url 'proposals:proposalinvite-delete' invite.id %}">Delete</a></dd>
        {% endif %} {% empty %}
        <p>No pending invitations.</p>
        {% endfor %} -->
            </dl>
          </template>
        </b-col>
      </b-row>
    </template>
  </b-col>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

import { formatFloat } from '@/utils.js';
import NotFound from '@/components/NotFound.vue';

export default {
  name: 'ProposalDetail',
  filters: {
    formatFloat: function(value, precision) {
      return formatFloat(value, precision);
    }
  },
  components: {
    NotFound
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      proposal: {},
      proposalLoadError: false,
      proposalLoaded: false,
      requestgroupCount: 0,
      proposalNotifications: {
        enabled: false,
        isBusy: false
      },
      limit: {
        timeLimitPerUser: {}, // Keys are username, values are time limit
        globalTimeLimit: null,
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
      return _.filter(this.proposal.users, { role: 'CI' });
    },
    principleInvestigators: function() {
      return _.filter(this.proposal.users, { role: 'PI' });
    },
    userIsPI: function() {
      for (let pi of this.principleInvestigators) {
        if (pi.username === this.$store.state.profile.username) {
          return true;
        }
      }
      return false;
    },
    simpleInterface: function() {
      return this.profile && this.profile.profile && this.profile.profile.simple_interface;
    },
    timeallocationsBySemester: function() {
      return _.groupBy(this.proposal.timeallocation_set, 'semester');
    }
  },
  watch: {
    coInvestigators: function(newCois) {
      for (let coi of newCois) {
        if (coi.time_limit >= 0) {
          this.limit.timeLimitPerUser[coi.username] = coi.time_limit / 3600;
        } else {
          this.limit.timeLimitPerUser[coi.username] = null;
        }
      }
    }
  },
  created: function() {
    this.getProposal();
    this.getRequestgroupCount();
    if (this.$store.state.profile.proposal_notifications.indexOf(this.id) > -1) {
      this.proposalNotifications.enabled = true;
    }
  },
  methods: {
    getRequestgroupCount() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/requestgroups/?proposal=' + this.id + '&limit=1'
      }).done(function(response) {
        that.requestgroupCount = response.count;
      });
    },
    getProposal: function() {
      this.proposalLoaded = false;
      this.proposalLoadError = false;
      this.proposal = {};
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/'
      })
        .done(function(response) {
          that.proposal = response;
        })
        .fail(function(response) {
          if (response.status !== 404) {
            that.proposalLoadError = true;
          }
        })
        .always(function() {
          that.proposalLoaded = true;
        });
    },
    updateProposalNotification: function(evt) {
      evt.preventDefault();
      this.proposalNotifications.isBusy = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/proposalnotifications/',
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
    setMembershipLimit: function(data) {
      this.limit.isBusy = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/limit/',
        contentType: 'application/json',
        data: JSON.stringify(data)
      })
        .done(function(response) {
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
          that.getProposal();
        })
        .fail(function(response) {
          if (response.status === 400) {
            that.$store.commit('addMessage', { text: 'Please enter a valid limit', variant: 'danger' });
          } else if (response.status === 404) {
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
        usernames: _.map(this.coInvestigators, 'username')
      });
      this.limit.globalTimeLimit = null;
    },
    resetGlobalLimit: function(evt) {
      this.setGlobalLimit(evt, -1);
    },
    setUserLimit: function(username, timeLimit) {
      this.setMembershipLimit({
        time_limit_hours: timeLimit || this.limit.timeLimitPerUser[username],
        usernames: [username]
      });
    },
    resetUserLimit: function(username) {
      this.setUserLimit(username, -1);
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
