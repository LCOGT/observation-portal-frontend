<template>
  <panel :show="show"
    :id="'constraints' + $parent.$parent.$parent.index + $parent.index" 
    :errors="errors" 
    :canremove="false" 
    :cancopy="false" 
    icon="fas fa-lock" 
    title="Constraints" 
    @show="show = $event"
  >
    <custom-alert 
      v-for="error in errors.non_field_errors" 
      :key="error" 
      alertclass="danger" 
      :dismissible="false"
    >
      {{ error }}
    </custom-alert>
    <b-container class="p-0">
      <b-row>
        <b-col md="6" v-show="show">
          <ul>
            <li>
              Advice on
              <a href="https://lco.global/documentation/airmass-limit" target="_blank" >
                setting the airmass limit.
              </a>
            </li>
          </ul>
        </b-col>
        <b-col :md="show ? 6 : 12">
          <b-form>
            <custom-field 
              v-model="constraints.max_airmass" 
              label="Maximum Airmass" 
              field="max_airmass"
              :errors="errors.max_airmass" 
              desc="Maximum acceptable airmass at which the observation can be scheduled. A plane-parallel atmosphere is assumed."
              @input="update" 
            />
            <custom-field 
              v-model="constraints.min_lunar_distance" 
              label="Minimum Lunar Separation"
              field="min_lunar_distance" 
              :errors="errors.min_lunar_distance"
              desc="Minimum acceptable angular separation (degrees) between the target and the moon."
              @input="update" 
            />
          </b-form>
        </b-col>
      </b-row>
    </b-container>
  </panel>
</template>
<script>
  import { collapseMixin } from '@/utils.js';
  import Panel from '@/components/util/Panel.vue';
  import CustomAlert from '@/components/util/CustomAlert.vue';
  import CustomField from '@/components/util/CustomField.vue';

  export default {
    props: [
      'constraints', 
      'errors', 
      'parentshow'
    ],
    components: {
      CustomField, 
      Panel,
      CustomAlert
    },
    mixins: [
      collapseMixin
    ],
    data: function() {
      return {'show': true};
    },
    methods: {
      update: function(){
        this.$emit('constraintsupdate');
      }
    }
  };
</script>
