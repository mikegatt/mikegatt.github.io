<template>
    <v-row>
      <v-col><v-text-field dense v-model.number="value" v-on:input="$emit('change', value)" placeholder="100">
        <template v-slot:label><div style="display: inline" v-if="units == 'kgeCO<sub>2</sub>/m<sup>2</sup>'">CO<sub>2</sub>/m<sup>2</sup> for </div>{{name}}</template>
        <template v-slot:append><div style="display: inline" v-html="units"></div></template>
        </v-text-field></v-col>
      <v-col>
        <div style="display: inline" v-if="units == 'kgeCO<sub>2</sub>/m<sup>2</sup>'">({{ percentage }}%)</div>
      </v-col>
    </v-row>

</template>

<script>
export default {
  name: "Inputs",
  props: {
    name: String,
    units: String,
    percentage: Number
  },
  data: function() {
    return {
      value: 0
    };
  }
};
</script>
