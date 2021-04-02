<template>
  <b-container id="app" class="p-0">
    <b-form-row>
      <b-col>
        <!-- TODO Add in LCO terms -->

        <custom-alert v-show="!isMemberOfActiveProposals" alertclass="danger" :dismissible="false">
          <p>
            You must be a member of a currently active proposal in order to create and submit observation requests. You can review the
            <a href="https://lco.global/files/User_Documentation/gettingstartedonthelconetwork.latest.pdf">getting started guide</a> or the
            <a href="https://lco.global/observatory/proposal/process/">proposal process documentation</a> to see how to become a member of a proposal.
          </p>
        </custom-alert>

        <!-- TODO: If the same alert is brought up more than once, it will only display the
        first time. This applies to all alerts, not just this one -->
        <custom-alert v-for="alert in alerts" :key="alert.msg" :alertclass="alert.class" :dismissible="true">
          {{ alert.msg }}
        </custom-alert>
      </b-col>
    </b-form-row>
    <b-tabs id="tabs" fill>
      <b-tab :active="tab == 1" @click="tab = 1">
        <template slot="title">
          <span><i class="far fa-edit" /> Form</span>
        </template>
        <ocs-request-group-composition-form
          class="p-4"
          :observation-portal-api-base-url="observationPortalApiUrl"
          :datetime-format="datetimeFormat"
          :profile="profile"
          :request-group="requestgroup"
          :instruments="instruments"
          :site-code-to-color="siteToColor"
          :site-code-to-name="siteCodeToName"
          @save-draft-failed="onSaveDraftFailed"
          @save-draft-succeeded="onSaveDraftSucceeded"
          @request-group-saved="onRequestGroupSaved"
        >
          <template #request-group-help="slotProps">
            <h3>
              Duration of Observation Request:
              <sup
                v-b-tooltip="tooltipConfig"
                class="text-primary"
                title="The time that will be deducted from your proposal when this request completes.
                Includes exposure times, slew times, and instrument overheads."
              >
                ?
              </sup>
            </h3>
            <h2>{{ slotProps.data.durationDisplay }}</h2>
            <br />
            <div v-if="!simpleInterface">
              <ul>
                <li>
                  <a target="_blank" href="https://lco.global/documentation/special-scheduling-modes/">More information about Rapid Response mode.</a>
                </li>
                <li>
                  <a target="_blank" href=" https://lco.global/documents/20/the_new_priority_factor.pdf">
                    More information about IntraProprosal Priority (IPP).
                  </a>
                </li>
              </ul>
            </div>
          </template>
          <template #request-help>
            <ul>
              <li>
                <a target="_blank" href="https://lco.global/observatory/instruments/">More information about LCO instruments.</a>
              </li>
            </ul>
          </template>
          <template #window-help>
            <ul>
              <li>
                Try the
                <a href="https://lco.global/observatory/visibility/" title="Target Visibilty Calculator" target="_blank">
                  Target Visibility Calculator.
                </a>
              </li>

              <!-- TODO: Pass through observation type -->
              <li v-show="observationType === 'RAPID_RESPONSE'">
                A start time cannot be selected for a Rapid Response observation. It will be scheduled as soon as possible.
              </li>
            </ul>
          </template>
          <template #configuration-help="slotProps">
            <ul>
              <li>
                For more information on the different options, see the "Getting Started" guide in our
                <a href="https://lco.global/documentation/" target="_blank">
                  Documentation section.
                </a>
              </li>
            </ul>

            {{ slotProps }}

            <!-- TODO: Do not show if calibrations have been created -->

            <!-- TODO: Implement generating calib frames from here -->

            <!-- <b-row v-show="configuration.type === 'SPECTRUM'" class="p-2">
              <b-col>
                <h3>Calibration frames</h3>
                <p>
                  We recommend that you schedule calibration frames with a spectrum type configuration. Click <em>'Create calibration frames'</em> to
                  add four calibration configurations to this request: one arc and one flat before and one arc and one flat after your spectrum.
                </p>
                <b-button variant="outline-primary" block @click="generateCalibs">
                  Create calibration frames
                </b-button>
              </b-col>
            </b-row> -->
          </template>
          <template #instrument-config-help>
            <ul>
              <li>
                Try the
                <a href=" https://exposure-time-calculator.lco.global/" target="_blank">
                  online Exposure Time Calculator.
                </a>
              </li>
            </ul>
          </template>
          <template #target-help="slotProps">
            {{ slotProps }}
            <!-- TODO -->
            <!-- <archive v-if="target.ra && target.dec" :ra="target.ra" :dec="target.dec" /> -->
          </template>
          <template #constraints-help>
            <ul>
              <li>
                Advice on
                <a href="https://lco.global/documentation/airmass-limit" target="_blank">
                  setting the airmass limit.
                </a>
              </li>
            </ul>
          </template>
        </ocs-request-group-composition-form>
      </b-tab>
      <b-tab :active="tab == 2" @click="tab = 2">
        <template slot="title">
          <span><i class="fas fa-code" /> API View</span>
        </template>
        <b-container class="p-0 mt-2">
          <b-form-row>
            <b-col class="bg-light rounded">
              <ocs-request-group-api-display
                class="p-4"
                :request-group="requestgroup"
                :extra-download-button-attrs="{ class: 'float-right', variant: 'primary' }"
              />
            </b-col>
          </b-form-row>
        </b-container>
      </b-tab>
      <b-tab :active="tab == 3" @click="tab = 3">
        <template slot="title">
          <span><i class="far fa-file-alt" /> Drafts</span>
        </template>
        <b-container class="p-0 mt-2">
          <b-form-row>
            <b-col>
              <ocs-request-group-drafts-table
                v-if="tab === 3"
                table-id="drafts-table"
                :observation-portal-api-base-url="observationPortalApiUrl"
                :extra-table-attrs="{ hover: true, striped: true }"
                show-extra-field
                extra-field-label="Load"
                show-delete-button
                :extra-delete-button-attrs="{ size: 'sm', variant: 'danger' }"
              >
                <template #extra-field-content="data">
                  <b-button variant="primary" size="sm" @click="loadDraft(data.rowData.id)">
                    <i class="fa fa-download" />
                  </b-button>
                </template>
              </ocs-request-group-drafts-table>
            </b-col>
          </b-form-row>
        </b-container>
      </b-tab>
      <b-tab :active="tab == 4" @click="tab = 4">
        <template slot="title">
          <span><i class="fas fa-question" /> How to use this page</span>
        </template>
        <b-container class="p-0 mt-2">
          <b-form-row>
            <b-col class="my-3">
              <h2>Using the compose form</h2>
              <p>
                Use the form to describe the observation you would like carried out on the network. Sections marked with an exclamation mark
                <i class="fas fa-exclamation-triangle text-danger" /> are incomplete or invalid. A complete section will be marked with a
                <i class="fa fa-check text-success" />. Only when all sections are marked complete can the observation be submitted.
              </p>
              <p>
                Some fields have blue question marks next to the field labels. Hovering over these question marks will display more information about
                that field.
              </p>
              <p>
                Each section may be collapsed for a more compact view. Use the <i class="fa fa-window-minimize text-primary" /> and
                <i class="fa fa-window-maximize text-primary" /> buttons to control the state of the window.
              </p>
              <p>
                Some sections may be copied using the <i class="fa fa-copy text-success" /> button. This will duplicate the section and add it to your
                observation request. Certain sections can also be removed using the <i class="fa fa-trash text-danger" /> button. This button is only
                displayed if that section is eligible for removal.
              </p>
              <h2>Using the API view</h2>
              <p>
                This is what your request looks like in JSON format.
              </p>
              <p>
                This code can be used to submit this observation through the API. Using the API allows you to generate and submit observations for
                scheduling using programming languages like python.
              </p>
              <p>
                For more information see the
                <a target="_blank" href="https://developers.lco.global/#observations">API Documentation</a>.
              </p>
              <h2>Loading and saving drafts</h2>
              <p>
                Use the <i class="fa fa-save text-primary" /> button at any time to save an observation request as a draft. Saved drafts can be loaded
                and managed from the Drafts tab. You will see drafts saved by other members of your proposal as well as your own.
              </p>
            </b-col>
          </b-form-row>
        </b-container>
      </b-tab>
    </b-tabs>
    <modal :show="showEdPopup" :show-cancel="false" @close="closeEdPopup" @submit="closeEdPopup">
      <h3>Welcome to the LCO observation request page!</h3>
      <p>Using this form you can instruct the LCO telescope network to perform an astronomical observation on your behalf.</p>
      <p>
        Fields should be filled out from top to bottom. Some fields labels have blue question marks next to them. Hover over one of these question
        marks to view more information about that field.
      </p>
      <p>
        A field highlighted in red with means that there is a problem with the given value. An error message will be displayed below any underneath a
        field such as this. An observation request cannot be submitted until the form is free of errors.
      </p>
      <p>
        Some elements may be copied using the <i class="fa fa-copy text-success" /> copy button. For example: to create an RGB image you can copy the
        instrument configuration twice so that there are three, and set the filters in each accordingly.
      </p>
      <p>Thanks for using Las Cumbres Observatory!</p>
    </modal>
  </b-container>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import Vue from 'vue';

import CustomAlert from '@/components/util/CustomAlert.vue';
import Modal from '@/components/util/Modal.vue';
import { siteToColor, siteCodeToName, tooltipConfig, julianToModifiedJulian } from '@/utils.js';

export default {
  name: 'Compose',
  components: {
    CustomAlert,
    Modal
  },
  data: function() {
    // TODO: If there is a requestgroupid in the url, get the requestgroup from the api and
    // use that as the requestgroup that is passed into the data

    let datetimeFormat = 'YYYY-MM-DD HH:mm:ss';
    let simpleInterface = this.$store.state.profile.profile.simple_interface;
    return {
      tab: 1,
      alerts: [],
      instruments: {},
      datetimeFormat: datetimeFormat,
      siteToColor: siteToColor,
      siteCodeToName: siteCodeToName,
      tooltipConfig: tooltipConfig,
      lookingUP: false,
      lookupFail: false,
      lookupText: '',
      lookupReq: undefined,
      requestgroup: {
        name: '',
        proposal: '',
        ipp_value: 1.05,
        operator: 'SINGLE',
        observation_type: 'NORMAL',
        requests: [
          {
            acceptability_threshold: '',
            configurations: [
              {
                type: 'EXPOSE',
                instrument_type: '',
                instrument_configs: [
                  {
                    bin_x: '',
                    bin_y: '',
                    exposure_count: 1,
                    exposure_time: '',
                    mode: '',
                    rotator_mode: '',
                    extra_params: {
                      defocus: 0
                    },
                    optical_elements: {}
                  }
                ],
                acquisition_config: {
                  mode: 'OFF',
                  extra_params: {
                    acquire_radius: null
                  }
                },
                guiding_config: {
                  mode: 'ON',
                  optional: true,
                  extra_params: {}
                },
                target: {
                  name: '',
                  type: 'ICRS',
                  ra: '',
                  dec: '',
                  proper_motion_ra: 0.0,
                  proper_motion_dec: 0.0,
                  epoch: 2000,
                  parallax: 0
                },
                constraints: {
                  max_airmass: simpleInterface ? 2 : 1.6,
                  min_lunar_distance: 30.0
                }
              }
            ],
            windows: [
              {
                start: moment.utc().format(datetimeFormat),
                end: moment
                  .utc()
                  .add(1, 'days')
                  .format(datetimeFormat)
              }
            ],
            location: {
              telescope_class: ''
            }
          }
        ]
      }
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    simbadServiceUrl: function() {
      return this.$store.state.urls.simbadService;
    },
    simpleInterface: function() {
      return this.$store.state.profile.profile.simple_interface;
    },
    showEdPopup: function() {
      return localStorage.getItem('hasVisited') != 'true' && this.simpleInterface;
    },
    profile: function() {
      return this.$store.state.profile;
    },
    isMemberOfActiveProposals: function() {
      let nActiveProposals = 0;
      for (let proposal of this.profile.proposals) {
        if (proposal.current) {
          nActiveProposals++;
        }
      }
      return nActiveProposals > 0 ? true : false;
    }
  },
  created: function() {
    $.ajax({
      url: `${this.observationPortalApiUrl}/api/instruments/`
    }).done(data => {
      this.instruments = data;
    });
  },
  methods: {
    loadDraft: function(id) {
      this.draftId = id;
      this.tab = 1;
      $.getJSON(this.observationPortalApiUrl + '/api/drafts/' + id + '/', data => {
        // TODO: Load the draft into the form component

        this.requestgroup = {};
        Vue.nextTick(() => {
          this.requestgroup = JSON.parse(data.content);
        });
        // this.validate();
      });
    },
    closeEdPopup: function() {
      localStorage.setItem('hasVisited', 'true');
    },
    onSaveDraftFailed: function(msg) {
      console.log('onSaveDraftFailed', msg);
    },
    onSaveDraftSucceeded: function(msg) {
      console.log('onSaveDraftSucceeded', msg);
    },
    onRequestGroupSaved: function(msg) {
      console.log('onRequestGroupSaved', msg);
    }
  },
  watch: {
    'target.name': _.debounce(function(name) {
      // TODO

      this.lookingUP = true;
      this.lookupFail = false;
      this.lookupText = 'Searching for coordinates...';
      let that = this;
      if (this.lookupReq) {
        this.lookupReq.abort();
      }
      let target_type = 'SIDEREAL';
      if (this.target.type === 'ORBITAL_ELEMENTS') {
        target_type = 'NON_SIDEREAL';
      }
      this.lookupReq = $.getJSON(
        this.simbadServiceUrl +
          '/' +
          encodeURIComponent(name) +
          '?target_type=' +
          encodeURIComponent(target_type) +
          '&scheme=' +
          encodeURIComponent(this.target.scheme)
      )
        .done(function(data) {
          if (_.get(data, ['error'], null) === null) {
            that.target.ra = _.get(data, ['ra_d'], null);
            that.target.dec = _.get(data, ['dec_d'], null);
            that.ra_display = _.get(data, ['ra_d'], null);
            that.dec_display = _.get(data, ['dec_d'], null);
            that.target.proper_motion_ra = _.get(data, ['pmra'], null);
            that.target.proper_motion_dec = _.get(data, ['pmdec'], null);
            that.target.parallax = _.get(data, ['plx_value'], null);
            that.target.epochofel = julianToModifiedJulian(_.get(data, ['epoch_jd'], null));
            that.target.orbinc = _.get(data, ['inclination'], null);
            that.target.longascnode = _.get(data, ['ascending_node'], null);
            that.target.argofperih = _.get(data, ['argument_of_perihelion'], null);
            that.target.eccentricity = _.get(data, ['eccentricity'], null);
            that.target.perihdist = _.get(data, ['perihelion_distance'], null);
            that.target.epochofperih = julianToModifiedJulian(_.get(data, ['perihelion_date_jd'], null));
            that.target.meandist = _.get(data, ['semimajor_axis'], null);
            that.target.meananom = _.get(data, ['mean_anomaly'], null);
            that.target.dailymot = _.get(data, ['mean_daily_motion'], null);
            that.updateRA();
            that.updateDec();
          } else {
            that.lookupText = 'Could not find any matching objects';
            that.lookupFail = true;
          }
        })
        .fail(function(_response, status) {
          if (status !== 'abort') {
            that.lookupText = 'Could not find any matching objects';
            that.lookupFail = true;
          }
        })
        .always(function(_response, status) {
          if (status !== 'abort') {
            that.lookingUP = false;
          }
          that.update();
        });
    }, 500)
  }
};
</script>
