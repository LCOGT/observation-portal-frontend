<template>
  <b-row>
    <b-col>
      <h1>Terms of Service</h1>
      <ul>
        <li>
          I agree for my name, institution and email address to be stored by LCO. I understand LCO will take all reasonable measures
          to secure this data. I understand I may withdraw consent at any time by contacting LCO, at which time my account and
          all personal data will be deleted.
        </li>
        <li>
          For those proposals on which I am a Co-Investigator (Co-I), I agree to the sharing of my name, institution and email
          address with the Principal Investigator (PI) for that proposal.
        </li>
        <li>
          For those proposals on which I am a Co-I or PI, I agree to the sharing of my name and institution with the
          Time Allocation Committee (TAC), which evaluates proposals and awards observing time.
        </li>
        <li>
          For those proposals on which I am the PI, I agree to share my name and email address with the Co-Is for that proposal.
        </li>
        <li>
          I acknowledge that as PI, I will have access to Co-I information and agree to use it in a way which is acceptable
          to Co-Is and that is compliant with the law.
        </li>
      </ul>
      <b-form @submit="updateTermsAccepted">
        <b-form-group
          id="checkbox-group-accept-terms"
          label-for="checkbox-accept-terms"
        >
          <b-form-checkbox
            id="checkbox-accept-terms"
            name="checkbox-accept-terms"
            v-model="acceptTerms"
            required
          >
            I accept these terms.
          </b-form-checkbox>
        </b-form-group>
        <b-button type="submit" variant="primary">Proceed</b-button>
      </b-form>
    </b-col>
  </b-row>
</template>
<script>
import $ from 'jquery';

export default {
  name: 'AcceptTerms',
  data: function() {
    return {
      acceptTerms: false
    }
  },
  computed: {
    url: function() {
      return this.$store.state.urls.observationPortalApi + "/api/profile/";
    }
  },
  methods: {
    updateTermsAccepted: function(evt) {
      evt.preventDefault();
      if (this.acceptTerms) {
        let that = this;
        $.ajax({
          method: "PATCH",
          url: this.url,
          data: JSON.stringify({profile: {accept_terms: true}}),
          contentType: "application/json",
          success: function () {
            let homePath = that.$router.resolve({ name: "home" });
            window.location.pathname = homePath.href;
          },
          error: function () {
            that.$store.commit('addMessage', {text: 'There was a problem accepting the terms, please try again', variant: 'danger'});
          },
        });
      }
    }
  }
}
</script>
