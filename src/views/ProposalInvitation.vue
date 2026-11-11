<template>
  <b-row>
    <b-col>
      <h1>Proposal Invitation</h1>
      <b-spinner v-if="loading" label="Loading..."></b-spinner>
      <b-alert v-else-if="error" variant="danger" show>
        {{ error }}
      </b-alert>
      <template v-else>
        <p>
          Link user <strong>{{ $store.state.profile.username }}</strong> to proposal
          <strong>{{ invitation.proposal }}: {{ invitation.proposal_title }}</strong> as a {{ roleLabel }}.
        </p>
        <b-button variant="primary" :disabled="accepting" @click="acceptInvitation">
          <b-spinner v-if="accepting" small></b-spinner>
          Confirm
        </b-button>
      </template>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';

const INVALID_LINK_MESSAGE = 'This invitation link is not valid';

export default {
  name: 'ProposalInvitation',
  data: function() {
    return {
      loading: true,
      accepting: false,
      error: null,
      invitation: {}
    };
  },
  computed: {
    code: function() {
      return this.$route.query.code;
    },
    url: function() {
      return this.$store.state.urls.observationPortalApi + '/api/invitation-codes/' + encodeURIComponent(this.code) + '/';
    },
    roleLabel: function() {
      return this.invitation.role === 'PI' ? 'Principal Investigator' : 'Co-Investigator';
    }
  },
  created: function() {
    if (!this.code) {
      this.error = INVALID_LINK_MESSAGE;
      this.loading = false;
      return;
    }
    let that = this;
    $.ajax({
      method: 'GET',
      url: this.url
    })
      .done(function(response) {
        that.invitation = response;
      })
      .fail(function(response) {
        if (response.status === 400) {
          that.error = response.responseJSON.errors[0];
        } else if (response.status === 404) {
          that.error = INVALID_LINK_MESSAGE;
        } else {
          that.error = 'There was a problem loading this invitation, please try again';
        }
      })
      .always(function() {
        that.loading = false;
      });
  },
  methods: {
    acceptInvitation: function() {
      this.accepting = true;
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.url + 'accept/'
      })
        .done(function(response) {
          that.$store.commit('addMessage', { text: response.message, variant: 'success' });
          // The profile holds the user's proposals, so refresh it to pick up the new membership
          that.$store.dispatch('getProfileData');
          that.$router.push({ name: 'proposalDetail', params: { id: that.invitation.proposal, persistMessage: true } });
        })
        .fail(function(response) {
          if (response.status === 400) {
            that.error = response.responseJSON.errors[0];
          } else {
            that.$store.commit('addMessage', { text: 'There was a problem accepting this invitation, please try again', variant: 'danger' });
          }
        })
        .always(function() {
          that.accepting = false;
        });
    }
  }
};
</script>
