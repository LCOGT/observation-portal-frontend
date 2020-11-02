<template>
  <b-container class="p-0">
    <template v-if="userIsPI">
      <b-form @submit="inviteCoInvestigators">
        <b-form-group id="input-group-invite-co-investigator" label-for="input-invite-co-investigator" label="Invite a Co-Investigator" label-sr-only>
          <b-form-input id="input-invite-co-investigator" v-model="invite.emailAddresses" placeholder="Email Address(s)" required />
        </b-form-group>
        <b-button type="submit" variant="outline-primary" :disabled="invite.isBusy">
          Invite
        </b-button>
      </b-form>
    </template>
  </b-container>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';

export default {
  name: 'InviteCoInvestigatorsForm',
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
      invite: {
        emailAddresses: '',
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
    addMessage: function(text, variant) {
      this.$store.commit('addMessage', { text: text, variant: variant, namespace: 'send-invitations' });
    },
    clearMessages: function() {
      this.$store.commit('clearNamespacedMessages', 'send-invitations');
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
    coInvestigatorsInvited: function() {
      this.$emit('coInvestigatorsInvited');
    },
    inviteCoInvestigators: function(evt) {
      evt.preventDefault();
      this.clearMessages();
      this.invite.isBusy = true;
      let emails = this.getArrayOfEmailsToInvite();
      let that = this;
      $.ajax({
        method: 'POST',
        url: this.observationPortalApiUrl + '/api/proposals/' + this.proposalId + '/invite/',
        data: JSON.stringify({ emails: emails }),
        contentType: 'application/json'
      })
        .done(function(response) {
          that.addMessage(response.message, 'success');
          that.coInvestigatorsInvited();
        })
        .fail(function(response) {
          if (response.status === 400) {
            for (let errorMessage of that.parseInviteBadRequestErrors(emails, response.responseJSON)) {
              that.addMessage(errorMessage, 'danger');
            }
          } else {
            that.addMessage('There was a problem adding co-investigators, please try again', 'danger');
          }
        })
        .always(function() {
          that.invite.isBusy = false;
        });
    }
  }
};
</script>
