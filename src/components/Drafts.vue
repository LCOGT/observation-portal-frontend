<template>
  <div>
    <b-table
      id="my-table"
      striped
      hover
      :per-page="perPage"
      :current-page="currentPage"
      :fields="fields"
      :items="items"
      :show-empty="tableIsEmpty"
      empty-text="You have no draft observation requests"
    >
      <template v-slot:cell(load)="data">
        <b-button variant="primary" size="sm" @click="loadDraft(data.value)">
          <i class="fa fa-download" />
        </b-button>
      </template>
      <template v-slot:cell(delete)="data">
        <b-button variant="danger" size="sm" @click="deleteDraft(data.value)">
          <i class="fa fa-trash" />
        </b-button>
      </template>
    </b-table>
    <b-pagination v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" align="center" size="sm" />
  </div>
</template>
<script>
import $ from 'jquery';
import { OCSUtil } from 'ocs-component-lib';

export default {
  name: 'Drafts',
  props: {
    tab: {
      type: Number,
      required: true
    }
  },
  data: function() {
    return {
      currentPage: 1,
      perPage: 20,
      drafts: [],
      fields: [
        {
          key: 'load',
          class: 'text-center'
        },
        'id',
        'title',
        'author',
        'proposal',
        'modified_time',
        {
          key: 'delete',
          class: 'text-center'
        }
      ]
    };
  },
  computed: {
    observationPortalApiUrl: function() {
      return this.$store.state.urls.observationPortalApi;
    },
    items: function() {
      let items = [];
      for (let i in this.drafts) {
        items.push({
          load: this.drafts[i].id,
          title: this.drafts[i].title,
          id: this.drafts[i].id,
          author: this.drafts[i].author,
          proposal: this.drafts[i].proposal,
          modified_time: OCSUtil.formatDate(this.drafts[i].modified),
          delete: this.drafts[i].id
        });
      }
      return items;
    },
    tableIsEmpty: function() {
      return this.items.length < 1;
    },
    rows: function() {
      return this.items.length;
    }
  },
  watch: {
    tab: function(value) {
      if (value === 3) this.fetchDrafts();
    }
  },
  methods: {
    fetchDrafts: function() {
      let that = this;
      $.getJSON(this.observationPortalApiUrl + '/api/drafts/?limit=100', function(data) {
        that.drafts = data.results;
      });
    },
    loadDraft: function(id) {
      this.$emit('loaddraft', id);
    },
    deleteDraft: function(id) {
      if (confirm('Are you sure you want to delete this draft?')) {
        let that = this;
        $.ajax({
          type: 'DELETE',
          url: this.observationPortalApiUrl + '/api/drafts/' + id + '/'
        }).done(function() {
          that.fetchDrafts();
        });
      }
    }
  }
};
</script>
