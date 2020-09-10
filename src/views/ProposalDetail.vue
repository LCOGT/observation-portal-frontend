<template>
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
          Co Investigators <small><i id="toggleci" class="fa fa-eye"></i></small>
        </h4>
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
                    <!-- TODO: make this a dropdown: click on the edit icon with a dropdown icon, to display the form to set or delete
                  the limit -->
                    <!-- <a href="#" class="memlimit"><i class="fas fa-edit" data-membership="{{ mem.id }}"></i></a>
                  <form method="POST" action="{% url 'proposals:membership-limit' pk=mem.id %}" class="form-inline limitform" style="display: none">
                    {% csrf_token %}
                    <div class="form-group mr-md-2 mb-md-1">
                      <input name="time_limit" type="number" min="-1" class="form-control" style="width: 90px" step="0.01" {% if mem.time_limit /> 0 %}
                      value="{{ mem.time_limit_hours | floatformat:3 }}" {% endif %} />
                    </div>
                    <button type="submit" class="btn btn-outline-secondary remove-limit mr-md-2">Remove Limit</button>
                    <button type="submit" class="btn btn-outline-secondary">Set Limit</button>
                  </form> -->
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
                <td>Available: {{ timeallocation.ipp_time_available | formatFloat(1) }} Limit: {{ timeallocation.ipp_limit | formatFloat(1) }}</td>
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
        <!-- TODO: form for setting global membership -->
        <!-- <form method="POST" action="{% url 'proposals:membership-global' pk=object.id %}" class="form-inline">
        {% csrf_token %}
        <div class="form-group mr-md-2">
          <input name="time_limit" type="number" class="form-control" style="width: 90px" min="-1" step="0.01" placeholder="Hours" />
        </div>
        <button type="submit" class="btn btn-outline-secondary remove-limit mr-md-2">Remove Limit</button>
        <button type="submit" class="btn btn-outline-secondary">Set Global Limit</button>
      </form> -->
        <br />
        <strong>Invite Co-Investigators</strong>
        <div class="help-block">
          <!-- TODO: translate -->
          Invite co-investigators by entering their email address below and pressing "add". If you would like to add multiple address at once, enter
          them below, comma separated. If the user is already registered with LCO, they will be added to this proposal. If not, they will be invited.
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
  <!-- <script type="text/javascript">
    $('#toggleci').click(function(){
        $(this).toggleClass('fa-eye-slash');
        $('#cilist').toggle();
    });
    $('[data-toggle="tooltip"]').tooltip();

    $('.remove-limit').click(function(){
      $(this).parent().find('input[name="time_limit"]').val('-1');
    });

    $('.memlimit').click(function(event){
      event.preventDefault();
      $('.limitform').hide();
      $(this).next().first().show();
    })

</script> -->
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

import { formatFloat } from '@/utils.js';

export default {
  name: 'ProposalDetail',
  filters: {
    formatFloat: function(value, precision) {
      return formatFloat(value, precision);
    }
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
      dataLoadError: false,
      dataLoaded: false,
      requestgroupCount: 0,
      proposalNotifications: {
        enabled: false,
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
    principleInvestigators: function() {
      let pis = [];
      for (let member in this.proposal.users) {
        if (this.proposal.users[member].role === 'PI') {
          pis.push(this.proposal.users[member]);
        }
      }
      return pis;
    },
    userIsPI: function() {
      for (let pi of this.principleInvestigators) {
        if (pi.username === this.$store.state.profile.username) {
          return true;
        }
      }
      return false;
    },
    coInvestigators: function() {
      let cois = [];
      for (let member in this.proposal.users) {
        if (this.proposal.users[member].role === 'CI') {
          cois.push(this.proposal.users[member]);
        }
      }
      return cois;
    },
    simpleInterface: function() {
      return this.profile && this.profile.profile && this.profile.profile.simple_interface;
    },
    timeallocationsBySemester: function() {
      return _.groupBy(this.proposal.timeallocation_set, 'semester');
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
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/proposals/' + this.id + '/'
      })
        .done(function(response) {
          that.proposal = response;
        })
        .fail(function(response) {
          if (response.status !== 404) {
            that.dataLoadError = true;
          }
        })
        .always(function() {
          that.dataLoaded = true;
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
    }
  }
};
</script>
