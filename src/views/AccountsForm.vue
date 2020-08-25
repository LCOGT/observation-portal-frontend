<template>
  <b-row>
    <b-col>
      <passthrough-form :endpoint="endpoint" :success-redirect-view-name="successRedirectViewName" />
      <br />
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
  props: {
    successRedirectViewName: {
      type: String,
      default: ''
    }
  },
  data: function() {
    return {
      endpoint: this.$route.path
    };
  }
};
</script>
