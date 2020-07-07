<template>
  <div class="home">
    <p>Home page</p>
    {{ requestgroups }}
  </div>
</template>

<script>
import $ from 'jquery';

export default {
  name: 'Home',
  data: function() {
    return {
      requestgroups: []
    }
  },
  mounted: function() {
    this.getRequestgroups();
  },
  methods: {
    getRequestgroups: function() {
      let url = process.env.VUE_APP_OBSERVATION_PORTAL_URL + "/api/requestgroups/?limit=1";
      let that = this;
      $.getJSON(url, function(data) {
        console.log(data.results);
        that.requestgroups = data.results;
      }).done(function() {
        console.log('Finished loading ' + url);
      }).fail(function() {
        console.log('Failed to load ' + url);
      })
    }
  }
}
</script>
