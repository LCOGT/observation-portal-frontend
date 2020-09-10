<template>
  <b-row>
    <b-col md="9" cols="12">
      <b-pagination
        v-if="observations.count > limit"
        :value="currentPage"
        :total-rows="observations.count"
        :per-page="limit"
        aria-controls="observations-table"
        @change="onPageChange"
      />
    </b-col>
    <b-col md="3" cols="12">
      <template v-if="lastUpdated">
        <div>{{ observations.count }} observations</div>
        <div>
          Last update: <span class="font-weight-bold">{{ lastUpdated | formatDate }}</span>
        </div>
      </template>
    </b-col>
  </b-row>
</template>
<script>
import { formatDate } from '@/utils.js';

export default {
  name: 'ObservationListPaginator',
  filters: {
    formatDate(value) {
      return formatDate(value);
    }
  },
  props: {
    observations: {
      type: Object,
      required: true
    },
    limit: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    },
    lastUpdated: {
      type: String,
      required: true
    }
  }
};
</script>
