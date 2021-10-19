<template>
  <v-container>
    <v-card>
      <v-card-title> Structure properties</v-card-title>
      <v-card-text>
        <v-text-field v-model.number="b" label="Beam width" prefix="b=" suffix="mm" />
        <v-text-field v-model.number="d" label="Depth to rebar" prefix="d=" suffix="mm" />
        <v-select v-model="fck" :items="concgrades" item-text="grade" item-value="strength" label="Concrete grade"/>
        <v-text-field v-model.number="fyk" label="Characteristic steel strength" prefix="fyk=">
          <template #append>N/mm<sup>2</sup></template></v-text-field
        >
        <v-text-field v-model.number="med" label="Design moment" prefix="M=" suffix="kNm" />
      </v-card-text>
      <v-card-title>Calculated values</v-card-title>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <tbody>
              <tr v-for="item in outputs" :key="item.title">
                <td>{{ item.title }}</td>
                <td>{{ Math.round(item.value*100)/100 }}</td>
                <td>{{ item.units }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "RCBeam",

  data: () => ({
    b: 300,
    d: 400,
    fck: 32,
    fyk: 500,
    med: 400,
    concgrades:[{grade:"C25/30",strength:25},{grade:"C32/40",strength:32},{grade:"C40/50",strength:40},{grade:"C50/60",strength:50}],

  }),
  computed: {
    k0: function() {
      return (this.med*1000000)/(this.fck*this.b*this.d**2)
    },
    zd: function() {
      var zd1 = 0.5+ Math.sqrt(0.25-(3*this.k0/3.4))
      return zd1<0.95?zd1:0.95
    },
    as1: function() {
      return this.med*1000000/(0.87*this.zd*this.fyk*this.d)
    },
    outputs: function() {
      return [
        {title:"fck",value:this.fck, units:""},
                { title: "k0", value: this.k0, units: ""},
        { title: "z/d", value: this.zd, units: "" },
        { title: "As1", value: this.as1, units: "mm2"  }
      ];
    }
  }
};
</script>
