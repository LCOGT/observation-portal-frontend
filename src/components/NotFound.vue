<template>
  <div class="row">
    <div class="col-md-12 text-center">
      <h2>Oops! This looks like a black hole.</h2>
      <p>Either you don't have permission to view this page or it doesn't exist.</p>
      <!-- TODO: Log in link, with next query parameter to the page that was originally requestted (request.path) -->
      <p v-if="!userIsAuthenticated">
        Perhaps you should try
        <router-link :to="{ name: 'login' }"> logging in </router-link>.
      </p>
      <p v-else-if="userIsStaffWithoutStaffViewSet">
        Perhaps you should try turning on staff view. You can do this on your <router-link :to="{ name: 'profile' }">profile page</router-link>.
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: 'NotFound',
  computed: {
    userIsAuthenticated: function() {
      return this.$store.state.userIsAuthenticated;
    },
    userIsStaffWithoutStaffViewSet: function() {
      return this.$store.state.profile.is_staff && !this.$store.state.profile.profile.staff_view;
    }
  }
};
</script>
