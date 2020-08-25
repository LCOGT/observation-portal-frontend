<template>
  <b-row>
    <b-col>
      <passthrough-get :endpoint="endpoint" :success-redirect-view-name="successRedirectViewName" />
    </b-col>
  </b-row>
</template>
<script>
import PassthroughGet from '@/components/PassthroughGet.vue';

export default {
  name: 'AccountsPassthroughGetPage',
  components: {
    PassthroughGet
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
