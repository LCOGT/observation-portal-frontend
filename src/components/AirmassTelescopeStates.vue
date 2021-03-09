<template>
  <div class="airmassTelescopeStatesCombo">
    <ocs-airmass-plot
      v-show="'airmass_limit' in airmassData"
      ref="airmass"
      :data="airmassData"
      :show-zoom-controls="true"
      :alignleft="true"
      :site-code-to-color="siteToColor"
      :site-code-to-name="siteCodeToName"
      @rangechanged="updateTelescopeStatesRange"
    />
    <p />
    <ocs-telescope-states-plot
      v-show="'airmass_limit' in airmassData"
      ref="telescope_states"
      :data="telescopeStatesData"
      :active-observation="activeObservation"
      :show-zoom-controls="false"
      :site-code-to-color="siteToColor"
      :site-code-to-name="siteCodeToName"
      :legend-data="legendData"
      show-legend
      @rangechanged="updateAirmassRange"
    />
  </div>
</template>
<script>
import _ from 'lodash';

import { siteToColor, siteCodeToName } from '@/utils.js';

export default {
  name: 'AirmassTelescopeStates',
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
  data: function() {
    return {
      siteToColor: siteToColor,
      siteCodeToName: siteCodeToName,
      legendData: [
        { eventType: 'AVAILABLE', text: 'Available' },
        { eventType: 'NOT_OK_TO_OPEN', text: 'Weather' },
        { eventType: 'SEQUENCER_DISABLED', text: 'Manually Disabled' },
        { eventType: 'NO_CONNECTION', text: 'No Connection to Telescope' }
      ],
      eventTypeReasonPrefix: {
        AVAILABLE: 'Available',
        NOT_OK_TO_OPEN: '',
        SEQUENCER_DISABLED: 'Manually Disabled',
        SITE_AGENT_UNRESPONSIVE: 'No Connection to Telescope',
        OFFLINE: 'Manually Disabled',
        ENCLOSURE_INTERLOCK: '',
        SEQUENCER_UNAVAILABLE: '',
        NO_CONNECTION: ''
      },
      unavailableEventTypeCodes: ['NOT_OK_TO_OPEN', 'ENCLOSURE_INTERLOCK'],
      initializingEventTypeCodes: ['SEQUENCER_UNAVAILABLE']
    };
  },
  created: function() {
    this.transformEventData();
  },
  methods: {
    transformEventData: function() {
      for (let telescope in this.telescopeStatesData) {
        for (let i in this.telescopeStatesData[telescope]) {
          let event = this.telescopeStatesData[telescope][i];
          let reason = '';
          if (this.unavailableEventTypeCodes.indexOf(event['event_type']) > -1) {
            reason = event['event_reason'];
          } else if (this.initializingEventTypeCodes.indexOf(event['event_type']) > -1) {
            reason = ': Telescope initializing';
          }
          let additionalText = _.get(this.eventTypeReasonPrefix, [event['event_type']], '');
          this.telescopeStatesData[telescope][i]['event_reason'] = additionalText + reason;
        }
      }
    },
    updateAirmassRange: function(window) {
      this.$refs.airmass.updateWindow(window);
    },
    updateTelescopeStatesRange: function(window) {
      this.$refs.telescope_states.updateWindow(window);
    }
  }
};
</script>
<style>
.AVAILABLE {
  background-color: deepskyblue;
  border-color: deepskyblue;
}

.OFFLINE {
  background-color: orange;
  border-color: orange;
}

.NOT_OK_TO_OPEN {
  background-color: purple;
  border-color: purple;
}

.SITE_AGENT_UNRESPONSIVE {
  background-color: black;
  border-color: black;
}

.SEQUENCER_DISABLED {
  background-color: orange;
  border-color: orange;
}

.ENCLOSURE_INTERLOCK {
  background-color: purple;
  border-color: purple;
}

.SEQUENCER_UNAVAILABLE {
  background-color: purple;
  border-color: purple;
}

.NO_CONNECTION {
  background-color: black;
  border-color: darkgrey;
}
</style>
