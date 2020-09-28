<template>
  <b-container class="p-0">
    <template v-if="!dataLoaded">
      <div class="text-center my-2">
        <i class="fa fa-spin fa-spinner" />
      </div>
    </template>
    <template v-else-if="data.results.length > 0">
      <dd v-for="invitation in data.results" :key="invitation.id">
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
  </b-container>
</template>
<script>
import $ from 'jquery';

import { formatDate } from '@/utils.js';
import { getDataListWithCountMixin } from '@/components/util/getDataMixins.js';
import { confirmMixin } from '@/components/util/utilMixins.js';

export default {
  name: 'ProposalInvitaions',
  filters: {
    formatDate: function(date) {
      return formatDate(date);
    }
  },
  mixins: [getDataListWithCountMixin, confirmMixin],
  props: {
    proposalId: {
      type: String,
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
    return {
      deleteInvite: {
        isBusy: false
      }
    };
  },
  methods: {
    initializeDataEndpoint: function() {
      return '/api/invitations/?pending=true&proposal=' + this.proposalId;
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
