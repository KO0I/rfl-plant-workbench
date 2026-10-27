import {TREE_REFERENCES} from './tree-references.js';
import {PLANT_STAGES,PRODUCE_KINDS,supportsProduce} from './plant-produce.js';
import {BOTANICAL_FORMS} from './botanical-plants.js';
import {SEASONS,supportsSeasons} from './plant-seasons.js';
import {TREE_FORMS} from './tree-forms.js';
// JSON-compatible species definitions. No planet or renderer imports.
// The three baseline recipes retain their original variant seeds and palettes.
export const FLORA_SCHEMA_VERSION=1;
export const floraSpecies=[
 ...TREE_REFERENCES.map(ref=>({id:'tree-'+ref.form,name:ref.name,category:ref.form==='banana'?'Tropical plants':'Trees',version:1,schemaVersion:1,units:'m',recipe:{kind:'tree-form',form:ref.form,...(ref.produce?{produce:ref.produce}:{}),...(ref.produceColor?{produceColor:ref.produceColor}:{})},seeds:[7,19,42,83],palette:{bark:ref.bark,leaf:ref.leaf,flower:ref.flower},ecology:{biomes:ref.biomes,aquatic:false,weight:1,maxSlope:.6},rendering:{sampling:'sphere',rangeMeters:160,foliage:'interiors-coarse-v1'},provenance:{kind:'botanical-reference',source:ref.botanical,url:ref.url,description:ref.description}})),
 {id:'nauptre-cacti',name:'Nauptre · flowering cactus',category:'Succulents',version:1,schemaVersion:1,units:'m',recipe:{kind:'nauptre-golden',group:'nauptre-cacti'},seeds:[0,1,2,3,4,5],palette:{bark:[.13,.31,.30],leaf:[.27,.40,.37],flower:[.98,.34,.62]},ecology:{biomes:['desert','xeric-shrubland'],aquatic:false,weight:4,maxSlope:.58},rendering:{sampling:'hemisphere',rangeMeters:150},provenance:{kind:'golden',commit:'95cec58b1bc8467c3b7f60d8fbc6a3e936eeefb9'}},
 {id:'nauptre-bushes',name:'Nauptre · angular scrub',category:'Shrubs',version:1,schemaVersion:1,units:'m',recipe:{kind:'nauptre-golden',group:'nauptre-bushes'},seeds:[0,1,2],palette:{bark:[.27,.23,.30],leaf:[.27,.40,.37],flower:[.98,.34,.62]},ecology:{biomes:['desert','xeric-shrubland'],aquatic:false,weight:4,maxSlope:.58},rendering:{sampling:'hemisphere',rangeMeters:65},provenance:{kind:'golden',commit:'95cec58b1bc8467c3b7f60d8fbc6a3e936eeefb9'}},
 {id:'nauptre-joshua',name:'Nauptre · Joshua tree',category:'Trees',version:1,schemaVersion:1,units:'m',recipe:{kind:'nauptre-golden',group:'nauptre-joshua'},seeds:[0,1,2],palette:{bark:[.27,.23,.30],leaf:[.27,.40,.37],flower:[.98,.34,.62]},ecology:{biomes:['desert','xeric-shrubland'],aquatic:false,weight:2,maxSlope:.58},rendering:{sampling:'sphere',rangeMeters:125},provenance:{kind:'golden',commit:'95cec58b1bc8467c3b7f60d8fbc6a3e936eeefb9'}},
 ...['tree','bush'].map(form=>({id:'interiors-'+form,name:'Interiors · '+(form==='tree'?'canopy tree':'broad bush'),category:form==='tree'?'Trees':'Shrubs',version:2,schemaVersion:1,units:'m',recipe:{kind:'interiors',form},seeds:[7,19,42],palette:{bark:[.4,.365,.259],leaf:[.216,.396,.255],flower:[.65,.37,.41]},ecology:{biomes:['woodland','garden'],aquatic:false,weight:2,maxSlope:.6},rendering:{sampling:'sphere',rangeMeters:125,foliage:'interiors-coarse-v1'},provenance:{kind:'reference',source:'Interiors Garden Canyon',commit:'f30127e6406f9df16a4a562dd85b322052cf1506'}})),
 ...[
  ['evergreen','Evergreen · tiered conifer',['boreal-forest','montane-forest'],[.3,.24,.17],[.15,.32,.23]],
  ['willow','Willow · weeping crown',['riparian','wetland-edge'],[.36,.3,.2],[.39,.49,.24]],
  ['palm','Palm · arching fronds',['tropical','coastal'],[.49,.4,.28],[.25,.43,.23]],
  ['dragonblood','Dragonblood · umbrella crown',['dry-woodland','rocky-upland'],[.47,.44,.36],[.25,.4,.32]]
 ].map(([form,name,biomes,bark,leaf])=>({id:'tree-'+form,name,category:'Trees',version:form==='willow'?2:1,schemaVersion:1,units:'m',recipe:{kind:'tree-form',form},seeds:[7,19,42,83],palette:{bark,leaf,flower:[.7,.5,.3]},ecology:{biomes,aquatic:false,weight:1,maxSlope:.6},rendering:{sampling:'sphere',rangeMeters:160,foliage:'interiors-coarse-v1'},provenance:{kind:'procedural',source:'Plant Workbench tree forms'}})),
 ...[
  ['desert-rose','Desert rose · flowering caudex','Succulents',['desert','xeric-shrubland'],[.61,.46,.3],[.28,.38,.17],[.9,.21,.48]],
  ['fern','Fern · feathered fronds','Ferns',['woodland','moist-understory'],[.27,.33,.17],[.25,.43,.21],[.6,.5,.3]],
  ['baobab','Baobab · bottle trunk','Trees',['dry-woodland','savanna'],[.59,.46,.32],[.25,.34,.14],[.85,.8,.6]],
  ['saguaro','Saguaro · branching columns','Cacti',['desert'],[.3,.4,.24],[.32,.43,.25],[.85,.8,.57]],
  ['barrel-cactus','Barrel cactus · ribbed globe','Cacti',['desert','xeric-shrubland'],[.3,.4,.2],[.32,.43,.22],[.93,.55,.12]],
  ['prickly-pear','Prickly pear · branching pads','Cacti',['desert','dry-scrub'],[.3,.4,.24],[.32,.44,.28],[.9,.29,.4]]
 ].map(([form,name,category,biomes,bark,leaf,flower])=>({id:'plant-'+form,name,category,version:1,schemaVersion:1,units:'m',recipe:{kind:'botanical',form,...(form==='desert-rose'?{stage:'flowering'}:{})},seeds:[7,19,42,83],palette:{bark,leaf,flower},ecology:{biomes,aquatic:false,weight:1,maxSlope:.65},rendering:{sampling:'sphere',rangeMeters:120,...(['desert-rose','fern','baobab'].includes(form)?{foliage:'interiors-coarse-v1'}:{})},provenance:{kind:'procedural',source:'Plant Workbench botanical forms'}})),
 ...['low','tall'].map(form=>({id:'xpm-cactus-'+form,name:'XPM · '+form+' cactus',category:'Cacti',version:1,schemaVersion:1,units:'m',recipe:{kind:'xpm-cactus',form,stage:'normal'},seeds:[7,19,42,83],palette:{bark:[.13,.3,.21],leaf:form==='low'?[.243,.463,.314]:[.196,.451,.29],flower:[.94,.32,.58]},ecology:{biomes:['desert'],aquatic:false,weight:1,maxSlope:.6},rendering:{sampling:'sphere',rangeMeters:100},provenance:{kind:'derived',source:'XPM Workbench drawCactus and scene-model-defaults',commit:'ec3b798f6e939fd3ecd8a194dac7b7e2d2243a67',reference:'xpm-cactus-references.json'}}))
];
export function validateSpecies(s){
 if(s?.schemaVersion!==1||s.units!=='m'||!Number.isInteger(s.version)||s.version<1||!/^[-a-z0-9_]{1,80}$/.test(s.id)||typeof s.name!=='string'||!s.name.trim())throw Error('Invalid species identity, version or units');
 if(!['nauptre-golden','growth','imported','interiors','tree-form','botanical','xpm-cactus'].includes(s.recipe?.kind))throw Error('Unknown geometry recipe');
 if(s.recipe.kind==='tree-form'&&!TREE_FORMS.includes(s.recipe.form))throw Error('Unknown tree form');
 if(s.recipe.kind==='botanical'&&!BOTANICAL_FORMS.includes(s.recipe.form))throw Error('Unknown botanical form');
 if(s.recipe.season!==undefined&&(!SEASONS.includes(s.recipe.season)||!supportsSeasons(s)))throw Error('Invalid season for this plant');
 if(s.recipe.kind==='xpm-cactus'&&!['low','tall'].includes(s.recipe.form))throw Error('Unknown XPM cactus form');
 if(s.recipe.stage!==undefined&&(!PLANT_STAGES.includes(s.recipe.stage)||!supportsProduce(s)))throw Error('Invalid reproductive stage');
 if(s.recipe.produce!==undefined&&!PRODUCE_KINDS.includes(s.recipe.produce))throw Error('Invalid produce kind');
 if(s.recipe.produceColor!==undefined&&(!Array.isArray(s.recipe.produceColor)||s.recipe.produceColor.length!==3||!s.recipe.produceColor.every(v=>Number.isFinite(v)&&v>=0&&v<=1)))throw Error('Invalid produce color');
 if(s.recipe.produceScale!==undefined&&(!Number.isFinite(s.recipe.produceScale)||s.recipe.produceScale<.5||s.recipe.produceScale>3))throw Error('Produce scale must be 0.5–3');
 if(s.recipe.produceCount!==undefined&&(!Number.isInteger(s.recipe.produceCount)||s.recipe.produceCount<1||s.recipe.produceCount>24))throw Error('Produce count must be 1–24');
 if(!Array.isArray(s.seeds)||!s.seeds.length||s.seeds.length>64||!s.seeds.every(x=>Number.isInteger(x)&&x>=0&&x<=4294967295)||new Set(s.seeds).size!==s.seeds.length)throw Error('Use 1–64 unique uint32 variant seeds');
 if(!s.palette||!['bark','leaf','flower'].every(k=>Array.isArray(s.palette[k])&&s.palette[k].length===3&&s.palette[k].every(x=>Number.isFinite(x)&&x>=0&&x<=1)))throw Error('Palette must contain RGB colors in [0,1]');
 if(!Array.isArray(s.ecology?.biomes)||!s.ecology.biomes.length||!s.ecology.biomes.every(x=>typeof x==='string')||typeof s.ecology.aquatic!=='boolean'||!(s.ecology.weight>0)||!Number.isFinite(s.ecology.weight)||!Number.isFinite(s.ecology.maxSlope)||s.ecology.maxSlope<0||s.ecology.maxSlope>1)throw Error('Invalid ecology definition');
 if(!['hemisphere','sphere'].includes(s.rendering?.sampling)||!Number.isFinite(s.rendering.rangeMeters)||s.rendering.rangeMeters<=0)throw Error('Invalid rendering metadata');
 for(const key of ['temperature','moisture','elevation','latitude','exposure']){const range=s.ecology[key];if(range!==undefined&&(!Array.isArray(range)||range.length!==2||!range.every(Number.isFinite)||range[1]<=range[0]))throw Error('Invalid ecology range: '+key);}
 return s;
}
export function createSpeciesRegistry(definitions){
 const entries=new Map();for(const s of definitions){validateSpecies(s);if(entries.has(s.id))throw Error('Duplicate species ID: '+s.id);entries.set(s.id,structuredClone(s));}
 return {get:id=>entries.has(id)?structuredClone(entries.get(id)):null,list:()=>[...entries.values()].map(s=>structuredClone(s))};
}
