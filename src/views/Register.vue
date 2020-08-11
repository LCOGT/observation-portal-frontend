<template>
  <b-row>
    <b-col id="form-container">
      <passthrough-form 
        endpoint="/accounts/register/"
      ></passthrough-form>
      <!-- TODO: Translate this -->
      <p>Read the <a href="https://lco.global/observatory/termsofservice/" target="_blank">Terms of Service</a>.</p>
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
