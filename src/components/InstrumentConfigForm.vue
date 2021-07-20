<template>
  <b-form :id="id">
    <ocs-custom-field
      v-model="instrumentConfig.exposure_count"
      field="exposure_count"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_count', 'label'], 'Exposure Count')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_count', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_count', 'hide'], false)"
      type="number"
      :errors="errors.exposure_count"
      @input="update"
    />
    <ocs-custom-field
      v-model="instrumentConfig.exposure_time"
      field="exposure_time"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_time', 'label'], 'Exposure Time')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_time', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_time', 'hide'], selectedInstrument === '2M0-SCICAM-MUSCAT')"
      :errors="errors.exposure_time"
      @input="update"
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
      v-model="muscat.exposure_mode"
      field="exposure_mode"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_mode', 'label'], 'Exposure Mode')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_mode', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_mode', 'hide'], selectedInstrument !== '2M0-SCICAM-MUSCAT')"
      :options="muscat.exposureModeOptions"
      :errors="null"
      @input="update"
    />
    <ocs-custom-field
      v-model="muscat.exposure_time_g"
      field="exposure_time_g"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_g', 'label'], 'Exposure Time g')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_g', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_g', 'hide'], selectedInstrument !== '2M0-SCICAM-MUSCAT')"
      :errors="null"
      @input="update"
    />
    <ocs-custom-field
      v-model="muscat.exposure_time_r"
      field="exposure_time_r"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_r', 'label'], 'Exposure Time r')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_r', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_r', 'hide'], selectedInstrument !== '2M0-SCICAM-MUSCAT')"
      :errors="null"
      @input="update"
    />
    <ocs-custom-field
      v-model="muscat.exposure_time_i"
      field="exposure_time_i"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_i', 'label'], 'Exposure Time i')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_i', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_i', 'hide'], selectedInstrument !== '2M0-SCICAM-MUSCAT')"
      :errors="null"
      @input="update"
    />
    <ocs-custom-field
      v-model="muscat.exposure_time_z"
      field="exposure_time_z"
      :label="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_z', 'label'], 'Exposure Time z')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_z', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'exposure_time_z', 'hide'], selectedInstrument !== '2M0-SCICAM-MUSCAT')"
      :errors="null"
      @input="update"
    />
    <!-- End of MUSCAT instrument specific fields -->
    <ocs-custom-select
      v-model="instrumentConfig.mode"
      field="readout_mode"
      :label="getFromObject(formConfig, ['instrumentConfig', 'readout_mode', 'label'], 'Readout Mode')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'readout_mode', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'readout_mode', 'hide'], readoutModeOptions.length <= 1)"
      :options="readoutModeOptions"
      :errors="errors.mode"
      @input="update"
    />
    <div v-for="opticalElementGroup in availableOpticalElementGroups" :key="opticalElementGroup.type">
      <ocs-custom-select
        v-model="instrumentConfig.optical_elements[opticalElementGroup.type]"
        :field="opticalElementGroup.type"
        :label="getFromObject(formConfig, ['instrumentConfig', opticalElementGroup.type, 'label'], opticalElementGroup.label)"
        :desc="getFromObject(formConfig, ['instrumentConfig', opticalElementGroup.type, 'desc'], '')"
        :hide="getFromObject(formConfig, ['instrumentConfig', opticalElementGroup.type, 'hide'], false)"
        :options="opticalElementGroup.options"
        :lower-options="true"
        :errors="{}"
        @input="updateOpticalElement"
      />
    </div>
    <ocs-custom-select
      v-model="instrumentConfig.rotator_mode"
      field="rotator_mode"
      :label="getFromObject(formConfig, ['instrumentConfig', 'rotator_mode', 'label'], 'Rotator Mode')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'rotator_mode', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'rotator_mode', 'hide'], rotatorModeOptions.length <= 0)"
      :errors="errors.rotator_mode"
      :options="rotatorModeOptions"
      @input="update"
    />
    <!-- TODO: Validate required field values -->
    <ocs-custom-field
      v-for="field in requiredRotatorModeFields"
      :key="field"
      v-model="instrumentConfig.extra_params[field]"
      :label="getFromObject(formConfig, ['instrumentConfig', field, 'label'], field)"
      :desc="getFromObject(formConfig, ['instrumentConfig', field, 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', field, 'hide'], rotatorModeOptions.length <= 0)"
      :errors="null"
      @input="updateInstrumentConfigExtraParam($event, field)"
    />
    <!-- TODO: Validate to make sure this is a floating point number -->
    <ocs-custom-field
      v-model="defocus"
      field="defocus"
      :label="getFromObject(formConfig, ['instrumentConfig', 'defocus', 'label'], 'Defocus')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'defocus', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'defocus', 'hide'], selectedInstrumentCategory !== 'IMAGE' || simpleInterface)"
      :errors="null"
      type="number"
      @input="update"
    />
    <ocs-custom-field
      v-model="offsetRA"
      field="offset-ra"
      :label="getFromObject(formConfig, ['instrumentConfig', 'offset_ra', 'label'], 'Offset RA')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'offset_ra', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'offset_ra', 'hide'], !ditheringIsAllowed)"
      :errors="null"
      @input="update"
    />
    <ocs-custom-field
      v-model="offsetDec"
      field="offset-dec"
      :label="getFromObject(formConfig, ['instrumentConfig', 'offset_dec', 'label'], 'Offset Dec')"
      :desc="getFromObject(formConfig, ['instrumentConfig', 'offset_dec', 'desc'], '')"
      :hide="getFromObject(formConfig, ['instrumentConfig', 'offset_dec', 'hide'], !ditheringIsAllowed)"
      :errors="null"
      @input="update"
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
    id: {
      type: String,
      required: true
    },
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
    ditheringIsAllowed: {
      type: Boolean
    },
    show: {
      type: Boolean
    },
    formConfig: {
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
      offsetRA,
      offsetDec,
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      update,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    } = OCSComposable.baseInstrumentConfig(instrumentConfig, availableInstruments, selectedInstrument, context);

    return {
      // Data
      offsetRA,
      offsetDec,
      opticalElementUpdates,
      readoutModeOptions,
      rotatorModeOptions,
      requiredRotatorModeFields,
      availableOpticalElementGroups,
      // Methods
      update,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    };
  },
  data: function() {
    return {
      defocus: 0,
      // Fields used for the muscat instrument
      muscat: {
        exposure_time_g: 0,
        exposure_time_r: 0,
        exposure_time_i: 0,
        exposure_time_z: 0,
        exposure_mode: 'SYNCHRONOUS',
        exposureModeOptions: [
          { value: 'SYNCHRONOUS', text: 'Synchronous' },
          { value: 'ASYNCHRONOUS', text: 'Asynchronous' }
        ]
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
      this.update();
    },
    'muscat.exposure_time_g': function(value) {
      this.instrumentConfig.extra_params.exposure_time_g = value || undefined;
      this.updateExposureTime();
    },
    'muscat.exposure_time_r': function(value) {
      this.instrumentConfig.extra_params.exposure_time_r = value || undefined;
      this.updateExposureTime();
    },
    'muscat.exposure_time_i': function(value) {
      this.instrumentConfig.extra_params.exposure_time_i = value || undefined;
      this.updateExposureTime();
    },
    'muscat.exposure_time_z': function(value) {
      this.instrumentConfig.extra_params.exposure_time_z = value || undefined;
      this.updateExposureTime();
    },
    'muscat.exposure_mode': function(value) {
      this.instrumentConfig.extra_params.exposure_mode = value || undefined;
      this.update();
    },
    selectedInstrument: function(value) {
      if (value === '2M0-SCICAM-MUSCAT') {
        this.instrumentConfig.extra_params.exposure_time_g = this.muscat.exposure_time_g = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_r = this.muscat.exposure_time_r = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_i = this.muscat.exposure_time_i = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_time_z = this.muscat.exposure_time_z = this.instrumentConfig.exposure_time;
        this.instrumentConfig.extra_params.exposure_mode = this.muscat.exposure_mode = 'SYNCHRONOUS';
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
      this.update();
    }
  },
  mounted: function() {
    // If a draft is loaded in that has any extra_params set, update the corresponding params
    // here since extra_params is not reactive and cannot be watched
    if (this.instrumentConfig.extra_params.defocus) {
      this.defocus = this.instrumentConfig.extra_params.defocus;
    }
    if (this.instrumentConfig.extra_params.exposure_time_g) {
      this.muscat.exposure_time_g = this.instrumentConfig.extra_params.exposure_time_g;
    }
    if (this.instrumentConfig.extra_params.exposure_time_r) {
      this.muscat.exposure_time_r = this.instrumentConfig.extra_params.exposure_time_r;
    }
    if (this.instrumentConfig.extra_params.exposure_time_i) {
      this.muscat.exposure_time_i = this.instrumentConfig.extra_params.exposure_time_i;
    }
    if (this.instrumentConfig.extra_params.exposure_time_z) {
      this.muscat.exposure_time_z = this.instrumentConfig.extra_params.exposure_time_z;
    }
    if (this.instrumentConfig.extra_params.exposure_mode) {
      this.muscat.exposure_mode = this.instrumentConfig.extra_params.exposure_mode;
    }
  },
  methods: {
    getFromObject(obj, path, defaultValue) {
      return OCSUtil.getFromObject(obj, path, defaultValue);
    },
    updateExposureTime: function() {
      // FIXME: Switching from Muscat to another instruments results in the exposure time being
      // set to NaN
      this.instrumentConfig.exposure_time = Math.max(
        this.instrumentConfig.extra_params.exposure_time_g,
        this.instrumentConfig.extra_params.exposure_time_r,
        this.instrumentConfig.extra_params.exposure_time_i,
        this.instrumentConfig.extra_params.exposure_time_z
      );
      this.update();
    }
  }
};
</script>
