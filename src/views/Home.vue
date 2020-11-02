<template>
  <b-container class="p-0">
    <b-row>
      <b-col lg="8" cols="12">
        <!-- TODO: Should this section only be displayed if the table is one the first page of results? -->
        <div v-if="!userIsAuthenticated" class="jumbotron noauth">
          <h1>Observation Portal</h1>
          <p>This is your access point to Las Cumbres Observatory's global network of telescopes. Registered users can:</p>
          <ul class="list-unstyled">
            <li>
              <i class="fa fa-users fa-3x fa-pull-left" aria-hidden="true" />
              <span>Submit proposals and manage the membership of their research teams.</span>
            </li>
            <li>
              <i class="fab fa-wpexplorer fa-3x fa-pull-left" aria-hidden="true" />
              <span>Compose, save, and submit observation requests.</span>
            </li>
            <li>
              <i class="fa fa-cloud-download-alt fa-3x fa-pull-left" aria-hidden="true" />
              <span>Check the status of submitted requests, and download data from completed observations.</span>
            </li>
          </ul>
          <router-link class="btn btn-lg btn-success col-md-5" :to="{ name: 'register' }">
            Register an Account
          </router-link>
          <router-link :to="{ name: 'login' }" class="btn btn-lg btn-primary float-right col-md-5 col-md-offset-2">
            Login
          </router-link>
          <br />
        </div>
        <requestgroups-list />
      </b-col>
      <b-col lg="4" cols="12">
        <b-row>
          <b-col>
            <h3>Quick Navigation</h3>
            <ul class="list-unstyled sidebar-nav">
              <li>
                <router-link :to="{ name: 'create' }" class="pt-1"> <i class="fab fa-wpexplorer fa-lg fa-fw" /> Submit Observation </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'proposals' }" class="pt-1"> <i class="fa fa-users fa-lg fa-fw" /> Manage Proposals </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'help' }" class="pt-1"> <i class="fas fa-info-circle fa-lg"></i> Help </router-link>
              </li>
            </ul>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <h3 class="mt-4">
              Telescope availability history<sup v-b-tooltip="tooltipConfig" class="text-primary" :title="telescopeAvailabilityChartHelpText">?</sup>
            </h3>
            <telescope-availability-chart />
            <a href="https://lco.global/observatory/status/">Detailed observatory status</a>
          </b-col>
        </b-row>
        <b-row v-if="userIsAuthenticated">
          <b-col>
            <h3 class="mt-4">Active Proposals</h3>
            <div v-for="proposal in currentProposals" :key="proposal.id">
              <p>
                <router-link :to="{ name: 'proposalDetail', params: { id: proposal.id } }">
                  {{ proposal.id }}
                </router-link>
                <br />
                <small>{{ proposal.title }}</small>
              </p>
            </div>
            <div v-if="currentProposals.length < 1">
              <!-- TODO: Translate this -->
              <p>You have no current proposals</p>
              <p>
                <!-- TODO: Translate this -->
                <router-link :to="{ name: 'apply' }">
                  Submit a proposal
                </router-link>
              </p>
            </div>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import RequestgroupsList from '@/components/RequestgroupsList.vue';
import TelescopeAvailabilityChart from '@/components/TelescopeAvailabilityChart.vue';
import { tooltipConfig } from '@/utils.js';

export default {
  name: 'Home',
  components: {
    RequestgroupsList,
    TelescopeAvailabilityChart
  },
  data: function() {
    return {
      tooltipConfig: tooltipConfig,
      telescopeAvailabilityChartHelpText: 'This chart shows the percent of operational science time for each telescope over the last 4 days.'
    };
  },
  computed: {
    profile: function() {
      return this.$store.state.profile;
    },
    userIsAuthenticated: function() {
      return this.$store.state.userIsAuthenticated;
    },
    currentProposals: function() {
      let currentProposals = [];
      if (this.profile.proposals) {
        for (let proposal of this.profile.proposals) {
          if (proposal.current) {
            currentProposals.push(proposal);
          }
        }
      }
      return currentProposals;
    }
  }
};
</script>
<style scoped>
.noauth {
  line-height: 1.4em;
}

.noauth li {
  height: 75px;
}

.noauth span {
  vertical-align: middle;
  padding-top: 5px;
}

.sidebar-nav {
  font-size: 1.3em;
}

.sidebar-nav li {
  height: 40px;
}
</style>
