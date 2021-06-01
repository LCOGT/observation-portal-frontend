<template>
  <b-container class="p-0">
    <template v-if="userIsPI">
      <b-table
        :id="tableId"
        ref="invitationsTable"
        :busy.sync="invitationsTable.isBusy"
        :items="invitationsProvider"
        :fields="invitationsTable.fields"
        :per-page="invitationsTable.perPage"
        :current-page="invitationsTable.currentPage"
        show-empty
      >
        <template #empty>
          <span class="text-muted">No pending invitations.</span>
        </template>
        <template #table-busy>
          <div class="text-center my-2">
            <i class="fa fa-spin fa-spinner" />
          </div>
        </template>
        <template #cell(content)="data">
          <a :href="'mailto:' + data.item.email">{{ data.item.email }}</a>
          <b-link
            href="#"
            class="float-right"
            :disabled="deleteInvite.isBusy"
            @click="confirm(getDeleteInvitationConfirmationMessage(data.item.email), deleteInvitation, { invitationId: data.item.id })"
          >
            <span class="text-danger"><i class="far fa-trash-alt"></i></span>
          </b-link>
          <div class="small text-muted">Invited at {{ data.item.sent | formatDate }}</div>
        </template>
      </b-table>
      <b-pagination
        v-if="invitationsTable.totalRows > invitationsTable.perPage"
        v-model="invitationsTable.currentPage"
        :total-rows="invitationsTable.totalRows"
        :per-page="invitationsTable.perPage"
        :aria-controls="tableId"
      />
    </template>
  </b-container>
</template>
<script>
import $ from 'jquery';
import { OCSUtil, OCSMixin } from 'ocs-component-lib';

export default {
  name: 'ProposalInvitations',
  filters: {
    formatDate: function(date) {
      return OCSUtil.formatDate(date);
    }
  },
  mixins: [OCSMixin.confirmMixin],
  props: {
    proposalId: {
      type: String,
      required: true
    },
    userIsPI: {
      type: Boolean,
      required: true
    },
    tableId: {
      type: String,
      default: 'invitations-table'
    }
  },
  data: function() {
    return {
      invitationsTable: {
        isBusy: false,
        perPage: 25,
        currentPage: 1,
        totalRows: 0,
        fields: [
          {
            key: 'content',
            tdClass: 'p-1',
            thClass: 'd-none'
          }
        ]
      },
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
    invitationsProvider: function(ctx, callback) {
      // https://bootstrap-vue.org/docs/components/table#using-items-provider-functions
      const limit = ctx.perPage;
      const offset = (ctx.currentPage - 1) * limit;
      const params = `?pending=true&proposal=${this.proposalId}&offset=${offset}&limit=${limit}`;
      $.ajax({
        url: `${this.observationPortalApiUrl}/api/invitations/${params}`
      })
        .done(response => {
          this.invitationsTable.totalRows = response.count;
          callback(response.results);
        })
        .fail(() => {
          this.invitationsTable.totalRows = 0;
          callback([]);
        });
      // Must return null or undefined to signal b-table that callback is being used
      return null;
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
      $.ajax({
        method: 'DELETE',
        url: this.observationPortalApiUrl + '/api/invitations/' + args.invitationId + '/'
      })
        .done(() => {
          this.addMessage('Invitation deleted', 'success');
          this.invitationsTable.currentPage = 1;
          this.$refs.invitationsTable.refresh();
        })
        .fail(response => {
          if (response.status === 404) {
            // The proposal invitation does not exist, maybe it was deleted while this page was open.
            this.addMessage(
              'The invitation that you tried to delete does not exist, please try refreshing your page to get an updated list',
              'danger'
            );
          } else {
            this.addMessage('There was a problem deleting the invitation, please try again', 'danger');
          }
        })
        .always(() => {
          this.deleteInvite.isBusy = false;
        });
    }
  }
};
</script>
