<template
  ><v-card class="ma-2">
    <v-card-title> {{ name }}</v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <v-list dense
            ><v-list-item
              is="Inputs"
              v-for="item in inputsList"
              v-bind:key="item.id"
              v-bind:name="item.name"
              v-bind:value="item.value"
              v-bind:percentage="Math.round((100 * item.value) / totalRate)"
              v-bind:units="item.units"
              v-on:change="item.value = $event"
            /> </v-list
          ><v-divider></v-divider> Total Rate for this sector of the development: {{ totalRate }} kgeCO<sub>2</sub>/m<sup>2</sup>
        </v-col>
        <v-col>
          <div class="chart"><vc-donut :sections="computedStuff" :total="totalRate" has-legend legend-placement="bottom">% split</vc-donut></div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions><v-btn text v-on:click="$emit('remove')">Remove this sector</v-btn></v-card-actions></v-card
  >
</template>

<script>
import Inputs from "./Inputs.vue";
import Donut from "vue-css-donut-chart";
import "vue-css-donut-chart/dist/vcdonut.css";
import Vue from "vue";
Vue.use(Donut);
export default {
  name: "KnownDevelopment",
  components: {
    Inputs
  },
  props: {
    name: String,
    id: Number
  },
  data: function() {
    return {
      inputsList: [
        { name: "GIA", value: 0, units: "m<sup>2</sup>" },
        { name: "NIA", value: 0, units: "m<sup>2</sup>" },
        { name: "Substructure", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "Superstructure", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "MEP", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "InternalFinishes", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "Facade", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "A4", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "A5", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "B15", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "B6", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" },
        { name: "C14", value: 0, units: "kgeCO<sub>2</sub>/m<sup>2</sup>" }
      ],
      total: 0,
      myArray: []
    };
  },
  computed: {
    totalRate: function() {
      var total = 0;
      for (var i = 2; i < 12; i++) {
        total += this.inputsList[i].value;
      }
      this.$emit("update-ratetotal", [this.id, this.inputsList[0].value, this.inputsList[1].value, total]);
      return Number(total);
    },
    computedStuff: function() {
      var myArray = [];
      for (var i = 2; i < 10; i++) {
        myArray.push({ label: this.inputsList[i].name, value: this.inputsList[i].value });
      }
      return myArray;
    }
  }
};
</script>
