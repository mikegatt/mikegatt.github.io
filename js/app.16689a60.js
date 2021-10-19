(function(e){function t(t){for(var n,l,u=t[0],s=t[1],o=t[2],v=0,p=[];v<u.length;v++)l=u[v],Object.prototype.hasOwnProperty.call(i,l)&&i[l]&&p.push(i[l][0]),i[l]=0;for(n in s)Object.prototype.hasOwnProperty.call(s,n)&&(e[n]=s[n]);c&&c(t);while(p.length)p.shift()();return r.push.apply(r,o||[]),a()}function a(){for(var e,t=0;t<r.length;t++){for(var a=r[t],n=!0,u=1;u<a.length;u++){var s=a[u];0!==i[s]&&(n=!1)}n&&(r.splice(t--,1),e=l(l.s=a[0]))}return e}var n={},i={app:0},r=[];function l(t){if(n[t])return n[t].exports;var a=n[t]={i:t,l:!1,exports:{}};return e[t].call(a.exports,a,a.exports,l),a.l=!0,a.exports}l.m=e,l.c=n,l.d=function(e,t,a){l.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},l.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(e,t){if(1&t&&(e=l(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(l.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)l.d(a,n,function(t){return e[t]}.bind(null,n));return a},l.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return l.d(t,"a",t),t},l.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},l.p="/";var u=window["webpackJsonp"]=window["webpackJsonp"]||[],s=u.push.bind(u);u.push=t,u=u.slice();for(var o=0;o<u.length;o++)t(u[o]);var c=s;r.push([0,"chunk-vendors"]),a()})({0:function(e,t,a){e.exports=a("56d7")},"56d7":function(e,t,a){"use strict";a.r(t);a("e260"),a("e6cf"),a("cca6"),a("a79d");var n=a("2b0e"),i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-app",[a("v-navigation-drawer",{attrs:{absolute:"",temporary:""},model:{value:e.drawer,callback:function(t){e.drawer=t},expression:"drawer"}},[a("v-list-item",[a("v-list-item-content",[a("v-list-item-title",[e._v("Available calcs:")])],1)],1),a("v-divider"),a("v-list",{attrs:{dense:""}},[a("v-list-group",{attrs:{value:!1,"prepend-icon":"mdi-chart-line"},scopedSlots:e._u([{key:"activator",fn:function(){return[a("v-list-item-content",[a("v-list-item-title",[e._v("Analysis")])],1)]},proxy:!0}])},e._l(e.analysisItems,(function(t){return a("v-list-item",{key:t.title,attrs:{to:t.to,link:""}},[a("v-list-item-content",[a("v-list-item-title",[e._v(e._s(t.title))])],1)],1)})),1),e._l(e.items,(function(t){return a("v-list-item",{key:t.title,attrs:{to:t.to,link:""}},[a("v-list-item-icon",[a("v-icon",[e._v(e._s(t.icon))])],1),a("v-list-item-content",[a("v-list-item-title",[e._v(e._s(t.title))])],1)],1)}))],2)],1),a("v-app-bar",{attrs:{app:""}},[a("h2",[e._v("Mike's engineering calcs")]),a("v-spacer"),a("v-btn",{attrs:{color:"orange",dark:""},on:{click:function(t){t.stopPropagation(),e.drawer=!e.drawer}}},[e._v(" Calcs ")])],1),a("v-main",[a("v-container",{attrs:{fluid:""}},[a("router-view")],1)],1),a("v-footer",{attrs:{app:""}})],1)},r=[],l={name:"App",data:function(){return{drawer:null,analysisItems:[{title:"UDL",to:"/analysis/udl"},{title:"partial",to:"/analysis/partial"}],items:[{title:"Vibration",to:"/vibration",icon:"mdi-access-point"},{title:"Refurbishment CO2",to:"/refurbCO2",icon:"mdi-factory"},{title:"RC beam",to:"/rcbeam",icon:"mdi-calculator"}]}}},u=l,s=a("2877"),o=a("6544"),c=a.n(o),v=a("7496"),p=a("40dc"),d=a("8336"),m=a("a523"),f=a("ce7e"),b=a("553a"),h=a("132d"),_=a("8860"),g=a("56b0"),y=a("da13"),k=a("5d23"),x=a("34c3"),w=a("f6c4"),C=a("f774"),V=a("2fa4"),O=Object(s["a"])(u,i,r,!1,null,null,null),A=O.exports;c()(O,{VApp:v["a"],VAppBar:p["a"],VBtn:d["a"],VContainer:m["a"],VDivider:f["a"],VFooter:b["a"],VIcon:h["a"],VList:_["a"],VListGroup:g["a"],VListItem:y["a"],VListItemContent:k["a"],VListItemIcon:x["a"],VListItemTitle:k["b"],VMain:w["a"],VNavigationDrawer:C["a"],VSpacer:V["a"]});var S=a("f309");n["a"].use(S["a"]);var T=new S["a"]({}),I=a("8c4f"),R=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-container",[a("v-card",[a("v-card-title",[e._v("Structure properties")]),a("v-card-text",[a("v-text-field",{attrs:{label:"Natural Frequency",prefix:"f1=",suffix:"Hz"},model:{value:e.naturalFrequency,callback:function(t){e.naturalFrequency=e._n(t)},expression:"naturalFrequency"}}),a("v-text-field",{attrs:{label:"Damping Ratio",suffix:"%"},model:{value:e.dampingRatio,callback:function(t){e.dampingRatio=e._n(t)},expression:"dampingRatio"}}),a("v-text-field",{attrs:{label:"Load",prefix:"q=",suffix:"kN/m2"},model:{value:e.load,callback:function(t){e.load=e._n(t)},expression:"load"}}),a("v-select",{attrs:{label:"Number of jumpers",items:e.frequencyRange,"item-text":"name","return-object":"","single-line":""},model:{value:e.selfrequencyRange,callback:function(t){e.selfrequencyRange=t},expression:"selfrequencyRange"}}),a("v-select",{attrs:{label:"Type of jumping",items:e.fourierCoefficient,"item-text":"name","return-object":"","single-line":""},model:{value:e.selfourierCoefficient,callback:function(t){e.selfourierCoefficient=t},expression:"selfourierCoefficient"}})],1),a("v-card-title",[e._v("Calculated values")]),a("v-card-text",[a("v-simple-table",{scopedSlots:e._u([{key:"default",fn:function(){return[a("tbody",e._l(e.outputs,(function(t){return a("tr",{key:t.title},[a("td",[e._v(e._s(t.title))]),a("td",[e._v(e._s(t.value))]),a("td",[e._v(e._s(t.units))])])})),0)]},proxy:!0}])})],1)],1)],1)},L=[],N=(a("b64b"),{name:"Vibration",data:function(){return{naturalFrequency:7.5,dampingRatio:3,load:.8,frequencyRange:[{name:"Groups",lowBound:1.5,upperBound:2.8},{name:"Individuals",lowBound:1.5,upperBound:3.5}],selfrequencyRange:{},fourierCoefficient:[{name:"Normal Jumping",harmonic:[1.8,9/7,2/3,9/55,9/91,2/15]},{name:"Low impact aerobics",harmonic:[9/7,9/55,2/15,9/247,9/391,2/36]},{name:"High impact aerobics",harmonic:[1.5705,2/3,0,2/15,0,2/35]}],selfourierCoefficient:{}}},computed:{beta:function(){return this.activeFrequency/this.naturalFrequency},dynamicampFactors:function(){for(var e=[],t=0;t<6;t++){var a=1/Math.sqrt(Math.pow(1-Math.pow(t+1,2)*Math.pow(this.beta,2),2)+Math.pow(2*(t+1)*(this.dampingRatio/100)*this.beta,2));e.push(a)}return e},activeFrequency:function(){for(var e,t=5;t>0;t--)this.naturalFrequency/t<this.selfrequencyRange.upperBound&&this.naturalFrequency/t>this.selfrequencyRange.lowBound&&(e=this.naturalFrequency/t);return e},modLoad:function(){if(0===Object.keys(this.selfourierCoefficient).length)return"TBC";for(var e=0,t=0;t<6;t++)e+=this.dynamicampFactors[t]*this.selfourierCoefficient.harmonic[t];return this.load*(1+e)},outputs:function(){return[{title:"Active Frequency",value:this.activeFrequency,units:"Hz"},{title:"Beta",value:this.beta,units:""},{title:"Dynamic amplication factors",value:this.dynamicampFactors,units:""},{title:"Fourier coefficients",value:this.selfourierCoefficient.harmonic,units:"Hz"},{title:"Modified loading",value:this.modLoad,units:"kN/m2"}]}}}),F=N,M=a("b0af"),j=a("99d9"),q=a("b974"),B=a("1f4f"),D=a("8654"),$=Object(s["a"])(F,R,L,!1,null,null,null),E=$.exports;c()($,{VCard:M["a"],VCardText:j["b"],VCardTitle:j["c"],VContainer:m["a"],VSelect:q["a"],VSimpleTable:B["a"],VTextField:D["a"]});var P=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-container",[a("v-row",[a("h2",[e._v("Refurb CO"),a("sub",[e._v("2")]),e._v(" finder")])]),a("v-row",[e._v("This app is for when we have areas of a development where we know the actual CO2/m2 composition (e.g. refurbished areas), an overall target CO2/m2 for the development and an area where we need to know the allowance for the structure. Add known areas by typing in a name and clicking 'add me'. Fill in the known information to find out the allowance for the new structure.")]),a("v-row",{attrs:{justify:"space-around"}},[a("v-card",{staticClass:"ma-2"},[a("v-card-title",[e._v("Overall controls")]),a("v-card-text",[a("v-row",[a("v-col",[a("v-text-field",{attrs:{label:"Area name",placeholder:"a resi development"},model:{value:e.areaName,callback:function(t){e.areaName=t},expression:"areaName"}})],1),a("v-spacer"),a("v-col",[a("v-btn",{on:{click:e.addArea}},[e._v("Add me")])],1)],1),a("v-row",[a("v-col",[a("v-text-field",{attrs:{label:"Overall development target",placeholder:"500"},scopedSlots:e._u([{key:"append",fn:function(){return[a("div",{staticStyle:{display:"inline"}},[e._v("kgeCO"),a("sub",[e._v("2")]),e._v("/m"),a("sup",[e._v("2")])])]},proxy:!0}]),model:{value:e.developmentTarget,callback:function(t){e.developmentTarget=e._n(t)},expression:"developmentTarget"}})],1)],1)],1)],1)],1),a("v-row",{attrs:{justify:"space-around"}},[a("UnknownDevelopment",{attrs:{allowance:this.allowableTarget},on:{"update-areatotal":function(t){return e.updatearea(t)}}})],1),a("v-row",[a("h3",[e._v("Areas with known embodied carbon:")])]),a("v-row",[a("v-list",e._l(e.arealist,(function(t){return a("KnownDevelopment",{key:t.id,tag:"v-list-item",attrs:{id:t.id,name:t.name},on:{remove:function(a){return e.remove(t)},"update-ratetotal":function(t){return e.update(t)}}})})),1)],1)],1)},G=[],z=(a("fb6a"),a("159b"),a("a434"),function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-card",{staticClass:"ma-2"},[a("v-card-title",[e._v(" "+e._s(e.name))]),a("v-card-text",[a("v-row",[a("v-col",[a("v-list",{attrs:{dense:""}},e._l(e.inputsList,(function(t){return a("Inputs",{key:t.id,tag:"v-list-item",attrs:{name:t.name,value:t.value,percentage:Math.round(100*t.value/e.totalRate),units:t.units},on:{change:function(e){t.value=e}}})})),1),a("v-divider"),e._v(" Total Rate for this sector of the development: "+e._s(e.totalRate)+" kgeCO"),a("sub",[e._v("2")]),e._v("/m"),a("sup",[e._v("2")])],1),a("v-col",[a("div",{staticClass:"chart"},[a("vc-donut",{attrs:{sections:e.computedStuff,total:e.totalRate,"has-legend":"","legend-placement":"bottom"}},[e._v("% split")])],1)])],1)],1),a("v-card-actions",[a("v-btn",{attrs:{text:""},on:{click:function(t){return e.$emit("remove")}}},[e._v("Remove this sector")])],1)],1)}),H=[],U=(a("a9e3"),a("b0c0"),function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-row",[a("v-col",[a("v-text-field",{attrs:{dense:"",placeholder:"100"},on:{input:function(t){return e.$emit("change",e.value)}},scopedSlots:e._u([{key:"label",fn:function(){return["kgeCO<sub>2</sub>/m<sup>2</sup>"==e.units?a("div",{staticStyle:{display:"inline"}},[e._v("CO"),a("sub",[e._v("2")]),e._v("/m"),a("sup",[e._v("2")]),e._v(" for ")]):e._e(),e._v(e._s(e.name))]},proxy:!0},{key:"append",fn:function(){return[a("div",{staticStyle:{display:"inline"},domProps:{innerHTML:e._s(e.units)}})]},proxy:!0}]),model:{value:e.value,callback:function(t){e.value=e._n(t)},expression:"value"}})],1),a("v-col",["kgeCO<sub>2</sub>/m<sup>2</sup>"==e.units?a("div",{staticStyle:{display:"inline"}},[e._v("("+e._s(e.percentage)+"%)")]):e._e()])],1)}),J=[],K={name:"Inputs",props:{name:String,units:String,percentage:Number},data:function(){return{value:0}}},Q=K,W=a("62ad"),X=a("0fd9"),Y=Object(s["a"])(Q,U,J,!1,null,null,null),Z=Y.exports;c()(Y,{VCol:W["a"],VRow:X["a"],VTextField:D["a"]});var ee=a("b4b3"),te=a.n(ee);a("3a93");n["a"].use(te.a);var ae={name:"KnownDevelopment",components:{Inputs:Z},props:{name:String,id:Number},data:function(){return{inputsList:[{name:"GIA",value:0,units:"m<sup>2</sup>"},{name:"NIA",value:0,units:"m<sup>2</sup>"},{name:"Substructure",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"Superstructure",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"MEP",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"InternalFinishes",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"Facade",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"A4",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"A5",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"B15",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"B6",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"C14",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"}],total:0,myArray:[]}},computed:{totalRate:function(){for(var e=0,t=2;t<12;t++)e+=this.inputsList[t].value;return this.$emit("update-ratetotal",[this.id,this.inputsList[0].value,this.inputsList[1].value,e]),Number(e)},computedStuff:function(){for(var e=[],t=2;t<10;t++)e.push({label:this.inputsList[t].name,value:this.inputsList[t].value});return e}}},ne=ae,ie=Object(s["a"])(ne,z,H,!1,null,null,null),re=ie.exports;c()(ie,{VBtn:d["a"],VCard:M["a"],VCardActions:j["a"],VCardText:j["b"],VCardTitle:j["c"],VCol:W["a"],VDivider:f["a"],VList:_["a"],VListItem:y["a"],VRow:X["a"]});var le=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-card",{staticClass:"ma-2"},[a("v-card-title",[e._v("Area where we are trying to find the available CO"),a("sub",[e._v("2")]),e._v("/m"),a("sup",[e._v("2")])]),a("v-card-text",[a("v-list",{attrs:{dense:""}},e._l(e.inputsList,(function(t){return a("Inputs",{key:t.id,tag:"v-list-item",attrs:{name:t.name,value:t.value,percentage:Math.round(100*t.value/e.allowance),units:t.units},on:{change:function(a){return e.changeinput(t,a)}}})})),1),a("v-row",[a("v-divider")],1),a("v-row",[e._v(" Structure allowance for this sector of the development: "+e._s(e.subAllowance)+" kgeCO2/m2")]),a("v-row",[e._v(" Total rate for this sector of the development: "+e._s(e.allowance)+" kgeCO2/m2 ")])],1)],1)},ue=[],se={name:"UnknownDevelopment",components:{Inputs:Z},props:{name:String,allowance:Number},data:function(){return{inputsList:[{name:"GIA",value:0,units:"m<sup>2</sup>"},{name:"NIA",value:0,units:"m<sup>2</sup>"},{name:"MEP",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"InternalFinishes",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"Facade",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"A4",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"A5",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"B15",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"B6",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"},{name:"C14",value:0,units:"kgeCO<sub>2</sub>/m<sup>2</sup>"}],total:0}},computed:{subAllowance:function(){this.$emit("update-areatotal",this.inputsList);for(var e=0,t=2;t<10;t++)e+=this.inputsList[t].value;return this.allowance-e}},methods:{changeinput:function(e,t){e.value=t}}},oe=se,ce=Object(s["a"])(oe,le,ue,!1,null,null,null),ve=ce.exports;c()(ce,{VCard:M["a"],VCardText:j["b"],VCardTitle:j["c"],VDivider:f["a"],VList:_["a"],VListItem:y["a"],VRow:X["a"]});var pe={name:"RefurbCO2",components:{UnknownDevelopment:ve,KnownDevelopment:re},data:function(){return{arealist:[],areaNext:0,areaName:"",developmentTarget:0,allowableTarget:0,allowableGIA:300,allowableNIA:325,index:0}},methods:{addArea:function(){this.arealist.push({id:this.areaNext++,name:this.areaName,GIA:0,NIA:0,totalRate:0})},update:function(e){for(var t=0;t<this.arealist.length;t++)this.arealist[t].id==e[0]&&(this.arealist[t].GIA=e[1],this.arealist[t].NIA=e[2],this.arealist[t].totalRate=e[3]);var a=0,n=0,i=this.arealist.slice();i.forEach((function(e){a+=e.GIA,n+=e.NIA*e.totalRate})),a+=this.allowableGIA,this.allowableTarget=Math.round((this.developmentTarget*a-n)/this.allowableNIA)},updatearea:function(e){this.allowableGIA=e[0].value,this.allowableNIA=e[1].value},remove:function(e){for(var t=this.arealist.slice(),a=0;a<t.length;a++)t[a].id==e.id&&this.arealist.splice(a,1)}}},de=pe,me=Object(s["a"])(de,P,G,!1,null,null,null),fe=me.exports;c()(me,{VBtn:d["a"],VCard:M["a"],VCardText:j["b"],VCardTitle:j["c"],VCol:W["a"],VContainer:m["a"],VList:_["a"],VListItem:y["a"],VRow:X["a"],VSpacer:V["a"],VTextField:D["a"]});var be=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("router-view")},he=[],_e={name:"Analysis",data:function(){return{}}},ge=_e,ye=Object(s["a"])(ge,be,he,!1,null,null,null),ke=ye.exports,xe=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-container",[a("v-card",[a("v-card-title",[e._v(" Structure properties")]),a("v-card-text",[a("v-text-field",{attrs:{label:"Uniformly distributed load",prefix:"w=",suffix:"kN/m"},model:{value:e.w,callback:function(t){e.w=e._n(t)},expression:"w"}}),a("v-text-field",{attrs:{label:"Beam length",prefix:"L=",suffix:"mm"},model:{value:e.l,callback:function(t){e.l=e._n(t)},expression:"l"}}),a("v-text-field",{attrs:{label:"Modulus of elasticity",prefix:"E="},scopedSlots:e._u([{key:"append",fn:function(){return[e._v("N/mm"),a("sup",[e._v("2")])]},proxy:!0}]),model:{value:e.e,callback:function(t){e.e=e._n(t)},expression:"e"}}),a("v-text-field",{attrs:{label:"Second moment of area",prefix:"I="},scopedSlots:e._u([{key:"append",fn:function(){return[e._v("mm"),a("sup",[e._v("4")])]},proxy:!0}]),model:{value:e.i,callback:function(t){e.i=e._n(t)},expression:"i"}})],1),a("v-card-title",[e._v("Calculated values")]),a("v-card-text",[a("v-simple-table",{scopedSlots:e._u([{key:"default",fn:function(){return[a("tbody",e._l(e.outputs,(function(t){return a("tr",{key:t.title},[a("td",[e._v(e._s(t.title))]),a("td",[e._v(e._s(Math.round(100*t.value)/100))]),a("td",[e._v(e._s(t.units))])])})),0)]},proxy:!0}])})],1)],1)],1)},we=[],Ce={name:"UDL",data:function(){return{w:5,l:6e3,e:2e5,i:39e7}},computed:{moment:function(){return this.w*Math.pow(this.l,2)/8e6},shear:function(){return this.w*this.l/2e3},deflection:function(){return 5*this.w*Math.pow(this.l,4)/(384*this.e*this.i)},outputs:function(){return[{title:"Moment",value:this.moment,units:"kNm"},{title:"Shear",value:this.shear,units:"kN"},{title:"Deflection",value:this.deflection,units:"mm"}]}}},Ve=Ce,Oe=Object(s["a"])(Ve,xe,we,!1,null,null,null),Ae=Oe.exports;c()(Oe,{VCard:M["a"],VCardText:j["b"],VCardTitle:j["c"],VContainer:m["a"],VSimpleTable:B["a"],VTextField:D["a"]});var Se=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("v-container",[a("v-card",[a("v-card-title",[e._v(" Structure properties")]),a("v-card-text",[a("v-text-field",{attrs:{label:"Beam width",prefix:"b=",suffix:"mm"},model:{value:e.b,callback:function(t){e.b=e._n(t)},expression:"b"}}),a("v-text-field",{attrs:{label:"Depth to rebar",prefix:"d=",suffix:"mm"},model:{value:e.d,callback:function(t){e.d=e._n(t)},expression:"d"}}),a("v-select",{attrs:{items:e.concgrades,"item-text":"grade","item-value":"strength",label:"Concrete grade"},model:{value:e.fck,callback:function(t){e.fck=t},expression:"fck"}}),a("v-text-field",{attrs:{label:"Characteristic steel strength",prefix:"fyk="},scopedSlots:e._u([{key:"append",fn:function(){return[e._v("N/mm"),a("sup",[e._v("2")])]},proxy:!0}]),model:{value:e.fyk,callback:function(t){e.fyk=e._n(t)},expression:"fyk"}}),a("v-text-field",{attrs:{label:"Design moment",prefix:"M=",suffix:"kNm"},model:{value:e.med,callback:function(t){e.med=e._n(t)},expression:"med"}})],1),a("v-card-title",[e._v("Calculated values")]),a("v-card-text",[a("v-simple-table",{scopedSlots:e._u([{key:"default",fn:function(){return[a("tbody",e._l(e.outputs,(function(t){return a("tr",{key:t.title},[a("td",[e._v(e._s(t.title))]),a("td",[e._v(e._s(Math.round(100*t.value)/100))]),a("td",[e._v(e._s(t.units))])])})),0)]},proxy:!0}])})],1)],1)],1)},Te=[],Ie={name:"RCBeam",data:function(){return{b:300,d:400,fck:32,fyk:500,med:400,concgrades:[{grade:"C25/30",strength:25},{grade:"C32/40",strength:32},{grade:"C40/50",strength:40},{grade:"C50/60",strength:50}]}},computed:{k0:function(){return 1e6*this.med/(this.fck*this.b*Math.pow(this.d,2))},zd:function(){var e=.5+Math.sqrt(.25-3*this.k0/3.4);return e<.95?e:.95},as1:function(){return 1e6*this.med/(.87*this.zd*this.fyk*this.d)},outputs:function(){return[{title:"fck",value:this.fck,units:""},{title:"k0",value:this.k0,units:""},{title:"z/d",value:this.zd,units:""},{title:"As1",value:this.as1,units:"mm2"}]}}},Re=Ie,Le=Object(s["a"])(Re,Se,Te,!1,null,null,null),Ne=Le.exports;c()(Le,{VCard:M["a"],VCardText:j["b"],VCardTitle:j["c"],VContainer:m["a"],VSelect:q["a"],VSimpleTable:B["a"],VTextField:D["a"]}),n["a"].config.productionTip=!1,n["a"].use(I["a"]);var Fe=[{path:"/",component:{template:"<div>Hello</div>"}},{path:"/vibration",component:E},{path:"/refurbCO2",component:fe},{path:"/analysis",component:ke,children:[{path:"udl",component:Ae}]},{path:"/rcbeam",component:Ne}],Me=new I["a"]({routes:Fe});new n["a"]({vuetify:T,router:Me,render:function(e){return e(A)}}).$mount("#app")}});
//# sourceMappingURL=app.16689a60.js.map