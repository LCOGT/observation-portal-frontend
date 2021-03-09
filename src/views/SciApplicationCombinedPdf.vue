<template>
  <ocs-data-loader :data-loaded="dataLoaded" :data-load-error="dataLoadError" :data-not-found="dataNotFound">
    <template v-slot:not-found>
      <not-found />
    </template>
    <iframe id="combined-pdf" style="position:absolute; left: 0; top: 0; border: none;" width="100%" height="100%" type="application/pdf" />
    <b-embed type="iframe" height="0" width="0" style="border: none;">
      <sci-application-detail-template id="pdf-content" :sci-app="data" is-combined-pdf></sci-application-detail-template>
    </b-embed>
  </ocs-data-loader>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';
import Vue from 'vue';
import { PDFDocument } from 'pdf-lib';
import html2pdf from 'html2pdf.js';
import { OCSMixin } from 'ocs-component-lib';

import SciApplicationDetailTemplate from '@/components/SciApplicationDetailTemplate.vue';
import NotFound from '@/components/NotFound.vue';

export default {
  components: {
    SciApplicationDetailTemplate,
    NotFound
  },
  mixins: [OCSMixin.getDataMixin],
  props: {
    sciAppId: {
      type: [String, Number],
      required: true
    }
  },
  data: function() {
    return {
      finishedMounting: false,
      combinedPdfGenerationFailed: {
        message: '',
        failed: false
      }
    };
  },
  computed: {
    readyToGeneratePdf: function() {
      return this.finishedMounting && this.dataLoaded;
    }
  },
  watch: {
    readyToGeneratePdf: function(value) {
      if (value) {
        let that = this;
        Vue.nextTick(function() {
          try {
            if (that.data.pdf) {
              that.createCombinedPdfFromUploadedAndHtml(that.data.pdf);
            } else {
              that.createCombinedPdfFromOnlyHtml();
            }
          } catch (err) {
            that.combinedPdfGenerationFailed = { message: 'There was an error generating your pdf.', failed: true };
          }
        });
      }
    },
    dataNotFound: function(value) {
      if (value) {
        this.$store.commit('addMessage', { text: 'PDF generation failed - science application not found.', variant: 'warning' });
        this.$router.push({ name: 'apply', params: { persistMessage: true } });
      }
    },
    dataLoadError: function(value) {
      if (value) {
        this.$store.commit('addMessage', {
          text: 'PDF generation failed - failed to load science application. Please try again.',
          variant: 'warning'
        });
        this.$router.push({ name: 'apply', params: { persistMessage: true } });
      }
    },
    combinedPdfGenerationFailed: function(value) {
      if (value.failed) {
        this.$store.commit('addMessage', { text: value.message, variant: 'danger' });
        this.$router.push({ name: 'apply', params: { persistMessage: true } });
      }
    }
  },
  mounted: function() {
    this.finishedMounting = true;
  },
  methods: {
    initializeDataEndpoint: function() {
      return this.$store.state.urls.observationPortalApi + '/api/scienceapplications/' + this.sciAppId + '/';
    },
    createCombinedPdf: function(uploadedPdfArrayBuffer) {
      var options = {
        margin: 2.5,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2
        },
        jsPDF: {
          unit: 'cm',
          format: 'letter',
          orientation: 'portrait'
        }
      };
      let that = this;
      html2pdf()
        .set(options)
        .from(document.getElementById('pdf-content'))
        .outputPdf('arraybuffer')
        .then(function(data) {
          that.compileAndMountCombinedPdf(data, uploadedPdfArrayBuffer);
        });
    },
    createCombinedPdfFromOnlyHtml: function() {
      this.createCombinedPdf();
    },
    createCombinedPdfFromUploadedAndHtml: function(uploadedPdfUrl) {
      let that = this;
      $.ajax({
        url: uploadedPdfUrl,
        method: 'GET',
        xhr: function() {
          let xhrObj = new XMLHttpRequest();
          xhrObj.responseType = 'arraybuffer';
          return xhrObj;
        }
      })
        .done(function(response) {
          that.createCombinedPdf(response);
        })
        .fail(function() {
          this.combinedPdfGenerationFailed = {
            message: 'There was an error generating your pdf. There was an error getting your uploaded pdf. Please try again.',
            failed: true
          };
        });
    },
    mergePdf: async function(pdfDoc, newPdfArrayBuffer) {
      // Append the data in `newPdfArrayBuffer` onto pdfDoc
      const pdfDocToAdd = await PDFDocument.load(newPdfArrayBuffer);
      const pageIndices = _.range(pdfDocToAdd.getPageCount());
      const newPages = await pdfDoc.copyPages(pdfDocToAdd, pageIndices);
      for (let page of newPages) {
        pdfDoc.addPage(page);
      }
    },
    compileAndMountCombinedPdf: async function(appDetailArrayBuffer, uploadedPdfArrayBuffer) {
      const pdfDoc = await PDFDocument.create();
      await this.mergePdf(pdfDoc, appDetailArrayBuffer);
      // There might not be an uploaded pdf
      if (uploadedPdfArrayBuffer) {
        await this.mergePdf(pdfDoc, uploadedPdfArrayBuffer);
      }
      pdfDoc.setTitle(_.get(this.data, 'title', 'Science Application PDF'));
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      document.getElementById('combined-pdf').src = blobUrl;
    }
  }
};
</script>
