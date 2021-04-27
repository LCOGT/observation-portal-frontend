<template>
  <b-form>
    <ocs-custom-field
      v-model="instrumentConfig.exposure_count"
      field="exposure_count"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_count', 'label'], 'Exposure Count')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_count', 'desc'], '')"
      type="number"
      :errors="errors.exposure_count"
    />
    <ocs-custom-field
      v-if="selectedInstrument != '2M0-SCICAM-MUSCAT'"
      v-model="instrumentConfig.exposure_time"
      field="exposure_time"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time', 'label'], 'Exposure Time')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time', 'desc'], '')"
      :errors="errors.exposure_time"
    >
      <div v-if="suggestedLampFlatSlitExposureTime" slot="extra-help-text">
        Suggested exposure time for a Lamp Flat with slit {{ instrumentConfig.optical_elements.slit }} and readout mode {{ instrumentConfig.mode }} is
        <strong>{{ suggestedLampFlatSlitExposureTime }} seconds</strong>
      </div>
      <div v-else-if="suggestedArcExposureTime" slot="extra-help-text">
        Suggested exposure time for an Arc is <strong>{{ suggestedArcExposureTime }} seconds</strong>
      </div>
    </ocs-custom-field>

    <!-- MUSCAT instrument specific fields -->
    <ocs-custom-select
      v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
      v-model="exposure_mode"
      field="exposure_mode"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_mode', 'label'], 'Exposure Mode')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_mode', 'desc'], '')"
      :options="exposureModeOptions"
      :errors="null"
    />
    <ocs-custom-field
      v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
      v-model="exposure_time_g"
      field="exposure_time_g"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_g', 'label'], 'Exposure Time g')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_g', 'desc'], '')"
      :errors="null"
    />
    <ocs-custom-field
      v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
      v-model="exposure_time_r"
      field="exposure_time_r"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_r', 'label'], 'Exposure Time r')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_r', 'desc'], '')"
      :errors="null"
    />
    <ocs-custom-field
      v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
      v-model="exposure_time_i"
      field="exposure_time_i"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_i', 'label'], 'Exposure Time i')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_i', 'desc'], '')"
      :errors="null"
    />
    <ocs-custom-field
      v-if="selectedInstrument == '2M0-SCICAM-MUSCAT'"
      v-model="exposure_time_z"
      field="exposure_time_z"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_z', 'label'], 'Exposure Time z')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'exposure_time_z', 'desc'], '')"
      :errors="null"
    />

    <ocs-custom-select
      v-if="readoutModeOptions.length > 1"
      v-model="instrumentConfig.mode"
      field="readout_mode"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'readout_mode', 'label'], 'Readout Mode')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'readout_mode', 'desc'], '')"
      :options="readoutModeOptions"
      :errors="errors.mode"
    />
    <div v-for="opticalElementGroup in availableOpticalElementGroups" :key="opticalElementGroup.type">
      <ocs-custom-select
        v-model="instrumentConfig.optical_elements[opticalElementGroup.type]"
        :field="opticalElementGroup.type"
        :label="getFromObject(fieldHelp, ['instrumentConfig', opticalElementGroup.type, 'label'], opticalElementGroup.label)"
        :desc="getFromObject(fieldHelp, ['instrumentConfig', opticalElementGroup.type, 'desc'], '')"
        :options="opticalElementGroup.options"
        :lower-options="true"
        :errors="{}"
        @input="updateOpticalElement"
      />
    </div>
    <div v-if="rotatorModeOptions.length > 0">
      <ocs-custom-select
        v-model="instrumentConfig.rotator_mode"
        field="rotator_mode"
        :label="getFromObject(fieldHelp, ['instrumentConfig', 'rotator_mode', 'label'], 'Rotator Mode')"
        :desc="getFromObject(fieldHelp, ['instrumentConfig', 'rotator_mode', 'desc'], '')"
        :errors="errors.rotator_mode"
        :options="rotatorModeOptions"
      />

      <!-- TODO: Validate required field values -->
      <ocs-custom-field
        v-for="field in requiredRotatorModeFields"
        :key="field"
        v-model="instrumentConfig.extra_params[field]"
        :label="getFromObject(fieldHelp, ['instrumentConfig', field, 'label'], field)"
        :desc="getFromObject(fieldHelp, ['instrumentConfig', field, 'desc'], '')"
        :errors="null"
        @input="updateInstrumentConfigExtraParam($event, field)"
      />
    </div>

    <!-- TODO: Validate to make sure this is a floating point number -->

    <ocs-custom-field
      v-if="selectedInstrumentCategory == 'IMAGE' && !simpleInterface"
      v-model="defocus"
      field="defocus"
      :label="getFromObject(fieldHelp, ['instrumentConfig', 'defocus', 'label'], 'Defocus')"
      :desc="getFromObject(fieldHelp, ['instrumentConfig', 'defocus', 'desc'], '')"
      :errors="null"
      type="number"
    />
  </b-form>
</template>
<script>
import { toRef } from '@vue/composition-api';
import { OCSComposable, OCSUtil } from 'ocs-component-lib';

import { lampFlatDefaultExposureTime, arcDefaultExposureTime } from '@/utils';

export default {
  name: 'InstrumentConfigForm',
  props: {
    errors: {
      type: Object,
      required: true
    },
    simpleInterface: {
      type: Boolean
    },
    availableInstruments: {
      type: Object,
      required: true
    },
    selectedInstrument: {
      type: String,
      required: true
    },
    selectedInstrumentCategory: {
      type: String,
      required: true
    },
    configurationType: {
      type: String,
      required: true
    },
    instrumentConfig: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean
    },
    fieldHelp: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  setup: function(props, context) {
    const instrumentConfig = toRef(props, 'instrumentConfig');
    const availableInstruments = toRef(props, 'availableInstruments');
    const selectedInstrument = toRef(props, 'selectedInstrument');

    const {
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      updateBinning,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    } = OCSComposable.baseInstrumentConfigPanel(instrumentConfig, availableInstruments, selectedInstrument, context);

    return {
      // Data
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      // Methods
      updateBinning,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    };
  },
  data: function() {
    return {
      defocus: 0,
      exposure_time_g: 0,
      exposure_time_r: 0,
      exposure_time_i: 0,
      exposure_time_z: 0,
      exposure_mode: 'SYNCHRONOUS',
      exposureModeOptions: [
        { value: 'SYNCHRONOUS', text: 'Synchronous' },
        { value: 'ASYNCHRONOUS', text: 'Asynchronous' }
      ],
      position: {
        requestIndex: this.requestIndex,
        configurationIndex: this.configurationIndex,
        instrumentConfigIndex: this.index
      }
    };
  },
  computed: {
    suggestedLampFlatSlitExposureTime: function() {
      // Update on optical element updates
      this.opticalElementUpdates;
      let slitWidth = this.instrumentConfig.optical_elements.slit;
      let readoutMode = this.instrumentConfig.mode;
      if (this.configurationType === 'LAMP_FLAT' && slitWidth && readoutMode && this.selectedInstrument) {
        return lampFlatDefaultExposureTime(slitWidth, this.selectedInstrument, readoutMode);
      } else {
        return undefined;
      }
    },
    suggestedArcExposureTime: function() {
      if (this.configurationType === 'ARC' && this.selectedInstrument) {
        return arcDefaultExposureTime(this.selectedInstrument);
      } else {
        return undefined;
      }
    }
  },
  watch: {
    defocus: function(value) {
      this.instrumentConfig.extra_params.defocus = value || undefined;
    },
    exposure_time_g: function(value) {
      this.instrumentConfig.extra_params.exposure_time_g = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_r: function(value) {
      this.instrumentConfig.extra_params.exposure_time_r = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_i: function(value) {
      this.instrumentConfig.extra_params.exposure_time_i = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_z: function(value) {
      this.instrumentConfig.extra_params.exposure_time_z = value || undefined;
      this.updateExposureTime();
    },
    exposure_mode: function(value) {
      this.instrumentConfig.extra_params.exposure_mode = value || undefined;
    },
    selectedInstrument: function(value) {
      if (value === '2M0-SCICAM-MUSCAT') {
        this.instrumentConfig.extra_params.exposure_time_g = this.exposure_time_g = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_r = this.exposure_time_r = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_i = this.exposure_time_i = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_z = this.exposure_time_z = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_mode = this.exposure_mode = 'SYNCHRONOUS';
      } else {
        this.instrumentConfig.extra_params.exposure_time_g = undefined;
        this.instrumentConfig.extra_params.exposure_time_r = undefined;
        this.instrumentConfig.extra_params.exposure_time_i = undefined;
        this.instrumentConfig.extra_params.exposure_time_z = undefined;
        this.instrumentConfig.extra_params.exposure_mode = undefined;
      }
    },
    selectedInstrumentCategory: function(value) {
      if (value === 'IMAGE') {
        this.instrumentConfig.extra_params.defocus = this.defocus;
      } else {
        this.instrumentConfig.extra_params.defocus = undefined;
      }
    }
  },
  mounted: function() {
    // If a draft is loaded in that has any extra_params set, update the corresponding params
    // here since extra_params is not reactive and cannot be watched
    if (this.instrumentConfig.extra_params.defocus) {
      this.defocus = this.instrumentConfig.extra_params.defocus;
    }
    if (this.instrumentConfig.extra_params.exposure_time_g) {
      this.exposure_time_g = this.instrumentConfig.extra_params.exposure_time_g;
    }
    if (this.instrumentConfig.extra_params.exposure_time_r) {
      this.exposure_time_r = this.instrumentConfig.extra_params.exposure_time_r;
    }
    if (this.instrumentConfig.extra_params.exposure_time_i) {
      this.exposure_time_i = this.instrumentConfig.extra_params.exposure_time_i;
    }
    if (this.instrumentConfig.extra_params.exposure_time_z) {
      this.exposure_time_z = this.instrumentConfig.extra_params.exposure_time_z;
    }
    if (this.instrumentConfig.extra_params.exposure_mode) {
      this.exposure_mode = this.instrumentConfig.extra_params.exposure_mode;
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return OCSUtil.getFromObject(obj, path, defaultValue);
    },
    updateExposureTime: function() {
      this.instrumentConfig.exposure_time = Math.max(
        this.instrumentConfig.extra_params.exposure_time_g,
        this.instrumentConfig.extra_params.exposure_time_r,
        this.instrumentConfig.extra_params.exposure_time_i,
        this.instrumentConfig.extra_params.exposure_time_z
      );
    }
  }
};
</script>
