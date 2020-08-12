<template>
  <b-row>
    <b-col id="form-container">
      <passthrough-form
        :endpoint="endpoint"
      ></passthrough-form>
      <br/>
    </b-col>
  </b-row>
</template>
<script>
import PassthroughForm from '@/components/PassthroughForm.vue';

export default {
  name: 'AccountsPassthroughFormPage',
  components: {
    PassthroughForm
  },
  data: function() {
    return {
      endpoint: this.$route.path
    }
  }
}
</script>
