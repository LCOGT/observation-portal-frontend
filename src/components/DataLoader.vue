<template>
  <b-container fluid class="p-0">
    <template v-if="dataLoadError">
      <p class="text-center my-2">
        {{ loadErrorMessage }}
      </p>
    </template>
    <template v-else-if="!dataLoaded">
      <div class="text-center my-2">
        <i class="fa fa-spin fa-spinner" />
      </div>
    </template>
    <template v-else-if="dataLoaded && dataNotFound">
      <not-found />
    </template>
    <template v-else>
      <slot> </slot>
    </template>
  </b-container>
</template>
<script>
import NotFound from '@/components/NotFound.vue';

export default {
  name: 'DataLoader',
  components: {
    NotFound
  },
  props: {
    dataLoaded: {
      type: Boolean,
      required: true
    },
    dataLoadError: {
      type: Boolean,
      required: true
    },
    dataNotFound: {
      type: Boolean,
      required: true
    },
    loadErrorMessage: {
      type: String,
      default: 'Oops, there was a problem getting your data. Please try again.'
    }
  }
};
</script>
