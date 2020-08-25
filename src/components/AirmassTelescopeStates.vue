<template>
  <div class="airmassTelescopeStatesCombo">
    <airmass
      v-show="'airmass_limit' in airmassData"
      ref="airmass"
      :data="airmassData"
      :show-zoom-controls="true"
      :alignleft="true"
      @rangechanged="updateTelescopeStatesRange"
    />
    <p />
    <telescope-states
      v-show="'airmass_limit' in airmassData"
      ref="telescope_states"
      :data="telescopeStatesData"
      :active-observation="activeObservation"
      :show-zoom-controls="false"
      @rangechanged="updateAirmassRange"
    />
    <div class="visibilityHistoryPlotLegend text-center">
      <ul class="list-inline mt-1">
        <li class="list-inline-item">
          <span class="legend-item AVAILABLE align-middle mb-1 mr-1" />
          Available
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item NOT_OK_TO_OPEN align-middle mb-1 mr-1" />
          Weather
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item SEQUENCER_DISABLED align-middle mb-1 mr-1" />
          Manually Disabled
        </li>
        <li class="list-inline-item ml-3">
          <span class="legend-item NO_CONNECTION align-middle mb-1 mr-1" />
          No Connection to Telescope
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import Airmass from '@/components/Airmass.vue';
import TelescopeStates from '@/components/TelescopeStates.vue';

export default {
  name: 'AirmassTelescopeStates',
  components: {
    Airmass,
    TelescopeStates,
  },
  props: {
    airmassData: {
      type: Object,
      required: true
    },
    telescopeStatesData: {
      type: Object,
      required: true
    },
    activeObservation: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {};
  },
  methods: {
    updateAirmassRange: function (window) {
      this.$refs.airmass.updateWindow(window);
    },
    updateTelescopeStatesRange: function (window) {
      this.$refs.telescope_states.updateWindow(window);
    },
  },
};
</script>
