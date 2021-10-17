<template>
  <v-container>
    <v-row>
      <h2>Refurb CO<sub>2</sub> finder</h2></v-row
    >
    <v-row>This app is for when we have areas of a development where we know the actual CO2/m2 composition (e.g. refurbished areas), an overall target CO2/m2 for the development and an area where we need to know the allowance for the structure. Add known areas by typing in a name and clicking 'add me'. Fill in the known information to find out the allowance for the new structure.</v-row>
    <v-row justify="space-around">
      <v-card class="ma-2">
        <v-card-title>Overall controls</v-card-title>
        <v-card-text>
          <v-row
            ><v-col><v-text-field label="Area name" v-model="areaName" placeholder="a resi development"/></v-col>
            <v-spacer/><v-col><v-btn v-on:click="addArea">Add me</v-btn></v-col></v-row
          >
          <v-row>
            <v-col>
              <v-text-field label="Overall development target" v-model.number="developmentTarget" placeholder="500"
                ><template v-slot:append><div style="display: inline" >kgeCO<sub>2</sub>/m<sup>2</sup></div></template></v-text-field
              >
            </v-col></v-row
          >
        </v-card-text></v-card
      >
    </v-row>
    <v-row justify="space-around"> <UnknownDevelopment v-bind:allowance="this.allowableTarget" v-on:update-areatotal="updatearea($event)"/></v-row>

    <v-row><h3>Areas with known embodied carbon:</h3></v-row>
    <v-row>
      <v-list>
        <v-list-item
          is="KnownDevelopment"
          v-for="item in arealist"
          v-bind:key="item.id"
          v-bind:id="item.id"
          v-bind:name="item.name"
          v-on:remove="remove(item)"
          v-on:update-ratetotal="update($event)"
        /> </v-list
    ></v-row>
  </v-container>
</template>

<script>
import KnownDevelopment from "./KnownDevelopment.vue";
import UnknownDevelopment from "./UnknownDevelopment.vue";

export default {
  name: "RefurbCO2",
  components: {
    UnknownDevelopment,
    KnownDevelopment
  },
  data: function() {
    return {
      arealist: [],
      areaNext: 0,
      areaName: "",
      developmentTarget: 0,
      allowableTarget: 0,
      allowableGIA: 300,
      allowableNIA: 325,
      index: 0
    };
  },
  methods: {
    addArea: function() {
      this.arealist.push({
        id: this.areaNext++,
        name: this.areaName,
        GIA: 0,
        NIA: 0,
        totalRate: 0
      });
    },
    update: function(event) {
      for (let i = 0; i < this.arealist.length; i++) {
        if (this.arealist[i].id == event[0]) {
          this.arealist[i].GIA = event[1];
          this.arealist[i].NIA = event[2];
          this.arealist[i].totalRate = event[3];
        }
      }

      var suma = 0;
      var sumb = 0;
      var arealistcopy = this.arealist.slice();

      arealistcopy.forEach(element => {
        suma += element.GIA;
        sumb += element.NIA * element.totalRate;
      });
      suma += this.allowableGIA;

      this.allowableTarget = Math.round((this.developmentTarget * suma - sumb) / this.allowableNIA);
    },
    updatearea: function(event) {
      this.allowableGIA = event[0].value;
      this.allowableNIA = event[1].value;
    },
    remove: function(item) {
      var arealistcopy = this.arealist.slice();
      for (var i = 0; i < arealistcopy.length; i++) {
        if (arealistcopy[i].id == item.id) {
          this.arealist.splice(i, 1);
        }
      }
    }
  }
};
</script>
