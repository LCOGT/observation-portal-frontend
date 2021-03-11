<template>
  <b-container class="p-0">
    <template v-if="userIsPI">
      <template v-if="!dataLoaded">
        <div class="text-center my-2">
          <i class="fa fa-spin fa-spinner" />
        </div>
      </template>
      <template v-else-if="data.results.length > 0">
        <b-list-group>
          <b-list-group-item v-for="invitation in data.results" :key="invitation.id" class="px-2 py-1">
            <a :href="'mailto:' + invitation.email">{{ invitation.email }}</a>
            <b-link
              href="#"
              class="float-right"
              :disabled="deleteInvite.isBusy"
              @click="confirm(getDeleteInvitationConfirmationMessage(invitation.email), deleteInvitation, { invitationId: invitation.id })"
            >
              <span class="text-danger"><i class="far fa-trash-alt"></i></span>
            </b-link>
            <div class="small text-muted">Invited at {{ invitation.sent | formatDate }}</div>
          </b-list-group-item>
        </b-list-group>
      </template>
      <template v-else>
        <p class="text-muted py-1">No pending invitations.</p>
      </template>
    </template>
  </b-container>
</template>
<script>
import $ from 'jquery';
import { OCSUtil, OCSMixin } from 'ocs-component-lib';

import { confirmMixin } from '@/components/util/utilMixins.js';

export default {
  name: 'ProposalInvitations',
  filters: {
    formatDate: function(date) {
      return OCSUtil.formatDate(date);
    }
  },
  mixins: [OCSMixin.getDataListWithCountMixin, confirmMixin],
  props: {
    proposalId: {
      type: String,
      required: true
    },
    userIsPI: {
      type: Boolean,
      required: true
    }
  },
  data: function() {
    return {
      deleteInvite: {
        isBusy: false
      }
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/invitations/?pending=true&proposal=' + this.proposalId;
    },
    getDeleteInvitationConfirmationMessage: function(email) {
      return 'Are you sure you want to delete the invitation for ' + email + ' for this proposal?';
    },
    addMessage: function(text, variant) {
      this.$store.commit('addMessage', { text: text, variant: variant, namespace: 'pending-invitations' });
    },
    clearMessages: function() {
      this.$store.commit('clearNamespacedMessages', 'pending-invitations');
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
          that.addMessage('Invitation deleted', 'success');
          that.getData();
        })
        .fail(function(response) {
          if (response.status === 404) {
            // The proposal invitation does not exist, maybe it was deleted while this page was open.
            that.addMessage(
              'The invitation that you tried to delete does not exist, please try refreshing your page to get an updated list',
              'danger'
            );
          } else {
            that.addMessage('There was a problem deleting the invitation, please try again', 'danger');
          }
        })
        .always(function() {
          that.deleteInvite.isBusy = false;
        });
    }
  }
};
</script>
