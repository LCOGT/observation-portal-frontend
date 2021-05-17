<template>
  <panel
    :id="'instrumentconfig' + $parent.$parent.$parent.index + $parent.index + index"
    :show="show"
    title="Instrument Configuration"
    icon="fas fa-camera-retro"
    :index="index"
    :errors="errors"
    :canremove="index > 0"
    :cancopy="true"
    @remove="$emit('remove')"
    @copy="$emit('copy')"
    @show="show = $event"
  >
    <custom-alert v-for="error in topLevelErrors" :key="error" alertclass="danger" :dismissible="false">
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col v-show="show" md="6">
          <ul>
            <li>
              Try the
              <a href=" https://exposure-time-calculator.lco.global/" target="_blank">
                online Exposure Time Calculator.
              </a>
            </li>
          </ul>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-field
              v-model="instrumentconfig.exposure_count"
              label="Exposure Count"
              field="exposure_count"
              type="number"
              :errors="errors.exposure_count"
              @input="update"
            />
            <custom-field
              v-if="selectedinstrument != '2M0-SCICAM-MUSCAT'"
              v-model="instrumentconfig.exposure_time"
              label="Exposure Time"
              field="exposure_time"
              :errors="errors.exposure_time"
              desc="Seconds"
              @input="update"
            >
              <div v-if="suggestedLampFlatSlitExposureTime" slot="extra-help-text">
                Suggested exposure time for a Lamp Flat with slit {{ instrumentconfig.optical_elements.slit }} and readout mode
                {{ instrumentconfig.mode }} is <strong>{{ suggestedLampFlatSlitExposureTime }} seconds</strong>
              </div>
              <div v-else-if="suggestedArcExposureTime" slot="extra-help-text">
                Suggested exposure time for an Arc is <strong>{{ suggestedArcExposureTime }} seconds</strong>
              </div>
            </custom-field>

            <!-- MUSCAT instrument specific fields -->
            <custom-select
              v-if="selectedinstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_mode"
              label="Exposure Mode"
              field="exposure_mode"
              :options="exposureModeOptions"
              :errors="null"
              desc="Exposure Mode. SYNCHRONOUS syncs the start time of exposures on all 4 cameras.
                    ASYNCHRONOUS takes exposures as quickly as possible on each camera"
              @input="update"
            />
            <custom-field
              v-if="selectedinstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_g"
              label="Exposure Time g"
              field="exposure_time_g"
              :errors="null"
              desc="Exposure Time for the g-band camera in Seconds"
              @input="update"
            />
            <custom-field
              v-if="selectedinstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_r"
              label="Exposure Time r"
              field="exposure_time_r"
              :errors="null"
              desc="Exposure Time for the r-band camera in Seconds"
              @input="update"
            />
            <custom-field
              v-if="selectedinstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_i"
              label="Exposure Time i"
              field="exposure_time_i"
              :errors="null"
              desc="Exposure Time for the i-band camera in Seconds"
              @input="update"
            />
            <custom-field
              v-if="selectedinstrument == '2M0-SCICAM-MUSCAT'"
              v-model="exposure_time_z"
              label="Exposure Time z"
              field="exposure_time_z"
              :errors="null"
              desc="Exposure Time for the z-band camera in Seconds"
              @input="update"
            />

            <custom-select
              v-if="readoutModeOptions.length > 1"
              v-model="instrumentconfig.mode"
              label="Readout Mode"
              field="readout_mode"
              :options="readoutModeOptions"
              :errors="errors.mode"
              @input="update"
            />
            <div v-for="opticalElementGroup in availableOpticalElementGroups" :key="opticalElementGroup.type">
              <custom-select
                v-if="!simpleInterface || (simpleInterface && selectedinstrument !== '2M0-SCICAM-MUSCAT')"
                v-model="instrumentconfig.optical_elements[opticalElementGroup.type]"
                :label="opticalElementGroup.label"
                :field="opticalElementGroup.type"
                :options="opticalElementGroup.options"
                :lower-options="true"
                :errors="{}"
                @input="updateOpticalElement"
              />
            </div>
            <div v-if="rotatorModeOptions.length > 0">
              <custom-select
                v-model="instrumentconfig.rotator_mode"
                label="Rotator Mode"
                desc="The slit position. At the parallactic slit angle, atmospheric dispersion is along the slit."
                :errors="errors.rotator_mode"
                :options="rotatorModeOptions"
                @input="update"
              />

              <!-- TODO: Validate required field values -->
              <custom-field
                v-for="field in requiredRotatorModeFields"
                :key="field"
                v-model="instrumentconfig.extra_params[field]"
                :label="field | formatField"
                :errors="null"
                :desc="field | getFieldDescription"
                @input="updateInstrumentConfigExtraParam($event, field)"
              />
            </div>

            <!-- TODO: Validate to make sure this is a floating point number -->

            <custom-field
              v-if="datatype == 'IMAGE' && !simpleInterface"
              v-model="defocus"
              label="Defocus"
              field="defocus"
              :errors="null"
              type="number"
              desc="Observations may be defocused to prevent the CCD from saturating on bright targets. This
                    term describes the offset (in mm) of the secondary mirror from its default (focused)
                    position. The limits are ± 3mm."
              @input="update"
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </panel>
</template>
<script>
import _ from 'lodash';
import { OCSUtil } from 'ocs-component-lib';

import {
  collapseMixin,
  lampFlatDefaultExposureTime,
  arcDefaultExposureTime,
  extractTopLevelErrors,
  getFieldDescription,
  apiFieldToReadable
} from '@/utils.js';
import CustomField from '@/components/util/CustomField.vue';
import CustomSelect from '@/components/util/CustomSelect.vue';
import Panel from '@/components/util/Panel.vue';
import CustomAlert from '@/components/util/CustomAlert.vue';

export default {
  components: {
    CustomField,
    CustomSelect,
    Panel,
    CustomAlert
  },
  filters: {
    formatField: function(value) {
      return OCSUtil.formatField(value, apiFieldToReadable);
    },
    getFieldDescription: function(value) {
      return getFieldDescription(value);
    }
  },
  mixins: [collapseMixin],
  props: {
    errors: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    simpleInterface: {
      type: Boolean
    },
    availableInstruments: {
      type: Object,
      required: true
    },
    selectedinstrument: {
      type: String,
      required: true
    },
    datatype: {
      type: String,
      required: true
    },
    configurationType: {
      type: String,
      required: true
    },
    instrumentconfig: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean
    }
  },
  data: function() {
    return {
      defocus: 0,
      exposure_time_g: 0,
      exposure_time_r: 0,
      exposure_time_i: 0,
      exposure_time_z: 0,
      exposure_mode: 'SYNCHRONOUS',
      opticalElementUpdates: 0,
      exposureModeOptions: [
        { value: 'SYNCHRONOUS', text: 'Synchronous' },
        { value: 'ASYNCHRONOUS', text: 'Asynchronous' }
      ]
    };
  },
  computed: {
    topLevelErrors: function() {
      return extractTopLevelErrors(this.errors);
    },
    instrumentHasRotatorModes: function() {
      return this.availableInstruments[this.selectedinstrument] && 'rotator' in this.availableInstruments[this.selectedinstrument].modes;
    },
    instrumentHasReadoutModes: function() {
      return this.availableInstruments[this.selectedinstrument] && 'readout' in this.availableInstruments[this.selectedinstrument].modes;
    },
    readoutModeOptions: function() {
      if (this.selectedinstrument in this.availableInstruments && this.instrumentHasReadoutModes) {
        let readoutModes = [];
        for (let rm in this.availableInstruments[this.selectedinstrument].modes.readout.modes) {
          readoutModes.push({
            text: this.availableInstruments[this.selectedinstrument].modes.readout.modes[rm].name,
            value: this.availableInstruments[this.selectedinstrument].modes.readout.modes[rm].code,
            binning: this.availableInstruments[this.selectedinstrument].modes.readout.modes[rm].validation_schema.bin_x.default
          });
        }
        return readoutModes;
      } else {
        return [];
      }
    },
    availableOpticalElementGroups: function() {
      if (this.simpleInterface) {
        if (this.selectedinstrument === '2M0-SCICAM-MUSCAT') {
          return {
            diffuser_g_position: {
              type: 'diffuser_g_position',
              label: 'Diffuser g position',
              options: [{ value: 'out', text: 'Out of Beam', default: true }]
            },
            diffuser_r_position: {
              type: 'diffuser_r_position',
              label: 'Diffuser r position',
              options: [{ value: 'out', text: 'Out of Beam', default: true }]
            },
            diffuser_i_position: {
              type: 'diffuser_i_position',
              label: 'Diffuser i position',
              options: [{ value: 'out', text: 'Out of Beam', default: true }]
            },
            diffuser_z_position: {
              type: 'diffuser_z_position',
              label: 'Diffuser z position',
              options: [{ value: 'out', text: 'Out of Beam', default: true }]
            }
          };
        } else {
          return {
            filter: {
              type: 'filter',
              label: 'Filter',
              options: [
                { value: 'b', text: 'Blue', default: true },
                { value: 'v', text: 'Green', default: false },
                { value: 'rp', text: 'Red', default: false }
              ]
            }
          };
        }
      } else if (this.selectedinstrument in this.availableInstruments) {
        let oe_groups = {};
        for (let oe_group_type in this.availableInstruments[this.selectedinstrument].optical_elements) {
          // Each optical element group type has an 's' on the end, but the optical element that is
          // submitted in the optical_elements should have a key that is the same as a group, without the 's'
          let oe_type = oe_group_type.substring(0, oe_group_type.length - 1);
          oe_groups[oe_type] = {};
          oe_groups[oe_type]['type'] = oe_type;
          oe_groups[oe_type]['label'] = _.capitalize(oe_type)
            .split('_')
            .join(' ');
          let elements = [];
          for (let element in this.availableInstruments[this.selectedinstrument].optical_elements[oe_group_type]) {
            if (this.availableInstruments[this.selectedinstrument].optical_elements[oe_group_type][element].schedulable) {
              elements.push({
                value: this.availableInstruments[this.selectedinstrument].optical_elements[oe_group_type][element].code,
                text: this.availableInstruments[this.selectedinstrument].optical_elements[oe_group_type][element].name,
                default: this.availableInstruments[this.selectedinstrument].optical_elements[oe_group_type][element].default
              });
            }
          }
          oe_groups[oe_type]['options'] = _.sortBy(elements, 'text');
        }
        return oe_groups;
      } else {
        return [];
      }
    },
    rotatorModeOptions: function() {
      let options = [];
      let requiredModeFields = [];
      if (this.instrumentHasRotatorModes) {
        let modes = this.availableInstruments[this.selectedinstrument].modes.rotator.modes;
        for (let i in modes) {
          requiredModeFields = [];
          if ('extra_params' in modes[i].validation_schema) {
            for (let j in modes[i].validation_schema.extra_params.schema) {
              requiredModeFields.push(j);
            }
          }
          options.push({
            value: modes[i].code,
            text: modes[i].name,
            requiredFields: requiredModeFields
          });
        }
      }
      return options;
    },
    requiredRotatorModeFields: function() {
      for (let i in this.rotatorModeOptions) {
        if (this.rotatorModeOptions[i].value == this.instrumentconfig.rotator_mode) {
          return this.rotatorModeOptions[i].requiredFields;
        }
      }
      return [];
    },
    suggestedLampFlatSlitExposureTime: function() {
      // Update on optical element updates
      this.opticalElementUpdates;
      let slitWidth = this.instrumentconfig.optical_elements.slit;
      let readoutMode = this.instrumentconfig.mode;
      if (this.configurationType === 'LAMP_FLAT' && slitWidth && readoutMode && this.selectedinstrument) {
        return lampFlatDefaultExposureTime(slitWidth, this.selectedinstrument, readoutMode);
      } else {
        return undefined;
      }
    },
    suggestedArcExposureTime: function() {
      if (this.configurationType === 'ARC' && this.selectedinstrument) {
        return arcDefaultExposureTime(this.selectedinstrument);
      } else {
        return undefined;
      }
    }
  },
  watch: {
    'instrumentconfig.mode': function() {
      this.updateBinning();
    },
    rotatorModeOptions: function() {
      if (this.instrumentHasRotatorModes) {
        this.instrumentconfig.rotator_mode = this.availableInstruments[this.selectedinstrument].modes.rotator.default;
      } else {
        this.instrumentconfig.rotator_mode = '';
      }
      this.update();
    },
    requiredRotatorModeFields: function(newValue, oldValue) {
      // TODO: Implement rotator mode and required rotator mode fields history
      const defaultRequiredFieldValue = 0;
      for (let idx in oldValue) {
        this.instrumentconfig.extra_params[oldValue[idx]] = undefined;
      }
      for (let idx in newValue) {
        this.instrumentconfig.extra_params[newValue[idx]] = defaultRequiredFieldValue;
      }
      this.update();
    },
    readoutModeOptions: function() {
      // TODO: Implement history
      this.instrumentconfig.mode = this.availableInstruments[this.selectedinstrument].modes.readout.default;
      this.updateBinning();
      this.update();
    },
    availableOpticalElementGroups: function(value) {
      // TODO: Implement optical element history
      this.instrumentconfig.optical_elements = {};
      for (let oe_type in value) {
        for (let oe_value_idx in value[oe_type]['options']) {
          if (value[oe_type]['options'][oe_value_idx].default) {
            this.instrumentconfig.optical_elements[oe_type] = value[oe_type]['options'][oe_value_idx].value;
          }
        }
      }
      this.updateOpticalElement();
    },
    defocus: function(value) {
      this.instrumentconfig.extra_params.defocus = value || undefined;
      this.update();
    },
    exposure_time_g: function(value) {
      this.instrumentconfig.extra_params.exposure_time_g = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_r: function(value) {
      this.instrumentconfig.extra_params.exposure_time_r = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_i: function(value) {
      this.instrumentconfig.extra_params.exposure_time_i = value || undefined;
      this.updateExposureTime();
    },
    exposure_time_z: function(value) {
      this.instrumentconfig.extra_params.exposure_time_z = value || undefined;
      this.updateExposureTime();
    },
    exposure_mode: function(value) {
      this.instrumentconfig.extra_params.exposure_mode = value || undefined;
      this.update();
    },
    selectedinstrument: function(value) {
      if (value === '2M0-SCICAM-MUSCAT') {
        this.instrumentconfig.extra_params.exposure_time_g = this.exposure_time_g = this.instrumentconfig.exposure_time;
        this.instrumentconfig.extra_params.exposure_time_r = this.exposure_time_r = this.instrumentconfig.exposure_time;
        this.instrumentconfig.extra_params.exposure_time_i = this.exposure_time_i = this.instrumentconfig.exposure_time;
        this.instrumentconfig.extra_params.exposure_time_z = this.exposure_time_z = this.instrumentconfig.exposure_time;
        this.instrumentconfig.extra_params.exposure_mode = this.exposure_mode = 'SYNCHRONOUS';
      } else {
        this.instrumentconfig.extra_params.exposure_time_g = undefined;
        this.instrumentconfig.extra_params.exposure_time_r = undefined;
        this.instrumentconfig.extra_params.exposure_time_i = undefined;
        this.instrumentconfig.extra_params.exposure_time_z = undefined;
        this.instrumentconfig.extra_params.exposure_mode = undefined;
      }
    },
    datatype: function(value) {
      if (value === 'IMAGE') {
        this.instrumentconfig.extra_params.defocus = this.defocus;
      } else {
        this.instrumentconfig.extra_params.defocus = undefined;
      }
      this.update();
    }
  },
  mounted: function() {
    // If a draft is loaded in that has any extra_params set, update the corresponding params
    // here since extra_params is not reactive and cannot be watched
    if (this.instrumentconfig.extra_params.defocus) {
      this.defocus = this.instrumentconfig.extra_params.defocus;
    }
    if (this.instrumentconfig.extra_params.exposure_time_g) {
      this.exposure_time_g = this.instrumentconfig.extra_params.exposure_time_g;
    }
    if (this.instrumentconfig.extra_params.exposure_time_r) {
      this.exposure_time_r = this.instrumentconfig.extra_params.exposure_time_r;
    }
    if (this.instrumentconfig.extra_params.exposure_time_i) {
      this.exposure_time_i = this.instrumentconfig.extra_params.exposure_time_i;
    }
    if (this.instrumentconfig.extra_params.exposure_time_z) {
      this.exposure_time_z = this.instrumentconfig.extra_params.exposure_time_z;
    }
    if (this.instrumentconfig.extra_params.exposure_mode) {
      this.exposure_mode = this.instrumentconfig.extra_params.exposure_mode;
    }
  },
  methods: {
    update: function() {
      this.$emit('instrumentconfigupdate');
    },
    updateInstrumentConfigExtraParam: function(value, field) {
      if (value === '') {
        // Remove the field if an empty value is entered because the validation
        // for required extra params only check if the field exists
        this.instrumentconfig.extra_params[field] = undefined;
      }
      this.update();
    },
    updateExposureTime: function() {
      this.instrumentconfig.exposure_time = Math.max(
        this.instrumentconfig.extra_params.exposure_time_g,
        this.instrumentconfig.extra_params.exposure_time_r,
        this.instrumentconfig.extra_params.exposure_time_i,
        this.instrumentconfig.extra_params.exposure_time_z
      );

      this.update();
    },
    updateOpticalElement: function() {
      // The optical element fields are not reactive as they change/ are deleted/ don't exist on start.
      // Increment this reactive variable to watch for changed to the optical elements
      this.opticalElementUpdates += 1;
      this.update();
    },
    updateBinning: function() {
      for (let mode in this.readoutModeOptions) {
        if (this.instrumentconfig.mode === this.readoutModeOptions[mode].value) {
          this.instrumentconfig.bin_x = this.readoutModeOptions[mode].binning;
          this.instrumentconfig.bin_y = this.readoutModeOptions[mode].binning;
          this.update();
          return;
        }
      }
    }
  }
};
</script>
