<template>
  <b-container class="contention my-4">
    <b-row>
      <b-col cols="auto" class="p-0 pb-1">
        <b-form-group
          id="contention-instrument-formgroup"
          class="my-auto"
          label="Instrument"
          label-size="sm"
          label-align-sm="right"
          label-cols-sm="5"
          label-for="instrument"
          label-class="font-weight-bolder"
        >
          <b-form-select id="contention-instrument-select" v-model="instrument" size="sm" field="instrument" :options="instruments" />
        </b-form-group>
      </b-col>
      <b-col>
        <data-load-help :data-available="dataAvailable" :loading-data-failed="loadingDataFailed" :is-loading="isLoading" />
      </b-col>
    </b-row>
    <canvas id="contentionplot" width="400" height="200" />
  </b-container>
</template>
<script>
import Chart from 'chart.js';
import $ from 'jquery';

import DataLoadHelp from '@/components/util/DataLoadHelp.vue';
import { colorPalette } from '@/utils.js';

export default {
  name: 'Contention',
  components: {
    DataLoadHelp
  },
  props: {
    instruments: {
      type: Array,
      required: true,
      description: 'Array of objects with value and text fields, used for instrument select field'
    }
  },
  data: function() {
    return {
      loadingDataFailed: false,
      isLoading: false,
      runningQuery: null,
      instrument: '',
      rawData: [],
      data: {
        labels: Array.apply(null, { length: 24 }).map(Number.call, Number),
        datasets: []
      }
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    toChartData: function() {
      let datasets = {};
      for (let ra = 0; ra < this.rawData.length; ra++) {
        for (let proposal in this.rawData[ra]) {
          if (!Object.prototype.hasOwnProperty.call(datasets, proposal)) {
            datasets[proposal] = Array.apply(null, Array(24)).map(Number.prototype.valueOf, 0); // fills array with 0s
          }
          datasets[proposal][ra] = this.rawData[ra][proposal] / 3600;
        }
      }
      let grouped = [];
      let color = 0;
      for (let prop in datasets) {
        grouped.push({ label: prop, data: datasets[prop], backgroundColor: colorPalette[color] });
        color++;
      }
      return grouped;
    },
    dataAvailable: function() {
      for (let bin in this.rawData) {
        for (let proposal in this.rawData[bin]) {
          if (this.rawData[bin][proposal] > 0) {
            return true;
          }
        }
      }
      return false;
    }
  },
  watch: {
    instrument: function(instrument) {
      if (this.runningQuery) {
        this.runningQuery.abort();
      }
      this.rawData = [];
      this.isLoading = true;
      let that = this;
      this.runningQuery = $.getJSON(this.observationPortalApiUrl + '/api/contention/' + instrument + '/', function(data) {
        that.rawData = data.contention_data;
        that.data.datasets = that.toChartData;
        that.chart.update();
      })
        .done(function() {
          that.loadingDataFailed = false;
          that.runningQuery = null;
        })
        .fail(function(res, textStatus) {
          if (textStatus !== 'abort') {
            that.loadingDataFailed = true;
          }
        })
        .always(function(res, textStatus) {
          if (textStatus !== 'abort') {
            that.isLoading = false;
          } else {
            that.runningQuery = null;
          }
        });
    }
  },
  created: function() {
    this.instrument = '1M0-SCICAM-SINISTRO';
  },
  mounted: function() {
    let that = this;
    let ctx = document.getElementById('contentionplot');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: that.data,
      options: {
        scales: {
          xAxes: [
            {
              stacked: true,
              scaleLabel: {
                display: true,
                labelString: 'Right Ascension'
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              scaleLabel: {
                display: true,
                labelString: 'Total Requested Hours'
              }
            }
          ]
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem) {
              return that.data.datasets[tooltipItem.datasetIndex].label + ' ' + tooltipItem.yLabel.toFixed(3);
            }
          }
        }
      }
    });
  }
};
</script>
