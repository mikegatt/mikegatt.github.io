import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueRouter from 'vue-router'

Vue.config.productionTip = false
Vue.use(VueRouter)

import Vibration from './components/Vibration.vue'
import RefurbCO2 from './components/refurbCO2/entry.vue'
import Analysis from './components/Analysis.vue'
import UDL from './components/analysis/UDL.vue'
import RCBeam from './components/RCBeam.vue'

const routes = [
  {path:'/',component:{template:'<div>Hello</div>'}},
  {path:'/vibration',component:Vibration},
  {path:'/refurbCO2', component:RefurbCO2},
  {path:'/analysis', component:Analysis, children:[{path:"udl",component:UDL}]},
  {path:'/rcbeam',component:RCBeam}
]

const router = new VueRouter({
  routes})

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
