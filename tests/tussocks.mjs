import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {TUSSOCK_PROFILES} from '../dist/tussock-profiles.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {suitability,selectCommunitySpecies} from '../dist/flora-ecology.js';
import {supportsProduce,stagesForSpecies} from '../dist/plant-produce.js';
const grasses=floraSpecies.filter(s=>s.recipe.form==='tussock');
assert.equal(grasses.length,13);
for(const s of grasses){
 const p=TUSSOCK_PROFILES[s.recipe.ecotype];assert.equal(supportsProduce(s),false);
 for(const seed of s.seeds){
  const normal=generateSpecies(s,seed);
  for(const stage of stagesForSpecies(s)){
   const v=generateSpecies({...s,recipe:{...s.recipe,stage}},seed);
   assert(v.height>=p.height[0]-1e-5&&v.height<=p.height[1]+1e-5);
   assert.equal(v.diagnostics.degenerate,0);assert(v.diagnostics.triangles<3000);
   assert.deepEqual(v.mesh.vertices,generateSpecies({...s,recipe:{...s.recipe,stage}},seed).mesh.vertices);
   assert.deepEqual(v.mesh.vertices.subarray(0,normal.mesh.vertices.length),normal.mesh.vertices);
   assert.deepEqual(v.mesh.frameDiagnostics,normal.mesh.frameDiagnostics);
   if(stage!=='normal')assert(v.mesh.count>normal.mesh.count);
  }
 }
 for(const heightMeters of p.height){const v=generateSpecies({...s,recipe:{...s.recipe,heightMeters,stage:'fruiting'}});assert(Math.abs(v.height-heightMeters)<1e-5);}
 for(const heightMeters of [p.height[0]/2,p.height[1]+.01,NaN])assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,heightMeters}}));
 assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,produce:'fruit'}}));
 assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,ecotype:'unknown'}}));
 for(const biome of p.biomes){
  const env={biome,water:false,slope:.1,moisture:(p.moisture[0]+p.moisture[1])/2,exposure:(p.exposure[0]+p.exposure[1])/2,substrate:p.substrates?.[0]||'loam'};
  assert(suitability(s,env)>0,biome);assert.equal(selectCommunitySpecies([s],env,123),s.id);
  for(const patch of [{biome:'ocean'},{moisture:undefined},{exposure:undefined},{exposure:0},{scarred:true},{building:true},{water:true,waterDepthMeters:.4}])assert.equal(suitability(s,{...env,...patch}),0);
  assert.equal(suitability(s,{...env,moisture:p.moisture[0]-.01}),0);
  if(p.depth){assert(suitability(s,{...env,water:true,waterDepthMeters:.1})>0);assert.equal(suitability(s,{...env,water:true}),0);}
  else assert.equal(suitability(s,{...env,water:true,waterDepthMeters:.01}),0);
  if(p.substrates)assert.equal(suitability(s,{...env,substrate:'rock'}),0);
 }
 const exported=JSON.parse(JSON.stringify(await approveSpecies(s)));assert(await verifyApproval(exported));assert.deepEqual(exported.ecology,s.ecology);
}
const represented=new Set(grasses.flatMap(s=>s.ecology.biomes));
for(const biome of new Set(floraSpecies.filter(s=>s.recipe.form!=='tussock').flatMap(s=>s.ecology.biomes)))assert(represented.has(biome),'Missing catalog biome '+biome);
console.log('13 tussock ecotypes: every catalog biome covered, heights/stages, habitat rejection, deterministic meshes and exports passed');
