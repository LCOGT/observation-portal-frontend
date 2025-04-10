<template>
    <b-container>
      <b-row>
        <h2>Proposal Reviews</h2>
      </b-row>
      <b-row>
        <h3>Assigned</h3>
      </b-row>
      <b-row>
        <p>Here you can find proposals assigned to you.</p>
        <sci-application-reviews></sci-application-reviews>
      </b-row>
      <b-row>
        <h3>Reviews</h3>
      </b-row>
      <b-row>
        <p>Here you can find your reviews.</p>
        <sci-application-user-reviews></sci-application-user-reviews>
      </b-row>
    </b-container>
</template>
<script>
import SciApplicationReviews from '@/components/SciApplicationReviews.vue';
import SciApplicationUserReviews from '@/components/SciApplicationUserReviews.vue';

export default {
  name: 'ProposalReviewDashboard',
  components: {
    SciApplicationReviews, SciApplicationUserReviews,
  }
};
</script>
