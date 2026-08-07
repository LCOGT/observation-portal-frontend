<template>
  <div>
    <div id="archive-table-toolbar">
      <b-button variant="outline-secondary" class="mr-1" @click="downloadSelected"> <i class="fa fa-check" /> Download Selected </b-button>
      <b-button variant="outline-secondary" class="mr-1" @click="downloadAll"> <i class="fa fa-download" /> Download All </b-button>
      <b-link :href="archiveLink" target="_blank" class="btn btn-outline-secondary"> <i class="fa fa-arrow-right" /> View on Archive </b-link>
    </div>
    <table id="archive-table" class="table-sm table-responsive" />
  </div>
</template>
<script>
import 'bootstrap-table';
import $ from 'jquery';
import { OCSUtil } from 'ocs-component-lib';

import { downloadAll, downloadZip } from '@/archive.js';

export default {
  props: {
    requestid: {
      type: Number,
      required: true
    }
  },
  computed: {
    archiveApiUrl: function() {
      return this.$store.state.urls.archiveApi;
    },
    archiveClientUrl: function() {
      return this.$store.state.urls.archiveClient;
    },
    archiveLink: function() {
      return this.archiveClientUrl + '/?request_id=' + this.requestid + '&start=2014-01-01&public=true';
    }
  },
  watch: {
    requestid: function() {
      this.refreshTable();
    }
  },
  mounted: function() {
    let that = this;
    $('#archive-table').bootstrapTable({
      url: null,
      responseHandler: function(res) {
        console.log('Archive table response: ', res);
        if (res.count > 1000) {
          alert('More than 1000 results found, please view on archive to view all data');
        }
        that.$store.commit('setFramesForRequest', {
          requestId: that.requestid,
          count: res.count,
          frames: res.results
        });
        that.$emit('dataLoaded', res.results);
        $('.fixed-table-loading').hide();
        return res.results;
      },
      onClickRow: function(row) {
        that.$emit('rowClicked', row);
      },
      formatNoMatches: function() {
        return 'No data available.';
      },
      queryParamsType: '',
      idField: 'id',
      pagination: true,
      pageList: '[10, 25, 100, All]',
      pageSize: 10,
      buttonsClass: 'outline-secondary',
      classes: 'table table-hover',
      sortName: 'filename',
      sortOrder: 'asc',
      maintainMetaData: true,
      checkboxHeader: true,
      toolbar: '#archive-table-toolbar',
      columns: [
        {
          field: 'state',
          title: '',
          checkbox: true
        },
        {
          field: 'filename',
          title: 'filename',
          sortable: 'true'
        },
        {
          field: 'observation_date',
          title: 'DATE_OBS',
          sortable: 'true',
          formatter: function(value) {
            console.log('DATE_OBS value: ', value);
            return OCSUtil.formatDate(value);
          }
        },
        {
          field: 'primary_optical_element',
          title: 'filter',
          sortable: 'true'
        },
        {
          field: 'configuration_type',
          title: 'obstype',
          sortable: 'true'
        },
        {
          field: 'reduction_level',
          title: 'Reduction',
          sortable: 'true',
          formatter: function(value) {
            let reductionString = value === 0 ? 'raw' : 'reduced';
            return reductionString;
          }
        }
      ]
    });
    this.$store.dispatch('getProfileData').then(() => {
      that.refreshTable();
    });
  },
  methods: {
    downloadSelected: function() {
      let frameIds = [];
      let selections = $('#archive-table').bootstrapTable('getSelections');
      if (selections.length == 0) {
        alert('Please select at least one frame to download');
        return;
      }
      for (let i = 0; i < selections.length; i++) {
        frameIds.push(selections[i].id);
      }
      downloadZip(frameIds, this.archiveApiUrl, this.$store.state.profile.tokens.api_token);
    },
    downloadAll: function() {
      downloadAll(this.requestid, this.archiveApiUrl, this.archiveClientUrl, this.$store.state.profile.tokens.api_token);
    },
    refreshTable: function() {
      if (this.requestid) {
        let that = this;
        let requestId = this.requestid;
        $('#archive-table').bootstrapTable('showLoading');
        this.$store.dispatch('getFramesForRequest', requestId).then(function(frames) {
          let count = that.$store.state.thumbnails.frameCountsByRequestId[String(requestId)];
          console.log('count: ', count);
          if (count > 1000) {
            alert('More than 1000 results found, please view on archive to view all data');
          }
          $('#archive-table').bootstrapTable('load', frames);
          that.$emit('dataLoaded', frames);
          $('#archive-table').bootstrapTable('hideLoading');
        });
      }
    }
  }
};
</script>
<style scoped>
#archive-table > tbody > tr {
  cursor: pointer;
}
#archive-table-toolbar {
  padding-bottom: 0.1em;
}
</style>
