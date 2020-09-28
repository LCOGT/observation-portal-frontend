<template>
  <b-container class="p-0">
    <template v-if="userIsPI">
      <div>
        <br />
        <b-form inline @submit="onSubmit">
          <b-input-group id="input-group-username" class="col-md p-1" label="Username contains" label-for="input-username" label-sr-only>
            <b-form-input id="input-username" v-model="queryParams.username" placeholder="Username"></b-form-input>
          </b-input-group>
          <b-input-group id="input-group-first-name" class="col-md p-1" label="First name contains" label-for="input-first-name" label-sr-only>
            <b-form-input id="input-first-name" v-model="queryParams.first_name" placeholder="First name contains"></b-form-input>
          </b-input-group>
          <b-input-group id="input-group-last-name" class="col-md p-1" label="Last name contains" label-for="input-last-name" label-sr-only>
            <b-form-input id="input-last-name" v-model="queryParams.last_name" placeholder="Last name contains"></b-form-input>
          </b-input-group>
          <b-input-group id="input-group-email" class="col-md p-1" label="Email contains" label-for="input-email" label-sr-only>
            <b-form-input id="input-email" v-model="queryParams.email" placeholder="Email contains"></b-form-input>
          </b-input-group>
          <b-input-group class="col-md-1 p-1">
            <b-button type="submit" variant="outline-info" :disabled="isBusy">
              <span>Filter</span>
            </b-button>
          </b-input-group>
        </b-form>
        <b-table id="coinvestigator-table" :items="data.results" :fields="fields" responsive :busy="isBusy" small show-empty>
          <template v-slot:table-busy>
            <br />
            <div class="text-center my-2"><i class="fa fa-spin fa-spinner" /> Loading co-investigators...</div>
            <br />
          </template>
          <template v-slot:empty>
            <div>
              <center>
                <div>No co-investigators found</div>
                <br />
              </center>
            </div>
          </template>
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
            <b-link v-b-toggle="'collapse-' + data.item.username" href="#"><i class="fas fa-edit"></i></b-link>
            <b-collapse :id="'collapse-' + data.item.username">
              <b-form>
                <b-form-group>
                  <b-form-input
                    :id="'dropdown-form-user-limit-' + data.item.username"
                    v-model="limit.timeLimitByMembershipId[data.item.id]"
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
          <template v-slot:cell(time_used_by_user)="data">
            {{ data.item.time_used_by_user | formatFloat(3) }}
          </template>
        </b-table>
        <custom-pagination
          v-if="!isBusy"
          table-id="coinvestigator-table"
          :per-page="queryParams.limit"
          :total-rows="data.count"
          :current-page="currentPage"
          @pageChange="onPageChange"
        ></custom-pagination>
        <br />
      </div>
    </template>
  </b-container>
</template>
<script>
import $ from 'jquery';

import { formatFloat } from '@/utils.js';
import { paginationAndFilteringMixin } from '@/components/util/paginationMixins.js';
import { confirmMixin } from '@/components/util/utilMixins.js';
import CustomPagination from '@/components/util/CustomPagination.vue';

export default {
  name: 'CoInvestigatorTable',
  components: {
    CustomPagination
  },
  filters: {
    formatFloat: function(value, precision) {
      return formatFloat(value, precision);
    }
  },
  mixins: [paginationAndFilteringMixin, confirmMixin],
  props: {
    proposalId: {
      type: String,
      required: true
    },
    proposalIsPublic: {
      type: Boolean,
      required: true
    },
    userIsPI: {
      type: Boolean,
      required: true,
      validator: function(value) {
        // The user must be the principle investigator on the proposal
        return [true].indexOf(value) !== -1;
      }
    }
  },
  data: function() {
    let fields = [
      {
        key: 'first_name'
      },
      {
        key: 'last_name'
      },
      {
        key: 'username',
        label: 'UserId'
      },
      {
        key: 'email'
      },
      {
        key: 'time_limit',
        label: 'Hour Limit'
      },
      {
        key: 'time_used_by_user',
        label: 'Hours Requested'
      },
      {
        key: 'remove_member',
        label: 'Remove'
      }
    ];
    if (this.proposalIsPublic) {
      fields.push({ key: 'simple_interface' });
    }
    return {
      deleteMembership: {
        isBusy: false
      },
      limit: {
        timeLimitByMembershipId: {}, // Keys are membership IDs, values are time limit
        isBusy: false
      },
      fields: fields
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  watch: {
    data: function(newCois) {
      for (let coi of newCois.results) {
        if (coi.time_limit >= 0) {
          this.limit.timeLimitByMembershipId[coi.id] = coi.time_limit / 3600;
        } else {
          this.limit.timeLimitByMembershipId[coi.id] = null;
        }
      }
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/memberships/';
    },
    initializeDefaultQueryParams: function() {
      const defaultQueryParams = {
        role: 'CI',
        proposal: this.proposalId,
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        limit: 25,
        offset: 0
      };
      return defaultQueryParams;
    },
    addMessage: function(text, variant) {
      this.$store.commit('addMessage', { text: text, variant: variant, namespace: 'coinvestigator-table' });
    },
    clearMessages: function() {
      this.$store.commit('clearNamespacedMessages', 'coinvestigator-table');
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
          that.addMessage('Membership deleted', 'success');
          that.update();
        })
        .fail(function(response) {
          if (response.status === 404) {
            that.addMessage(
              'The membership that you tried to delete does not exist, please try refreshing your page to get an updated list',
              'danger'
            );
          } else {
            that.addMessage('There was a problem deleting the membership, please try again', 'danger');
          }
        })
        .always(function() {
          that.deleteMembership.isBusy = false;
        });
    },
    setMembershipLimit: function(timeLimitHours, membershipId) {
      this.clearMessages();
      this.limit.isBusy = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/memberships/' + membershipId + '/limit/',
        data: { time_limit_hours: timeLimitHours }
      })
        .done(function(response) {
          that.addMessage(response.message, 'success');
          that.update();
        })
        .fail(function(response) {
          if (response.status === 400) {
            that.addMessage('Please enter a valid limit', 'danger');
          } else if (response.status === 403) {
            // This should never actually happen given that only PIs are shown the forms to update the limits
            that.addMessage('You must be a principle investigator to update limits', 'danger');
          } else {
            that.addMessage('There was a problem updating the limit, please try again', 'danger');
          }
        })
        .always(function() {
          that.limit.isBusy = false;
        });
    },
    setUserLimit: function(membershipId) {
      this.setMembershipLimit(this.limit.timeLimitByMembershipId[membershipId], membershipId);
    },
    resetUserLimit: function(membershipId) {
      // A negative number means no limit
      this.setMembershipLimit(-1, membershipId);
    },
    fieldAlreadyExists: function(key) {
      let fieldAlreadyExists = false;
      for (let field of this.fields) {
        if (field.key === key) {
          fieldAlreadyExists = true;
          break;
        }
      }
      return fieldAlreadyExists;
    }
  }
};
</script>
