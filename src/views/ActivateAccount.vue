<template>
  <b-row>
    <b-col>
      <passthrough-get
        :endpoint="endpoint"
      ></passthrough-get>
    </b-col>
  </b-row>
</template>
<script>
import PassthroughGet from '@/components/PassthroughGet.vue';

export default {
  name: 'ActivateAccount',
  components: {
    PassthroughGet
  },
  data: function() {
    return {
      endpoint: this.$route.path
    }
  }
}
</script>
