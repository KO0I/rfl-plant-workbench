// JSON-compatible species definitions. No planet or renderer imports.
// The three baseline recipes retain their original variant seeds and palettes.
export const FLORA_SCHEMA_VERSION=1;
export const floraSpecies=[
 {id:'nauptre-cacti',name:'Nauptre · flowering cactus',category:'Succulents',version:1,schemaVersion:1,units:'m',recipe:{kind:'nauptre-golden',group:'nauptre-cacti'},seeds:[0,1,2,3,4,5],palette:{bark:[.13,.31,.30],leaf:[.27,.40,.37],flower:[.98,.34,.62]},ecology:{biomes:['desert','xeric-shrubland'],aquatic:false,weight:4,maxSlope:.58},rendering:{sampling:'hemisphere',rangeMeters:150},provenance:{kind:'golden',commit:'95cec58b1bc8467c3b7f60d8fbc6a3e936eeefb9'}},
 {id:'nauptre-bushes',name:'Nauptre · angular scrub',category:'Shrubs',version:1,schemaVersion:1,units:'m',recipe:{kind:'nauptre-golden',group:'nauptre-bushes'},seeds:[0,1,2],palette:{bark:[.27,.23,.30],leaf:[.27,.40,.37],flower:[.98,.34,.62]},ecology:{biomes:['desert','xeric-shrubland'],aquatic:false,weight:4,maxSlope:.58},rendering:{sampling:'hemisphere',rangeMeters:65},provenance:{kind:'golden',commit:'95cec58b1bc8467c3b7f60d8fbc6a3e936eeefb9'}},
 {id:'nauptre-joshua',name:'Nauptre · Joshua tree',category:'Trees',version:1,schemaVersion:1,units:'m',recipe:{kind:'nauptre-golden',group:'nauptre-joshua'},seeds:[0,1,2],palette:{bark:[.27,.23,.30],leaf:[.27,.40,.37],flower:[.98,.34,.62]},ecology:{biomes:['desert','xeric-shrubland'],aquatic:false,weight:2,maxSlope:.58},rendering:{sampling:'sphere',rangeMeters:125},provenance:{kind:'golden',commit:'95cec58b1bc8467c3b7f60d8fbc6a3e936eeefb9'}}
];
export function validateSpecies(s){
 if(s?.schemaVersion!==1||s.units!=='m'||!Number.isInteger(s.version)||s.version<1||!/^[-a-z0-9_]{1,80}$/.test(s.id)||typeof s.name!=='string'||!s.name.trim())throw Error('Invalid species identity, version or units');
 if(!['nauptre-golden','growth','imported'].includes(s.recipe?.kind))throw Error('Unknown geometry recipe');
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
