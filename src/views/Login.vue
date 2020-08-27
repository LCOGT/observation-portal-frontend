<template>
  <b-row>
    <b-col>
      <passthrough-form endpoint="/accounts/login/" :success-redirect-view-name="redirectViewName" />
      <br />
      <!-- TODO: Translate this -->
      <p>Forgot your password?<router-link :to="{ name: 'passwordReset' }"> Reset it </router-link>.</p>
      <!-- TODO: Translate this -->
      <p>Not a member?<router-link :to="{ name: 'register' }"> Register </router-link>.</p>
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
    redirectViewName: function() {
      return this.$route.query.next || 'home';
    }
  }
};
</script>
