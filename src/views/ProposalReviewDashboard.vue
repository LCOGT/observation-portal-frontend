<template>
    <b-container>
      <b-row>
        <h2>Proposal Reviews</h2>
      </b-row>
      <b-row>
        <p>Here you can grade and comment on the proposals assigned to you.</p>
      </b-row>
      <b-row>
        <sci-application-reviews></sci-application-reviews>
      </b-row>
    </b-container>
</template>
<script>
import SciApplicationReviews from '@/components/SciApplicationReviews.vue';

export default {
  name: 'ProposalReviewDashboard',
  components: {
    SciApplicationReviews,
  }
};
</script>
