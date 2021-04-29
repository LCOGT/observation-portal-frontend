<template>
  <b-container id="app" class="p-0">
    <b-form-row>
      <b-col>
        <!-- TODO Add in LCO terms -->
        <ocs-custom-alert v-show="!isMemberOfActiveProposals" alertclass="danger" :dismissible="false">
          <p>
            You must be a member of a currently active proposal in order to create and submit observation requests. You can review the
            <a href="https://lco.global/files/User_Documentation/gettingstartedonthelconetwork.latest.pdf">getting started guide</a> or the
            <a href="https://lco.global/observatory/proposal/process/">proposal process documentation</a> to see how to become a member of a proposal.
          </p>
        </ocs-custom-alert>
        <!-- TODO: If the same alert is brought up more than once, it will only display the
        first time. This applies to all alerts, not just this one -->
        <ocs-custom-alert v-for="alert in alerts" :key="alert.msg" :alertclass="alert.class" :dismissible="true">
          {{ alert.msg }}
        </ocs-custom-alert>
      </b-col>
    </b-form-row>
    <b-tabs id="tabs" fill>
      <b-tab :active="tab == 1" @click="tab = 1">
        <template slot="title">
          <span><i class="far fa-edit" /> Form</span>
        </template>
        <ocs-request-group-composition-form
          :observation-portal-api-base-url="observationPortalApiUrl"
          :datetime-format="datetimeFormat"
          :profile="profile"
          :request-group="requestGroup"
          :instruments="instruments"
          :instrument-category-to-name="instrumentCategoryToName"
          :site-code-to-color="siteToColor"
          :site-code-to-name="siteCodeToName"
          show-airmass-plot
          :loaded-draft-id="draftId"
          :form-config="formConfig"
          :tooltip-config="tooltipConfig"
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
            <h2>{{ slotProps.data.durationData | generateDurationString }}</h2>
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
          <template #window-help>
            <ul>
              <li>
                Try the
                <a href="https://lco.global/observatory/visibility/" title="Target Visibilty Calculator" target="_blank">
                  Target Visibility Calculator.
                </a>
              </li>
              <li v-show="requestGroup.observation_type === 'RAPID_RESPONSE'">
                A start time cannot be selected for a Rapid Response observation. It will be scheduled as soon as possible.
              </li>
            </ul>
          </template>
          <template #configuration-help="slotProps">
            <ul>
              <li>
                <a target="_blank" href="https://lco.global/observatory/instruments/">More information about LCO instruments.</a>
              </li>
              <li>
                For more information on the different options, see the "Getting Started" guide in our
                <a href="https://lco.global/documentation/" target="_blank">
                  Documentation section.
                </a>
              </li>
            </ul>
            <!-- TODO: Do not show if calibrations have been created -->
            <b-row v-show="slotProps.data.configuration.type === 'SPECTRUM'" class="p-2">
              <b-col>
                <h3>Calibration frames</h3>
                <p>
                  We recommend that you schedule calibration frames with a spectrum type configuration. Click <em>'Create calibration frames'</em> to
                  add four calibration configurations to this request: one arc and one flat before and one arc and one flat after your spectrum.
                </p>
                <b-button
                  variant="outline-primary"
                  block
                  @click="generateCalibs(slotProps.data.position.configurationIndex, slotProps.data.position.requestIndex)"
                >
                  Create calibration frames
                </b-button>
              </b-col>
            </b-row>
          </template>

          <template #instrument-config-form="slotProps">
            <instrument-config-form
              :instrument-config="slotProps.data.instrumentConfig"
              :errors="slotProps.data.errors"
              :show="slotProps.data.show"
              :simple-interface="simpleInterface"
              :available-instruments="instruments"
              :selected-instrument="
                selectedInstruments[slotProps.data.position.requestIndex][slotProps.data.position.configurationIndex].selectedInstrument
              "
              :selected-instrument-category="
                selectedInstruments[slotProps.data.position.requestIndex][slotProps.data.position.configurationIndex].selectedInstrumentCategory
              "
              :configuration-type="
                selectedInstruments[slotProps.data.position.requestIndex][slotProps.data.position.configurationIndex].configurationType
              "
              :form-config="formConfig"
              @instrumentconfigupdate="$emit('instrumentconfigupdate', $event)"
            />
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
          <template #target-name-field="slotProps">
            <ocs-custom-field
              v-model="slotProps.data.target.name"
              field="name"
              label="Name"
              :errors="slotProps.data.errors"
              @input="doTargetLookup(slotProps.data.target)"
            >
              <div v-show="targetLookup.busy || targetLookup.failed" slot="extra-help-text">
                <i v-show="targetLookup.busy" class="fa fa-spinner fa-spin fa-fw" /> {{ targetLookup.text }}
              </div>
            </ocs-custom-field>
          </template>
          <template #target-help="slotProps">
            <archive v-if="slotProps.data.target.ra && slotProps.data.target.dec" :ra="slotProps.data.target.ra" :dec="slotProps.data.target.dec" />
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
                :request-group="requestGroup"
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
    <ocs-custom-modal :show="showEdPopup" :show-cancel="false" @close="closeEdPopup" @submit="closeEdPopup">
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
    </ocs-custom-modal>
  </b-container>
</template>
<script>
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import Vue from 'vue';
import { OCSUtil } from 'ocs-component-lib';

import Archive from '@/components/Archive.vue';
import InstrumentConfigForm from '@/components/InstrumentConfigForm.vue';
import { siteToColor, siteCodeToName, tooltipConfig, julianToModifiedJulian, lampFlatDefaultExposureTime, arcDefaultExposureTime } from '@/utils.js';

export default {
  name: 'Compose',
  components: {
    Archive,
    InstrumentConfigForm
  },
  filters: {
    generateDurationString: function(value) {
      return OCSUtil.generateDurationString(value);
    }
  },
  data: function() {
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
      draftId: -1,
      targetLookup: {
        busy: false,
        failed: false,
        text: '',
        request: undefined
      },
      instrumentCategoryToName: {
        SPECTRA: 'Spectrum',
        IMAGE: 'Image'
      },
      formConfig: {
        requestGroup: {
          panel: {
            title: 'General Information'
          },
          observation_type: {
            label: 'Mode',
            hide: simpleInterface,
            desc: `Rapid Response (RR) requests bypass normal scheduling and are executed immediately. Time Critical (TC)
            requests are given a large fixed priority that will beat any requests that use default queue scheduling.
            These modes are only available if a  proposal was granted RR or TC time.`
          },
          ipp_value: {
            hide: simpleInterface,
            desc: 'Provide an InterProposal Priority factor for this request. Acceptable values are between 0.5 and 2.0'
          }
        },
        request: {
          acceptability_threshold: {
            hide: simpleInterface,
            desc: `The percentage of the observation that must be completed to mark the request as complete
            and avert rescheduling. The percentage should be set to the lowest value for which the amount
            of data is acceptable to meet the science goal of the request.`
          }
        },
        configuration: {
          instrument_category: {
            label: 'Observation Type'
          },
          type: {
            hide: simpleInterface,
            desc: `Normally, all Instrument Configurations are executed once, sequentially. If set to
            'Exposure Sequence', 'Spectrum Sequence' or 'NRES Spectrum Sequence', all Instrument Configurations
            are repeated in a loop for a specified duration.`
          },
          repeat_duration: {
            desc: `Period (in seconds) over which to repeat Instrument Configurations. Clicking the 'Fill' button
            increases the duration to the longest interval over which the target is visible in the observing window.
            This button is disabled until the entire request has passed validation.`
          }
        },
        instrumentConfig: {
          exposure_time: {
            desc: 'Seconds'
          },
          rotator_mode: {
            desc: 'The slit position. At the parallactic slit angle, atmospheric dispersion is along the slit.'
          },
          rotator_angle: {
            label: 'Rotator Angle',
            desc: 'Position angle of the slit in degrees east of north.'
          },
          defocus: {
            desc: `Observations may be defocused to prevent the CCD from saturating on bright targets. This term
            describes the offset (in mm) of the secondary mirror from its default (focused) position. The limits are ± 3mm.`
          },
          exposure_mode: {
            desc: `Exposure Mode. SYNCHRONOUS syncs the start time of exposures on all 4 cameras. ASYNCHRONOUS
            takes exposures as quickly as possible on each camera`
          },
          exposure_time_g: {
            desc: 'Exposure Time for the g-band camera in Seconds'
          },
          exposure_time_r: {
            desc: 'Exposure Time for the r-band camera in Seconds'
          },
          exposure_time_i: {
            desc: 'Exposure Time for the i-band camera in Seconds'
          },
          exposure_time_z: {
            desc: 'Exposure Time for the z-band camera in Seconds'
          }
        },
        guidingConfig: {
          mode: {
            label: 'Guiding',
            hide: simpleInterface,
            desc: `Guiding keeps the field stable during long exposures. If set to Optional, then guiding is
            attempted but observations are carried out even if guiding fails. If set to On, observations are
            aborted if guiding fails.`
          }
        },
        acquisitionConfig: {
          mode: {
            hide: simpleInterface,
            desc: `The method for positioning the slit or pinhole. If Brightest Object is selected, the slit/pinhole
            is placed on the brightest object near the target coordinates.`
          },
          acquire_radius: {
            hide: simpleInterface,
            label: 'Acquire Radius',
            desc: 'The radius (in arcseconds) within which to search for the brightest object.'
          }
        },
        target: {
          type: {
            hide: simpleInterface
          },
          ra: {
            desc: 'Decimal degrees or HH:MM:SS.S'
          },
          dec: {
            desc: 'Decimal degrees or DD:MM:SS.S'
          },
          proper_motion_ra: {
            hide: simpleInterface,
            desc: 'Units are milliarcseconds per year. Max 20000.'
          },
          proper_motion_dec: {
            hide: simpleInterface,
            desc: 'Units are milliarcseconds per year. Max 20000.'
          },
          epoch: {
            hide: simpleInterface,
            desc: 'Julian Years. Max 2100.'
          },
          parallax: {
            hide: simpleInterface,
            desc: '+0.45 mas. Max 2000.'
          },
          scheme: {
            desc: 'The orbital elements scheme to use with this target'
          },
          epochofel: {
            desc: 'The epoch of the orbital elements in MJD. MJD = JD - 2400000.5'
          },
          orbinc: {
            desc: 'Angle in Degrees'
          },
          longascnode: {
            desc: 'Angle in Degrees'
          },
          argofperih: {
            desc: 'Angle in Degrees'
          },
          eccentricity: {
            desc: '0 to 0.99'
          },
          meandist: {
            desc: 'Astronomical Units (AU)'
          },
          meananom: {
            desc: 'Angle in Degrees'
          },
          dailymot: {
            desc: 'Degrees'
          },
          perihdist: {
            desc: 'Astronomical Units (AU)'
          },
          epochofperih: {
            desc: 'Modified Juian Days'
          }
        },
        constraints: {
          panel: {
            hide: simpleInterface
          },
          max_airmass: {
            desc: `Maximum acceptable airmass at which the observation can be scheduled. A plane-parallel
            atmosphere is assumed.`
          },
          min_lunar_distance: {
            desc: 'Minimum acceptable angular separation (degrees) between the target and the moon.'
          }
        },
        window: {
          start: {
            desc: 'UT time when the observing window opens'
          },
          end: {
            desc: 'UT time when the observing window closes'
          },
          cadence: {
            hide: simpleInterface,
            desc: `A cadence will replace your current observing window with a set of windows,
            one for each cycle of the cadence.`
          },
          period: {
            desc: 'Decimal hours'
          },
          jitter: {
            desc: `Acceptable deviation from strict period (before or after) in decimal hours. Must
            be long enough to contain one observation request, including overheads.`
          }
        }
      },
      requestGroup: {
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
    },
    selectedInstruments: function() {
      // Return object where the first key is the requestIndex and the second is the configurationIndex
      let _selectedInstruments = {};
      for (let requestIndex in this.requestGroup.requests) {
        _selectedInstruments[requestIndex] = {};
        for (let configurationIndex in this.requestGroup.requests[requestIndex].configurations) {
          let configuration = OCSUtil.getFromObject(this.requestGroup, ['requests', requestIndex, 'configurations', configurationIndex], {});
          let selectedInstrument = OCSUtil.getFromObject(configuration,['instrument_type'], '');
          // let selectedInstrumentCategory = OCSUtil.getFromObject(this.instruments, [selectedInstrument, 'type'], '');
          // let configurationType = OCSUtil.getFromObject(configuration, ['type'], '');
          _selectedInstruments[requestIndex][configurationIndex] = {
            selectedInstrument: selectedInstrument,
            selectedInstrumentCategory: OCSUtil.getFromObject(this.instruments, [selectedInstrument, 'type'], ''),
            configurationType: OCSUtil.getFromObject(configuration, ['type'], '')
          };
        }
      }
      return _selectedInstruments;
    }
  },
  created: function() {
    // Get instruments
    $.ajax({
      url: `${this.observationPortalApiUrl}/api/instruments/`
    }).done(data => {
      this.instruments = this.parseInstrumentsForForm(data);
    });
    // Get existing requestGroup to initial data
    let requestGroupId = this.getRequestGroupIdFromQueryString();
    if (requestGroupId > 0) {
      this.loadFromExistingRequestGroup(requestGroupId);
    }
  },
  methods: {
    getRequestGroupIdFromQueryString: function() {
      let requestGroupId = -1;
      if (this.$route.query.requestgroupid) {
        let parsedRequestGroupId = _.parseInt(this.$route.query.requestgroupid);
        if (!_.isNaN(parsedRequestGroupId)) {
          requestGroupId = parsedRequestGroupId;
        }
      }
      return requestGroupId;
    },
    loadDraft: function(draftId) {
      this.draftId = draftId;
      this.tab = 1;
      $.ajax({
        url: `${this.observationPortalApiUrl}/api/drafts/${draftId}/`
      })
        .done(response => {
          this.requestGroup = {};
          Vue.nextTick(() => {
            this.requestGroup = JSON.parse(response.content);
            this.draftId = draftId;
          });
        })
        .fail(() => {
          this.alerts.push({ class: 'danger', msg: `Failed to load draft ${draftId}` });
        });
    },
    loadFromExistingRequestGroup: function(requestGroupId) {
      $.ajax({
        url: `${this.observationPortalApiUrl}/api/requestgroups/${requestGroupId}/`
      })
        .done(response => {
          this.requestGroup.requests = [];
          Vue.nextTick(() => {
            this.requestGroup.requests = response.requests;
          });
        })
        .fail(() => {
          this.alerts.push({ class: 'danger', msg: `Failed to load requestgroup ${requestGroupId}` });
        });
    },
    closeEdPopup: function() {
      localStorage.setItem('hasVisited', 'true');
    },
    parseInstrumentsForForm: function(instrumentsData) {
      // Update instrument data, returning only the instruments / instrument data that should be used in for form

      // Leave out instruments that we don't want to show on the form
      let instrumentsToDelete = [];
      for (let instrument in instrumentsData) {
        let isCommissioning = instrument.includes('COMMISSIONING');
        let isSimpleInterfaceAndNotImager = this.simpleInterface && instrumentsData[instrument].type !== 'IMAGE';
        let isExcludedInstrument = ['0M4-SCICAM-FLI', '2M0-SPECTRAL-AG'].indexOf(instrument) > -1;
        if (isCommissioning || isSimpleInterfaceAndNotImager || isExcludedInstrument) {
          instrumentsToDelete.push(instrument);
        }
      }
      for (let key of instrumentsToDelete) {
        delete instrumentsData[key];
      }

      // Update some instrument data for the simple interface
      if (this.simpleInterface) {
        for (let instrument in instrumentsData) {
          // Do not have any acquisition modes other than 'OFF' for the simple interface
          let acquisitionModes = _.get(instrumentsData[instrument], ['modes', 'acquisition', 'modes'], []);
          _.remove(acquisitionModes, mode => {
            return mode.code !== 'OFF';
          });
          _.set(instrumentsData, ['modes', 'acquisition', 'modes'], acquisitionModes);
          _.set(instrumentsData, ['modes', 'acquisition', 'default'], 'OFF');

          // Only show simple filters for the simple interface
          instrumentsData[instrument].optical_elements = {
            filters: [
              {
                name: 'Blue',
                code: 'b',
                schedulable: true,
                default: true
              },
              {
                name: 'Green',
                code: 'v',
                schedulable: true,
                default: false
              },
              {
                name: 'Red',
                code: 'rp',
                schedulable: true,
                default: false
              }
            ]
          };
        }
      }

      // Only display certain configuration types in the form
      let formConfigurationTypes;
      if (this.simpleInterface) {
        formConfigurationTypes = ['EXPOSE'];
      } else {
        formConfigurationTypes = [
          'EXPOSE',
          'REPEAT_EXPOSE',
          'ARC',
          'LAMP_FLAT',
          'REPEAT_SPECTRUM',
          'SPECTRUM',
          'REPEAT_NRES_SPECTRUM',
          'NRES_SPECTRUM'
        ];
      }
      for (let instrument in instrumentsData) {
        let configurationTypesToDelete = [];
        for (let configurationType in instrumentsData[instrument].configuration_types) {
          if (formConfigurationTypes.indexOf(configurationType) < 0) {
            configurationTypesToDelete.push(configurationType);
          }
        }
        for (let key of configurationTypesToDelete) {
          delete instrumentsData[instrument].configuration_types[key];
        }
      }
      return instrumentsData;
    },
    onSaveDraftFailed: function(errorMessage) {
      if (!errorMessage) {
        errorMessage = 'An unexpected error occured while saving draft, please wait a moment and try again.';
      }
      this.alerts.push({ class: 'danger', msg: errorMessage });
    },
    onSaveDraftSucceeded: function(draftId) {
      this.alerts.push({ class: 'success', msg: 'Draft id: ' + draftId + ' saved successfully' });
    },
    onRequestGroupSaved: function(requestGroupId) {
      this.$router.push({ name: 'requestgroupDetail', params: { id: requestGroupId } });
    },
    doTargetLookup: _.debounce(function(target) {
      this.targetLookup.busy = true;
      this.targetLookup.failed = false;
      this.targetLookup.text = 'Searching for coordinates...';
      if (this.targetLookup.request) {
        this.targetLookup.request.abort();
      }
      let target_type = 'SIDEREAL';
      if (target.type === 'ORBITAL_ELEMENTS') {
        target_type = 'NON_SIDEREAL';
      }
      this.targetLookup.request = $.getJSON(
        this.simbadServiceUrl +
          '/' +
          encodeURIComponent(target.name) +
          '?target_type=' +
          encodeURIComponent(target_type) +
          '&scheme=' +
          encodeURIComponent(target.scheme)
      )
        .done(data => {
          if (_.get(data, ['error'], null) === null) {
            target.ra = _.get(data, ['ra_d'], null);
            target.dec = _.get(data, ['dec_d'], null);
            target.proper_motion_ra = _.get(data, ['pmra'], null);
            target.proper_motion_dec = _.get(data, ['pmdec'], null);
            target.parallax = _.get(data, ['plx_value'], null);
            target.epochofel = julianToModifiedJulian(_.get(data, ['epoch_jd'], null));
            target.orbinc = _.get(data, ['inclination'], null);
            target.longascnode = _.get(data, ['ascending_node'], null);
            target.argofperih = _.get(data, ['argument_of_perihelion'], null);
            target.eccentricity = _.get(data, ['eccentricity'], null);
            target.perihdist = _.get(data, ['perihelion_distance'], null);
            target.epochofperih = julianToModifiedJulian(_.get(data, ['perihelion_date_jd'], null));
            target.meandist = _.get(data, ['semimajor_axis'], null);
            target.meananom = _.get(data, ['mean_anomaly'], null);
            target.dailymot = _.get(data, ['mean_daily_motion'], null);
          } else {
            this.targetLookup.text = 'Could not find any matching objects';
            this.targetLookup.failed = true;
          }
        })
        .fail((_response, status) => {
          if (status !== 'abort') {
            this.targetLookup.text = 'Could not find any matching objects';
            this.targetLookup.failed = true;
          }
        })
        .always((_response, status) => {
          if (status !== 'abort') {
            this.targetLookup.busy = false;
          }
        });
    }, 500),
    generateCalibs: function(configurationIndex, requestIndex) {
      let request = this.requestGroup.requests[requestIndex];
      let calibs = [{}, {}, {}, {}];
      for (let c in calibs) {
        calibs[c] = _.cloneDeep(request.configurations[configurationIndex]);
        for (let ic in calibs[c].instrument_configs) {
          calibs[c].instrument_configs[ic].exposure_time = arcDefaultExposureTime(this.instrument_type);
        }
      }
      calibs[0].type = 'LAMP_FLAT';
      calibs[1].type = 'ARC';
      calibs[0].guiding_config.optional = true;
      calibs[1].guiding_config.optional = true;
      calibs[0].guiding_config.mode = 'ON';
      calibs[1].guiding_config.mode = 'ON';
      for (let ic in calibs[0].instrument_configs) {
        calibs[0].instrument_configs[ic].exposure_time = lampFlatDefaultExposureTime(
          calibs[0].instrument_configs[ic].optical_elements.slit,
          this.instrument_type,
          calibs[0].instrument_configs[ic].mode
        );
      }
      request.configurations.unshift(calibs[0], calibs[1]);
      calibs[2].type = 'ARC';
      calibs[3].type = 'LAMP_FLAT';
      calibs[2].guiding_config.optional = true;
      calibs[3].guiding_config.optional = true;
      calibs[2].guiding_config.mode = 'ON';
      calibs[3].guiding_config.mode = 'ON';
      for (let ic in calibs[3].instrument_configs) {
        calibs[3].instrument_configs[ic].exposure_time = lampFlatDefaultExposureTime(
          calibs[3].instrument_configs[ic].optical_elements.slit,
          this.instrument_type,
          calibs[3].instrument_configs[ic].mode
        );
      }
      request.configurations.push(calibs[2], calibs[3]);
    }
  }
};
</script>
