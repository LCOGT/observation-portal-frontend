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
      :data="transformedTelescopeData"
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
import { OCSUtil } from 'ocs-component-lib';

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
        NOT_AVAILABLE: 'No Connection to Telescope',
        OFFLINE: 'Manually Disabled',
        ENCLOSURE_INTERLOCK: '',
        ENCLOSURE_DISABLED: '',
        SEQUENCER_UNAVAILABLE: '',
        NO_CONNECTION: ''
      },
      unavailableEventTypeCodes: ['NOT_OK_TO_OPEN', 'ENCLOSURE_INTERLOCK', 'ENCLOSURE_DISABLED'],
      initializingEventTypeCodes: ['SEQUENCER_UNAVAILABLE']
    };
  },
  computed: {
    transformedTelescopeData: function() {
      let transformedData = {};
      for (let telescope in this.telescopeStatesData) {
        transformedData[telescope] = [];
        for (let i in this.telescopeStatesData[telescope]) {
          transformedData[telescope].push(OCSUtil.copyObject(this.telescopeStatesData[telescope][i]));
          let event = transformedData[telescope][i];
          let reason = '';
          if (this.unavailableEventTypeCodes.indexOf(event['event_type']) > -1) {
            reason = event['event_reason'];
          } else if (this.initializingEventTypeCodes.indexOf(event['event_type']) > -1) {
            reason = ': Telescope initializing';
          }
          let prefixText = _.get(this.eventTypeReasonPrefix, [event['event_type']], '');
          transformedData[telescope][i]['event_reason'] = prefixText + reason;
        }
      }
      return transformedData;
    }
  },
  methods: {
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

.ENCLOSURE_DISABLED {
  background-color: purple;
  border-color: purple;
}

.SEQUENCER_UNAVAILABLE {
  background-color: purple;
  border-color: purple;
}

.NOT_AVAILABLE {
  background-color: purple;
  border-color: purple;
}

.NO_CONNECTION {
  background-color: black;
  border-color: darkgrey;
}
</style>
