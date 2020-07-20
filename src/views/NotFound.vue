<template>
  <div class="row">
    <div class="col-md-12 text-center">
      <h2>Oops! This looks like a black hole.</h2>
      <p>Either you don't have permission to view this page or it doesn't exist.</p>
      <!-- TODO: Log in link, with next query parameter to the page that was originally requestted (request.path) -->
      <p v-if="!userIsAuthenticated">Perhaps you should try <router-link :to="{name: 'login'}">logging in</router-link>.</p>
    </div>
  </div>
</template>
<script>
import { testProfileData, userIsAuthenticated } from '@/testData.js';

export default {
  name: 'NotFound',
    data: function() {
    return {
      // TODO: Update to derive from actual profile data
      profile: testProfileData,
      userIsAuthenticated: userIsAuthenticated
    }
  }
}
</script>
