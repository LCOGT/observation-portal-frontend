<template>
  <edit-sci-application :call-id="callId"> </edit-sci-application>
</template>
<script>
import EditSciApplication from '@/components/EditSciApplication.vue';

export default {
  name: 'UpdateSciApplication',
  components: {
    EditSciApplication
  },
  props: {
    callId: {
      type: [String, Number],
      required: true
    }
  }
};
</script>
