<template>
  <div>
    <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
      <template v-slot:not-found>
        <not-found />
      </template>
      <b-row>
        <b-col md="8">
          <b-form inline>
            <b-form-group id="input-group-semester" label="Semester" label-for="input-semester" class="mx-1">
              <b-form-select
                id="input-semester"
                v-model="selectedSemester"
                class="mx-1"
                :options="semesterOptions"
                @input="updateSemester"
              ></b-form-select>
            </b-form-group>
            <b-form-group id="input-group-completed" class="mx-1" label="Completed" label-for="input-completed" label-sr-only>
              <b-form-checkbox-group
                id="input-completed"
                v-model="completedCheckbox.selected"
                class="mx-1"
                :options="completedCheckbox.options"
                @input="filterCompleted"
              ></b-form-checkbox-group>
            </b-form-group>
          </b-form>
        </b-col>
        <b-col md="4">
          <b-form>
            <b-form-group label="Filter" label-sr-only>
              <b-input-group>
                <b-form-input v-model="filter" type="search" placeholder="Search"></b-form-input>
                <b-input-group-append>
                  <b-dropdown id="dropdown-export-table" right>
                    <template v-slot:button-content>
                      <i class="fa fa-fw fa-download" />
                    </template>
                    <b-dropdown-item @click="exportTable('json')">JSON</b-dropdown-item>
                    <b-dropdown-item @click="exportTable('xml')">XML</b-dropdown-item>
                    <b-dropdown-item @click="exportTable('csv')">CSV</b-dropdown-item>
                    <b-dropdown-item @click="exportTable('txt')">TXT</b-dropdown-item>
                    <b-dropdown-item @click="exportTable('sql')">SQL</b-dropdown-item>
                    <b-dropdown-item @click="exportTable('excel')">MS-Excel</b-dropdown-item>
                  </b-dropdown>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
      <b-table
        id="semester-admin-table"
        :items="data"
        :fields="fields"
        :filter="filter"
        striped
        show-empty
        responsive
        foot-clone
        no-footer-sorting
        @filtered="onFiltered"
      >
        <template v-slot:cell(proposal)="data">
          <router-link :to="{ name: 'proposalDetail', params: { id: data.item.proposal.id } }">
            {{ data.item.proposal.id }}
          </router-link>
        </template>
        <template v-slot:foot(proposal)>
          <span class="font-weight-bold">Total: {{ filteredTimeallocations.length }}</span>
        </template>
        <template v-slot:cell(pi)="data">
          <div v-for="(pi, idx) in data.item.proposal.pis" :key="pi.first_name + pi.last_name + idx">{{ pi.first_name }} {{ pi.last_name }}</div>
        </template>
        <template v-slot:cell(std_allocation)="data">
          {{ data.item.std_allocation | formatFloat(1) }}
        </template>
        <template v-slot:foot(std_allocation)>
          <span class="font-weight-bold">{{ sumFormatter('std_allocation') }}</span>
        </template>
        <template v-slot:cell(std_time_used)="data">
          {{ data.item.std_time_used | formatFloat(1) }}
        </template>
        <template v-slot:foot(std_time_used)>
          <span class="font-weight-bold">{{ sumFormatter('std_time_used') }}</span>
        </template>
        <template v-slot:cell(rr_allocation)="data">
          {{ data.item.rr_allocation | formatFloat(1) }}
        </template>
        <template v-slot:foot(rr_allocation)>
          <span class="font-weight-bold">{{ sumFormatter('rr_allocation') }}</span>
        </template>
        <template v-slot:cell(rr_time_used)="data">
          {{ data.item.rr_time_used | formatFloat(1) }}
        </template>
        <template v-slot:foot(rr_time_used)>
          <span class="font-weight-bold">{{ sumFormatter('rr_time_used') }}</span>
        </template>
        <template v-slot:cell(tc_allocation)="data">
          {{ data.item.tc_allocation | formatFloat(1) }}
        </template>
        <template v-slot:foot(tc_allocation)>
          <span class="font-weight-bold">{{ sumFormatter('tc_allocation') }}</span>
        </template>
        <template v-slot:cell(tc_time_used)="data">
          {{ data.item.tc_time_used | formatFloat(1) }}
        </template>
        <template v-slot:foot(tc_time_used)>
          <span class="font-weight-bold">{{ sumFormatter('tc_time_used') }}</span>
        </template>
        <template v-slot:cell(ipp_limit)="data">
          {{ data.item.ipp_limit | formatFloat(1) }}
        </template>
        <template v-slot:foot(ipp_limit)>
          <span class="font-weight-bold">{{ sumFormatter('ipp_limit') }}</span>
        </template>
        <template v-slot:cell(ipp_time_available)="data">
          {{ data.item.ipp_time_available | formatFloat(1) }}
        </template>
        <template v-slot:foot(ipp_time_available)>
          <span class="font-weight-bold">{{ sumFormatter('ipp_time_available') }}</span>
        </template>
        <template v-slot:foot()>
          <br />
        </template>
      </b-table>
    </ocs-data-loader>
    <!-- These are included for downloading the table data-->
    <script src="https://cdn.lco.global/script/tableExport.min.js" type="application/javascript"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js" type="application/javascript"></script>
  </div>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';
import { OCSUtil, OCSMixin } from 'ocs-component-lib';

import NotFound from '@/components/NotFound.vue';

export default {
  name: 'SemesterAdminTable',
  filters: {
    formatFloat: function(value, precision) {
      return OCSUtil.formatFloat(value, precision);
    }
  },
  components: {
    NotFound
  },
  mixins: [OCSMixin.getDataListMixin],
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: function() {
    let that = this;
    return {
      semesters: { count: 0, results: [] },
      selectedSemester: this.id,
      completedCheckbox: {
        options: [{ text: 'Completed', value: true }],
        selected: []
      },
      filter: null,
      filteredTimeallocations: [],
      fields: [
        {
          key: 'proposal',
          label: 'Proposal',
          sortable: true,
          sortByFormatted: true,
          formatter: function(value, key, item) {
            return item.proposal.id;
          }
        },
        {
          key: 'pi',
          label: 'PI',
          sortable: true,
          sortByFormatted: true,
          formatter: function(value, key, item) {
            return _.get(item.proposal, 'pis[0].first_name', '');
          }
        },
        {
          key: 'tac_priority',
          label: 'Priority',
          sortable: true,
          sortByFormatted: true,
          formatter: function(value, key, item) {
            return item.proposal.tac_priority;
          }
        },
        {
          key: 'instrument_type',
          label: 'Class',
          sortable: true
        },

        {
          key: 'std_allocation',
          label: 'Std Alloc',
          sortable: true
        },
        {
          key: 'std_time_used',
          label: 'Std Used',
          sortable: true,
          tdClass: function(value, key, item) {
            return that.getTdClass(item.std_allocation, item.std_time_used);
          }
        },
        {
          key: 'rr_allocation',
          label: 'RR Alloc',
          sortable: true
        },
        {
          key: 'rr_time_used',
          label: 'RR Used',
          sortable: true,
          tdClass: function(value, key, item) {
            return that.getTdClass(item.rr_allocation, item.rr_time_used);
          }
        },
        {
          key: 'tc_allocation',
          label: 'TC Alloc',
          sortable: true
        },
        {
          key: 'tc_time_used',
          label: 'TC Used',
          sortable: true,
          tdClass: function(value, key, item) {
            return that.getTdClass(item.tc_allocation, item.tc_time_used);
          }
        },
        {
          key: 'ipp_limit',
          label: 'IPP Limit',
          sortable: true
        },
        {
          key: 'ipp_time_available',
          label: 'IPP Available',
          sortable: true
        },
        {
          key: 'num_users',
          label: '# Users',
          sortable: true,
          sortByFormatted: true,
          filterByFormatted: true,
          formatter: function(value, key, item) {
            return item.proposal.num_users;
          }
        },
        {
          key: 'notes',
          tdClass: 'proposal-notes-cell',
          formatter: function(value, key, item) {
            return item.proposal.notes;
          }
        },
        {
          key: 'completed',
          tdClass: 'd-none',
          thClass: 'd-none',
          filterByFormatted: true,
          formatter: function(value, key, item) {
            if (
              (item.rr_allocation > 0 && item.rr_time_used >= item.rr_allocation) ||
              (item.std_allocation > 0 && item.std_time_used >= item.std_allocation) ||
              (item.tc_allocation > 0 && item.tc_time_used >= item.tc_allocation)
            ) {
              return 'isComplete';
            } else {
              return '';
            }
          }
        }
      ]
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    semesterOptions: function() {
      let options = [{ value: '', text: '' }];
      for (let semester of this.semesters.results) {
        options.push({ value: semester.id, text: semester.id });
      }
      return options;
    }
  },
  watch: {
    $route: function() {
      this.setDataEndpoint(this.generateDataEndpoint());
      this.getData();
      this.selectedSemester = this.id;
    },
    data: function(newTimeallocations) {
      this.filter = '';
      this.completedCheckbox.selected = [];
      this.filteredTimeallocations = newTimeallocations;
    }
  },
  created: function() {
    this.getSemesters();
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + this.generateDataEndpoint();
    },
    generateDataEndpoint: function() {
      return '/api/semesters/' + this.id + '/timeallocations/';
    },
    sumFormatter: function(field) {
      let data = _.map(this.filteredTimeallocations, field);
      return OCSUtil.formatFloat(_.sum(data), 3);
    },
    getTdClass: function(allocation, used) {
      return allocation > 0 && used >= allocation ? 'bg-danger' : '';
    },
    getSemesters: function() {
      let that = this;
      $.ajax({
        url: this.observationPortalApiUrl + '/api/semesters/?limit=100'
      }).done(function(response) {
        that.semesters = response;
      });
    },
    updateSemester: function(value) {
      this.$router.push({ name: 'semesterAdminTable', params: { id: value } });
    },
    onFiltered(filteredItems) {
      this.filteredTimeallocations = filteredItems;
    },
    filterCompleted: function(value) {
      if (value.length === 0) {
        this.filter = '';
      } else {
        this.filter = 'isComplete';
      }
    },
    exportTable: function(type) {
      $('#semester-admin-table').tableExport({
        type: type,
        onCellHtmlData(cell, rowIndex, colIndex, htmlData) {
          if (cell.is('th')) {
            return cell.find('div').text();
          }
          return htmlData;
        },
        exportFooter: false,
        tfootSelector: ''
      });
    }
  }
};
</script>
<style>
#semester-admin-table {
  font-family: monospace;
  font-size: 12px;
}
.proposal-notes-cell {
  min-width: 300px;
  max-width: 300px;
}
</style>
