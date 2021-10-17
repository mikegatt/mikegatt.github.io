<template>
  <v-container>
    <v-card>
      <v-card-title> Structure properties</v-card-title>
      <v-card-text>
        <v-text-field v-model.number="w" label="Uniformly distributed load" prefix="w=" suffix="kN/m" />
        <v-text-field v-model.number="l" label="Beam length" prefix="L=" suffix="mm" />
        <v-text-field v-model.number="e" label="Modulus of elasticity" prefix="E="
          ><template #append>N/mm<sup>2</sup></template></v-text-field
        >
        <v-text-field v-model.number="i" label="Second moment of area" prefix="I=">
          <template #append>mm<sup>4</sup></template></v-text-field
        >
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
  name: "UDL",

  data: () => ({
    w: 5,
    l: 6000,
    e: 200000,
    i: 390000000
  }),
  computed: {
    moment: function() {
      return (this.w * this.l ** 2) / (1000000 * 8);
    },
    shear: function() {
      return (this.w * this.l) / (1000 * 2);
    },
    deflection: function() {
      return (5 * this.w * this.l ** 4) / (384 * this.e * this.i);
    },
    outputs: function() {
      return [
        { title: "Moment", value: this.moment, units: "kNm"},
        { title: "Shear", value: this.shear, units: "kN" },
        { title: "Deflection", value: this.deflection, units: "mm"  }
      ];
    }
  }
};
</script>
