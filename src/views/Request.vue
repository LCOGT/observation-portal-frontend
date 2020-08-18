<template>
  <b-col>
    <template v-if="!hasLoaded">
      <p>Loading request</p>
    </template>
    <template v-else-if="loadingError">
      <p>Oops, there was a problem getting your request, please try again</p>
    </template>
    <template v-else-if="hasLoaded && !request.id">
      <not-found></not-found>
    </template>
    <template v-else>
      <requestgroup-header :requestgroup="requestgroup"></requestgroup-header>
      <b-row>
        <b-col>
          <b-breadcrumb class="bg-light">
            <b-breadcrumb-item :to="{ name: 'requestgroupDetail', params: { id: requestgroup.id } }">
              Sub-requests
            </b-breadcrumb-item>
            <b-breadcrumb-item active>
              #{{ request.id }}
            </b-breadcrumb-item>
          </b-breadcrumb>
        </b-col>
      </b-row>
      <request-row :request="request"></request-row>
    </template>
  </b-col>
</template>
<script>
import $ from 'jquery';

import RequestgroupHeader from '@/components/RequestgroupHeader.vue';
import RequestRow from '@/components/RequestRow.vue';
import NotFound from '@/views/NotFound.vue';

export default {
  name: 'Request',
  components: {
    RequestgroupHeader,
    RequestRow,
    NotFound
  },
  data: function() {
    return {
      requestgroup: {},
      request: {},
      id: this.$route.params.id,
      hasLoaded: false,
      loadingError: false
    }
  },
  computed: {
    url: function() {
      return this.$store.state.urls.observationPortalApi + '/api/requestgroups/?request_id=' + this.id;
    }
  },
  created: function() {
    this.getRequest();
  },
  methods: {
    getRequest: function() {
      let that = this;
      $.ajax({
        url: this.url
      }).done(function(response) {
        let requestgroup = response.results;
        if (requestgroup.length > 0) {
          that.requestgroup = requestgroup[0];
          for (let request of requestgroup[0].requests) {
            // TODO: Is there a better way to check this
            if (String(request.id) === String(that.id)) {
              that.request = request;
              break;
            }
          }
        }
      }).fail(function() {
        that.loadingError = true;
      }).always(function() {
        that.hasLoaded = true;
      })
    }
  }
  
}
</script>
