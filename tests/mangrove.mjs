import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {suitability,selectCommunitySpecies} from '../dist/flora-ecology.js';

const species=floraSpecies.find(s=>s.id==='tree-mangrove');
const habitat={biome:'tropical',water:false,slope:.05,substrate:'mud',temperature:27,moisture:.9};
assert(suitability(species,habitat)>0);
assert(suitability(species,habitat)>suitability(species,{...habitat,substrate:'sand'}));
for(const waterDepthMeters of [.1,.75,1.5]){
 const environment={...habitat,water:true,waterDepthMeters};
 assert.equal(selectCommunitySpecies([species],environment,42),'tree-mangrove');
}
for(const patch of [
 {water:true},{water:true,waterDepthMeters:0},{water:true,waterDepthMeters:1.51},
 {water:true,waterDepthMeters:NaN},{water:undefined},{substrate:'rock'},
 {temperature:5},{temperature:undefined},{moisture:.2},{biome:'desert'},
 {slope:.6},{building:true},{scarred:true}
])assert.equal(suitability(species,{...habitat,...patch}),0,JSON.stringify(patch));
const palm=floraSpecies.find(s=>s.id==='tree-palm');
assert.equal(suitability(palm,{...habitat,water:true,waterDepthMeters:.5}),0,'ordinary trees stay terrestrial');
for(const seed of species.seeds)for(const heightMeters of [3,6,15]){
 const source={...species,recipe:{...species.recipe,heightMeters}};
 const healthy=generateSpecies(source,seed);
 assert(Math.abs(healthy.height-heightMeters)<1e-5);
 assert.equal(healthy.diagnostics.degenerate,0);
 assert(healthy.diagnostics.triangles<6000);
 assert(Math.abs(healthy.diagnostics.bounds.min[1])<1e-6);
 assert.deepEqual(healthy.mesh.vertices,generateSpecies(source,seed).mesh.vertices);
 // Prop roots must reach far beyond the trunk below the crown.
 const v=healthy.mesh.vertices;let rootReach=0;
 for(let i=0;i<v.length;i+=10)if(v[i+9]===0&&v[i+1]<heightMeters*.15)rootReach=Math.max(rootReach,Math.hypot(v[i],v[i+2]));
 assert(rootReach>heightMeters*.2);
 for(const condition of ['burnt','stump']){
  const damaged=generateSpecies({...source,recipe:{...source.recipe,condition}},seed);
  assert.equal(damaged.diagnostics.degenerate,0);
  assert(damaged.mesh.vertices.every((n,i)=>i%10!==9||n===0));
 }
 for(const stage of ['flowering','fruiting']){
  const reproductive=generateSpecies({...source,recipe:{...source.recipe,stage}},seed);
  assert(reproductive.mesh.count>healthy.mesh.count);
  assert.equal(reproductive.diagnostics.degenerate,0);
 }
}
for(const heightMeters of [0,2.99,15.01,NaN])assert.throws(()=>validateSpecies({...species,recipe:{...species.recipe,heightMeters}}));
const approved=JSON.parse(JSON.stringify(await approveSpecies(species)));
assert(await verifyApproval(approved));
assert.equal(approved.ecology.maxWaterDepthMeters,1.5);
approved.ecology.maxWaterDepthMeters=10;
assert.equal(await verifyApproval(approved),false);
console.log('Mangrove scale, roots, damage, produce, tidal habitat and approval passed');
