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
    <b-alert variant="warning" :show="badFilterReadoutMode">
      <strong>Warning:</strong> This filter/readout mode combination is not eligible for automatic reduction. <br><br>
      Please contact <a href="mailto:science-support@lco.global">science support</a> if this combination is required.
    </b-alert>
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
    <div v-for="opticalElementGroup in availableOpticalElementGroups" :key="opticalElementGroup.type" class="d-inline">
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
    <ocs-extra-params-fields
      :extra-params.sync="instrumentConfig.extra_params"
      :validation-schema="extraParamsValidationSchema"
      :errors="errors.extra_params"
      :ignore-params="['offset_ra', 'offset_dec']"
      :parent-show="show"
      @extraparamsupdate="update"
    >
    </ocs-extra-params-fields>
  </b-form>
</template>
<script>
import { toRef } from '@vue/composition-api';
import { OCSComposable, OCSUtil } from 'ocs-component-lib';
import _ from 'lodash';

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
      extraParamsValidationSchema,
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
      extraParamsValidationSchema,
      // Methods
      update,
      updateOpticalElement,
      updateInstrumentConfigExtraParam
    };
  },
  data: function() {
    return {
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
      },
      badFilterReadoutMode: false
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
    'instrumentConfig.optical_elements.filter': function(value) {
      this.badFilterReadoutMode = false;
      if (this.selectedInstrument === '1M0-SCICAM-SINISTRO') {
        if (this.instrumentConfig.mode === 'central_2k_2x2') {
          if (_.includes(['u', 'b', 'v', 'r', 'i'], value)) {
            this.badFilterReadoutMode = true;
          }
        }
      }
    },
    'instrumentConfig.mode': function(value) {
      if ("extra_params" in this.instrumentConfig) {
        delete this.instrumentConfig.extra_params.bin_x
        delete this.instrumentConfig.extra_params.bin_y
      }
      this.badFilterReadoutMode = false;
      if (this.selectedInstrument === '1M0-SCICAM-SINISTRO') {
        if (value === 'central_2k_2x2') {
          if (_.includes(['u', 'b', 'v', 'r', 'i'], this.instrumentConfig.optical_elements.filter.toLowerCase())) {
            this.badFilterReadoutMode = true;
          }
        }
      }
    },
    'instrumentConfig.exposure_time': function(value) {
      if (this.selectedInstrument === 'SOAR_TRIPLESPEC') {
        if (value < 7.0) {
          this.instrumentConfig.mode = 'fowler1_coadds2';
        } else if (value < 25.0) {
          this.instrumentConfig.mode = 'fowler1_coadds1';
        } else if (value < 58.0) {
          this.instrumentConfig.mode = 'fowler4_coadds1';
        } else if (value < 134.0) {
          this.instrumentConfig.mode = 'fowler8_coadds1';
        } else {
          this.instrumentConfig.mode = 'fowler16_coadds1';
        }
      }
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
    selectedInstrumentCategory: function() {
      this.update();
    }
  },
  mounted: function() {
    // For any instrument, remove any optical elements that do not currently exist but were set
    // This can happen when loading an old draft or copying an old request after OE have changed.
    for (let oe in this.instrumentConfig.optical_elements) {
      let plural_oe = oe + 's';
      if (!(plural_oe in this.availableInstruments[this.selectedInstrument].optical_elements)) {
        delete this.instrumentConfig.optical_elements[oe];
      }
    }

    // Now set the default of any unset optical elements if a default exists
    if (this.selectedInstrument in this.availableInstruments) {
      for (let plural_oe in this.availableInstruments[this.selectedInstrument].optical_elements) {
        let oe = plural_oe.slice(0, -1);
        if (!(oe in this.instrumentConfig.optical_elements)) {
          this.availableInstruments[this.selectedInstrument].optical_elements[plural_oe].every(oe_value => {
            if (oe_value.default && oe_value.schedulable) {
              this.instrumentConfig.optical_elements[oe] = oe_value.code;
              return false;
            }
            return true;
          });
        }
      }
    }

    // If a draft is loaded in that has any extra_params set, update the corresponding params
    // here since extra_params is not reactive and cannot be watched
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
