<template>
    <v-card class="ma-2"
      ><v-card-title>Area where we are trying to find the available CO<sub>2</sub>/m<sup>2</sup></v-card-title
      ><v-card-text>
        <v-list dense>
          <v-list-item
            is="Inputs"
            v-for="item in inputsList"
            v-bind:key="item.id"
            v-bind:name="item.name"
            v-bind:value="item.value"
            v-bind:percentage="Math.round((100 * item.value) / allowance)"
            v-bind:units="item.units"
            v-on:change="changeinput(item, $event)"
          />
        </v-list>
        <v-row><v-divider/></v-row>
        <v-row>
          Structure allowance for this sector of the development: {{ subAllowance }} kgeCO2/m2</v-row
        >
        <v-row>
          Total rate for this sector of the development: {{ allowance }} kgeCO2/m2
        </v-row>
      </v-card-text></v-card
    >
</template>

<script>
import Inputs from "./Inputs.vue";
export default {
  name: "UnknownDevelopment",
  components: {
    Inputs
  },
  props: {
    name: String,
    allowance: Number
  },
  data: function() {
    return {
      inputsList: [
        { name: "GIA", value: 0, units: "m<sup>2</sup>" },
        { name: "NIA", value: 0, units: "m<sup>2</sup>" },
        { name: "MEP", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "InternalFinishes", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "Facade", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "A4", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "A5", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "B15", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "B6", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "C14", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" }
      ],
      total: 0
    };
  },
  computed: {
    subAllowance: function() {
      this.$emit("update-areatotal", this.inputsList);
      var total = 0;
      for (var i = 2; i < 10; i++) {
        total = total + this.inputsList[i].value;
      }
      return this.allowance - total;
    }
  },
  methods: {
    changeinput: function(item, $event) {
      item.value = $event;
    }
  }
};
</script>
