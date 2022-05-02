<template>
  <b-row>
    <b-col>
      <passthrough-form endpoint="/accounts/login/" :success-redirect-path="redirectPath" @formUpdated="onFormUpdated" />
      <br />
      <!-- TODO: Translate this -->
      <p>Forgot your password?<router-link :to="{ name: 'passwordReset' }"> Reset it</router-link>.</p>
      <!-- TODO: Translate this -->
      <p>Not a member?<router-link :to="{ name: 'register' }"> Register</router-link>.</p>
      <p>
        Use of any LCO facilities and/or data implies acceptance of the
        <a href="https://lco.global/observatory/termsofservice/"> Terms of Service</a>.
      </p>
    </b-col>
  </b-row>
</template>
<script>
import PassthroughForm from '@/components/PassthroughForm.vue';

export default {
  name: 'Login',
  components: {
    PassthroughForm
  },
  computed: {
    redirectPath: function() {
      return this.$route.query.next || '/';
    }
  },
  methods: {
    onFormUpdated: function(form) {
      // Login form can also redirect to change password form.
      // If the input button says "Change password" redirect to the
      // correct Vue route. Otherwise this form will post to the wrong endpoint.
      if (form.find("input[value='Change password']").length == 1)
          this.$router.push({name: "passwordChange"})
    }
  }
};
</script>
