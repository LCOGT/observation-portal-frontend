<template>
  <b-row>
    <b-col>
      <passthrough-get
        :endpoint="endpoint"
        :successRedirectViewName="successRedirectViewName"
      ></passthrough-get>
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
    }
  }
}
</script>
