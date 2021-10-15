<template>
  <v-container>
    <v-row><h3>Structure properties</h3></v-row>
    <v-row>
      <v-col>Natural Frequency</v-col><v-col><v-text-field label="Natural Frequency" v-model.number="naturalFrequency" prefix = "f1=" suffix="Hz"></v-text-field> </v-col>
    </v-row>
    <v-row>
      <v-col>Damping Ratio</v-col><v-col><v-text-field label="Damping Ratio" v-model.number="dampingRatio" suffix="%"></v-text-field> </v-col>
    </v-row>
    <v-row>
      <v-col>Load (usually 0.8)</v-col><v-col><v-text-field label="Load" v-model.number="load" prefix="q=" suffix="kN/m2"></v-text-field> </v-col>
    </v-row>
    <v-row>
      <v-col>Number of jumpers</v-col
      ><v-col><v-select v-model="selfrequencyRange" :items="frequencyRange" item-text="name" return-object single-line></v-select></v-col>
    </v-row>
    <v-row>
      <v-col>Type of jumping</v-col
      ><v-col><v-select v-model="selfourierCoefficient" :items="fourierCoefficient" item-text="name" return-object single-line></v-select></v-col>
    </v-row>
    <v-row><h3>Calculated values</h3></v-row>
    <v-row
      ><v-col>Active Frequency</v-col><v-col>{{  Math.round(100*activeFrequency)/100 }}Hz</v-col></v-row
    >
    <v-row
      ><v-col>Beta</v-col><v-col>{{ Math.round(100*beta)/100 }}</v-col></v-row
    >
    <v-row
      ><v-col>Dynamic amplication factors</v-col><v-col>{{ dynamicampFactors }}</v-col></v-row
    >
    <v-row
      ><v-col>Fourier coefficients</v-col><v-col>{{ selfourierCoefficient.harmonic }}</v-col></v-row
    >
    <v-row
      ><v-col>Modified load</v-col><v-col>{{ Math.round(100*modLoad)/100 }} kN/m2</v-col></v-row
    >
  </v-container>
</template>

<script>
export default {
  name: "Vibration",

  data: () => ({
    naturalFrequency: 7.5,
    dampingRatio: 3,
    load: 0.8,
    frequencyRange: [
      { name: "Groups", lowBound: 1.5, upperBound: 2.8 },
      { name: "Individuals", lowBound: 1.5, upperBound: 3.5 }
    ],
    selfrequencyRange: {},
    fourierCoefficient: [
      {
        name: "Normal Jumping",
        harmonic: [9 / 5, 9 / 7, 2 / 3, 9 / 55,9/91,2/15]
      },
            {
        name: "Low impact aerobics",
        harmonic: [9/7, 9 / 55, 2/15, 9/247,9/391,2/36]
      },
            {
        name: "High impact aerobics",
        harmonic: [3.141/2, 2/3, 0, 2/15,0,2/35]
      }
    ],
    selfourierCoefficient: {}
  }),
  computed: {
    beta: function() {
      return this.activeFrequency / this.naturalFrequency;
    },
    dynamicampFactors: function() {
      var temp = [];
      for (var i = 0; i < 6; i++) {
        var dampfactor = 1 / Math.sqrt((1 - (i + 1) ** 2 * this.beta ** 2) ** 2 + (2 * (i + 1) * (this.dampingRatio / 100) * this.beta) ** 2);
        temp.push(dampfactor);
      }
      return temp;
    },
    activeFrequency: function() {
      var temp;
      for (var i = 5; i > 0; i--) {
        if (this.naturalFrequency / i < this.selfrequencyRange.upperBound && this.naturalFrequency / i > this.selfrequencyRange.lowBound) {
          temp = this.naturalFrequency / i;
        }
      }
      return temp;
    },
    modLoad: function() {
      if(Object.keys(this.selfourierCoefficient).length ===0){
        return "TBC"
        
     }else{
       var sum = 0;
      
      for (var i = 0; i < 6; i++) {
        sum =sum+this.dynamicampFactors[i] * this.selfourierCoefficient.harmonic[i];
      }
      
      return this.load*(1+sum)
    }
  }
}
}
</script>
