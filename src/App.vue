<!-- App.vue -->
<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" absolute temporary>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Available calcs:</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-group :value="false" prepend-icon="mdi-chart-line">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Analysis</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item v-for="analysisItem in analysisItems" :key="analysisItem.title" :to="analysisItem.to" link>
            <v-list-item-content>
              <v-list-item-title>{{ analysisItem.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <v-list-item v-for="item in items" :key="item.title" :to="item.to" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <h2>Mike's engineering calcs</h2>
      <v-spacer></v-spacer>
      <v-btn color="orange" dark @click.stop="drawer = !drawer">
        Calcs
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    drawer: null,
    analysisItems: [
      { title: "UDL", to: "/analysis/udl" },
      { title: "partial", to: "/analysis/partial" }
    ],
    items: [
      { title: "Vibration", to: "/vibration", icon: "mdi-access-point" },
      { title: "Refurbishment CO2", to: "/refurbCO2", icon: "mdi-factory" },
      {title:"RC beam", to:"/rcbeam",icon:"mdi-calculator"}
    ]
  })
};
</script>
