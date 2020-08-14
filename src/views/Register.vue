<template>
  <b-row>
    <b-col>
      <passthrough-form
        endpoint="/accounts/register/"
      >
        <!-- TODO: Translate this -->
        <p>Read the <a href="https://lco.global/observatory/termsofservice/" target="_blank">Terms of Service</a>.</p>
      </passthrough-form>
    </b-col>
  </b-row>
</template>
<script>
import PassthroughForm from '@/components/PassthroughForm.vue';

export default {
  name: 'Register',
  components: {
    PassthroughForm
  }
}
</script>
