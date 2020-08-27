<template>
  <div>
    <div id="archive-table-toolbar">
      <b-button variant="outline-secondary" size="sm" @click="downloadSelected"> <i class="fa fa-check" /> Download Selected </b-button>
      <b-button variant="outline-secondary" size="sm" @click="downloadAll"> <i class="fa fa-download" /> Download All </b-button>
      <b-link :href="archiveLink" target="_blank" class="btn btn-sm btn-outline-secondary"> <i class="fa fa-arrow-right" /> View on Archive </b-link>
    </div>
    <table id="archive-table" class="table-sm" />
  </div>
</template>
<script>
import 'bootstrap-table';
import $ from 'jquery';
import { formatDate } from '@/utils.js';
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
    archiveToken: function() {
      return this.$store.state.archiveToken;
    },
    archiveLink: function() {
      return this.archiveClientUrl + '/?REQNUM=' + this.requestid + '&start=2014-01-01';
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
        if (res.count > 1000) {
          alert('More than 1000 results found, please view on archive to view all data');
        }
        that.$emit('dataLoaded', res.results);
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
          field: 'DATE_OBS',
          title: 'DATE_OBS',
          sortable: 'true',
          formatter: function(value) {
            return formatDate(value);
          }
        },
        {
          field: 'FILTER',
          title: 'filter',
          sortable: 'true'
        },
        {
          field: 'OBSTYPE',
          title: 'obstype',
          sortable: 'true'
        },
        {
          field: 'RLEVEL',
          title: 'Reduction',
          sortable: 'true',
          formatter: function(value) {
            switch (value) {
              case 0:
                return 'raw';
              case 11:
                return 'quicklook';
              case 91:
                return 'reduced';
            }
          }
        }
      ]
    });
    this.$store.dispatch('getArchiveToken').then(() => {
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
      downloadZip(frameIds, this.archiveApiUrl, this.archiveToken);
    },
    downloadAll: function() {
      downloadAll(this.requestid, this.archiveApiUrl, this.archiveClientUrl, this.archiveToken);
    },
    refreshTable: function() {
      if (this.requestid) {
        $('#archive-table').bootstrapTable('refresh', {
          url: this.archiveApiUrl + '/frames/?limit=1000&exclude_OBSTYPE=GUIDE&REQNUM=' + this.requestid
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
</style>
