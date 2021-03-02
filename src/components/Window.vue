<template>
  <panel
    :id="'window' + $parent.$parent.index + index"
    icon="fas fa-calendar"
    title="Window"
    :index="index"
    :errors="errors"
    :canremove="index > 0"
    :cancopy="true"
    :show="show"
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
              <a href="https://lco.global/observatory/visibility/" title="Target Visibilty Calculator" target="_blank">
                Target Visibility Calculator.
              </a>
            </li>
            <li v-show="observationType === 'RAPID_RESPONSE'">
              A start time cannot be selected for a Rapid Response observation. It will be scheduled as soon as possible.
            </li>
          </ul>
          <h4 v-show="showAirmass" class="text-center">
            Visibility
          </h4>
          <airmass v-show="showAirmass" :data="airmassData" :show-zoom-controls="true" />
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-datetime
              v-show="observationType != 'RAPID_RESPONSE'"
              v-model="window.start"
              label="Start"
              field="start"
              desc="UT time when the observing window opens"
              :errors="errors.start"
              @input="update"
            />
            <custom-datetime
              v-model="window.end"
              label="End"
              field="end"
              desc="UT time when the observing window closes"
              :errors="errors.end"
              @input="update"
            />
            <custom-select
              v-if="!simpleInterface"
              v-model="cadence"
              label="Cadence"
              field="cadence"
              desc="A cadence will replace your current observing window with a set of windows, one for each cycle of the cadence."
              :options="[
                { text: 'None', value: 'none' },
                { text: 'Simple Period', value: 'simple' }
              ]"
            />
            <custom-field
              v-show="cadence === 'simple'"
              v-model="period"
              label="Period"
              field="period"
              desc="Decimal hours"
              :errors="errors.period"
              @input="update"
            />
            <custom-field
              v-show="cadence === 'simple'"
              v-model="jitter"
              label="Jitter"
              field="jitter"
              desc="Acceptable deviation from strict period (before or after) in decimal hours. Must be long enough to contain one observation request, including overheads."
              :errors="errors.jitter"
              @input="update"
            />
            <b-form-group
              v-show="cadence !== 'none' && show"
              label-size="sm"
              label-align-sm="right"
              label-cols-sm="4"
              label=""
              label-for="cadence-button"
            >
              <b-button id="cadence-button" block variant="outline-primary" @click="genCadence">
                Generate Cadence
              </b-button>
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </panel>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import { collapseMixin, extractTopLevelErrors } from '@/utils.js';
import Panel from '@/components/util/Panel.vue';
import CustomAlert from '@/components/util/CustomAlert.vue';
import CustomDatetime from '@/components/util/CustomDatetime.vue';
import CustomField from '@/components/util/CustomField.vue';
import CustomSelect from '@/components/util/CustomSelect.vue';
import Airmass from '@/components/Airmass.vue';

export default {
  components: {
    CustomDatetime,
    CustomField,
    CustomSelect,
    Panel,
    CustomAlert,
    Airmass
  },
  mixins: [collapseMixin],
  props: {
    window: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    errors: {
      type: Object,
      required: true
    },
    parentshow: {
      type: Boolean
    },
    simpleInterface: {
      type: Boolean
    },
    observationType: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      show: this.parentshow,
      airmassData: {},
      showAirmass: false,
      cadence: 'none',
      period: 24.0,
      jitter: 12.0
    };
  },
  computed: {
    topLevelErrors: function() {
      return extractTopLevelErrors(this.errors);
    },
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    }
  },
  methods: {
    update: function() {
      this.$emit('windowupdate');
    },
    genCadence: function() {
      this.$emit('cadence', {
        start: this.window.start,
        end: this.window.end,
        period: this.period,
        jitter: this.jitter
      });
    },
    updateVisibility: function(req) {
      let request = _.cloneDeep(req);
      // Replace the window list with a single window with this start/end
      request['windows'] = [{ start: this.window.start, end: this.window.end }];
      let that = this;
      $.ajax({
        type: 'POST',
        url: this.observationPortalApiUrl + '/api/airmass/',
        data: JSON.stringify(request),
        contentType: 'application/json',
        success: function(data) {
          that.airmassData = data;
          that.showAirmass = 'airmass_limit' in data;
        }
      });
    }
  }
};
</script>
