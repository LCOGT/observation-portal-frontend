<template>
  <span>
    <b-form-group :id="field + '-fieldgroup'" :label-for="fieldId" :label="label" :label-sr-only="labelSrOnly">
      <b-form-textarea
        v-if="fieldType === 'textarea'"
        :id="fieldId"
        :value="value"
        :placeholder="placeholder"
        :state="validationState"
        :aria-describedby="helpId + ' ' + feedbackId"
        rows="8"
        @input="input($event)"
        @blur="blur($event)"
      ></b-form-textarea>
      <b-form-select
        v-else-if="fieldType === 'select'"
        :id="fieldId"
        :value="value"
        :state="validationState"
        :aria-describedby="helpId + ' ' + feedbackId"
        :options="options"
        @input="input($event)"
        @blur="blur($event)"
      ></b-form-select>
      <b-form-file
        v-else-if="fieldType === 'file'"
        :id="fieldId"
        :value="value"
        :state="validationState"
        :aria-describedby="helpId + ' ' + feedbackId"
        accept=".pdf, .PDF"
        @input="input($event)"
        @blur="blur($event)"
      ></b-form-file>
      <b-form-input
        v-else
        :id="fieldId"
        :value="value"
        :type="inputType"
        :state="validationState"
        :aria-describedby="helpId + ' ' + feedbackId"
        :placeholder="placeholder"
        @input="input($event)"
        @blur="blur($event)"
      ></b-form-input>
      <b-form-invalid-feedback :id="feedbackId">
        <span v-for="error in errors" :key="error" class="text-danger">
          {{ error }}
        </span>
      </b-form-invalid-feedback>
      <b-form-text :id="helpId">{{ helpText }}</b-form-text>
    </b-form-group>
  </span>
</template>
<script>
import _ from 'lodash';

export default {
  name: 'BasicCustomField',
  props: {
    fieldType: {
      validator: function(value) {
        return value === 'textarea' || value === 'select' || value === 'file' || value === 'input';
      },
      default: 'input'
    },
    options: {
      type: Array,
      default: function() {
        return [];
      }
    },
    value: {
      validator: function(value) {
        let result = value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'object';
        if (!result) {
          console.log(typeof value);
          console.log(value);
        }
        return value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'object';
      },
      required: true
    },
    label: {
      type: String,
      required: true
    },
    field: {
      type: String,
      default: function() {
        return _.kebabCase(this.label);
      }
    },
    placeholder: {
      type: String,
      default: ''
    },
    errors: {
      validator: function(value) {
        return value === null || typeof value === 'object';
      },
      default: function() {
        return null;
      }
    },
    helpText: {
      type: String,
      default: ''
    },
    inputType: {
      type: String,
      default: 'text'
    },
    labelSrOnly: {
      type: Boolean
    }
  },
  data: function() {
    return {
      fieldId: this.field + '-field',
      feedbackId: this.field + '-feedback',
      helpId: this.field + '-help'
    };
  },
  computed: {
    validationState: function() {
      if (this.errors === null) {
        // No validation displayed
        return null;
      } else if (!_.isEmpty(this.errors)) {
        return false;
      } else {
        return null;
      }
    }
  },
  methods: {
    input: function(value) {
      this.$emit('input', value);
    },
    blur: function(value) {
      this.$emit('blur', value);
    }
  }
};
</script>
