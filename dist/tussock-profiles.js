// Stylized habitat ecotypes, not named botanical cultivars. Heights include seed heads.
export const TUSSOCK_PROFILES={
 prairie:{label:'Prairie',height:[.5,1.4],spread:.5,arch:.3,blades:84,leaf:[.43,.49,.23],seed:[.70,.58,.32],biomes:['prairie','grassland'],moisture:[.25,.75],exposure:[.5,1]},
 steppe:{label:'Steppe',height:[.2,.65],spread:.55,arch:.5,blades:64,leaf:[.51,.53,.34],seed:[.76,.68,.45],biomes:['steppe','dry-grassland'],moisture:[.1,.4],exposure:[.6,1]},
 savanna:{label:'Savanna',height:[.7,2],spread:.45,arch:.3,blades:90,leaf:[.55,.54,.24],seed:[.81,.66,.34],biomes:['savanna','dry-woodland'],moisture:[.2,.65],exposure:[.5,1]},
 desert:{label:'Desert bunchgrass',height:[.15,.6],spread:.65,arch:.6,blades:56,leaf:[.59,.56,.36],seed:[.78,.69,.47],biomes:['desert','xeric-shrubland','dry-scrub'],moisture:[.05,.3],exposure:[.6,1]},
 mediterranean:{label:'Mediterranean',height:[.35,1.1],spread:.65,arch:.7,blades:80,leaf:[.42,.49,.34],seed:[.76,.65,.41],biomes:['mediterranean','dry-woodland','orchard'],moisture:[.15,.6],exposure:[.4,1]},
 woodland:{label:'Woodland glade',height:[.25,.8],spread:.65,arch:.8,blades:76,leaf:[.28,.45,.25],seed:[.61,.59,.34],biomes:['woodland','temperate-woodland','temperate-forest','moist-woodland','moist-understory','garden','temperate-garden','orchard'],moisture:[.35,.8],exposure:[.15,.8]},
 boreal:{label:'Boreal clearing',height:[.2,.7],spread:.5,arch:.45,blades:72,leaf:[.36,.45,.33],seed:[.66,.57,.35],biomes:['boreal-forest'],moisture:[.3,.8],exposure:[.3,1]},
 alpine:{label:'Alpine',height:[.1,.4],spread:.85,arch:.8,blades:96,leaf:[.36,.46,.38],seed:[.62,.54,.38],biomes:['alpine','montane-forest','rocky-upland','moorland','heathland'],moisture:[.2,.7],exposure:[.4,1]},
 tundra:{label:'Tundra',height:[.08,.35],spread:.9,arch:.75,blades:104,leaf:[.45,.45,.27],seed:[.65,.49,.30],biomes:['tundra'],moisture:[.3,.9],exposure:[.5,1]},
 tropical:{label:'Tropical clearing',height:[.6,1.8],spread:.55,arch:.65,blades:96,leaf:[.28,.49,.22],seed:[.69,.60,.36],biomes:['tropical','subtropical','tropical-garden','temperate-rainforest'],moisture:[.45,.9],exposure:[.35,1]},
 wetland:{label:'Freshwater margin',height:[.45,1.3],spread:.5,arch:.6,blades:104,leaf:[.28,.46,.27],seed:[.58,.49,.31],biomes:['wetland-edge','pond-edge','freshwater-marsh','riparian','floodplain','tropical-wetland'],moisture:[.65,1],exposure:[.25,1],depth:.15},
 dune:{label:'Coastal dune',height:[.3,1],spread:.6,arch:.35,blades:76,leaf:[.44,.55,.45],seed:[.78,.72,.50],biomes:['coastal','coastal-dune'],moisture:[.1,.6],exposure:[.6,1],substrates:['sand']},
 saltmarsh:{label:'Saltmarsh margin',height:[.25,.9],spread:.6,arch:.5,blades:88,leaf:[.43,.48,.30],seed:[.67,.55,.33],biomes:['saltmarsh','coastal-marsh','mangrove'],moisture:[.6,1],exposure:[.5,1],depth:.15,substrates:['mud','silt']}
};
export const tussockSpecies=Object.entries(TUSSOCK_PROFILES).map(([ecotype,p])=>({
 id:'grass-tussock-'+ecotype,name:'Tussock grass · '+p.label,category:'Grasses',version:1,schemaVersion:1,units:'m',
 recipe:{kind:'botanical',form:'tussock',ecotype},seeds:[7,19,42,83],
 palette:{bark:p.seed,leaf:p.leaf,flower:p.seed.map((v,k)=>v*.45+p.leaf[k]*.55)},
 ecology:{biomes:p.biomes,aquatic:false,weight:5,maxSlope:ecotype==='alpine'?.65:.5,moisture:p.moisture,exposure:p.exposure,...(p.depth?{waterTolerance:'amphibious',maxWaterDepthMeters:p.depth,anchor:'sediment'}:{}),...(p.substrates?{requiredSubstrates:p.substrates}:{})},
 rendering:{sampling:'sphere',rangeMeters:60},
 provenance:{kind:'reference',source:'RFL habitat ecotype',description:`${p.label} tussock, ${p.height[0]}–${p.height[1]} m overall. Dense basal grass blades; optional flowering panicles or dry seed heads. Habitat ecotype rather than a named cultivar. ${p.depth?'Saturated ground and shallows up to 15 cm; roots on sediment.':'Land only.'} Placement requires the listed moisture and exposure ranges.`}
}));
