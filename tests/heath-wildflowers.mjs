import assert from 'node:assert/strict';
import {floraSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval,generatePlacedSpecies} from '../dist/flora-authoring.js';
import {suitability} from '../dist/flora-ecology.js';
const plants=floraSpecies.filter(s=>s.id.startsWith('plant-flower-cluster-'));assert.equal(plants.length,5);
for(const s of plants){
 for(const seed of s.seeds){
  const base=generateSpecies({...s,recipe:{...s.recipe,stage:'normal'}},seed);
  for(const stage of ['normal','flowering','fruiting']){
   const p=generateSpecies({...s,recipe:{...s.recipe,stage}},seed);
   assert.equal(p.diagnostics.degenerate,0);assert(p.diagnostics.triangles<6000);assert(p.height<1.1);
   assert.deepEqual(p.mesh.vertices.subarray(0,base.mesh.vertices.length),base.mesh.vertices);
   assert.deepEqual(p.mesh.vertices,generateSpecies({...s,recipe:{...s.recipe,stage}},seed).mesh.vertices);
  }
  const snow=generateSpecies({...s,recipe:{...s.recipe,snowDusting:'dusted'}},seed);assert(snow.mesh.count>0);
  assert.equal(generatePlacedSpecies(s,seed,{snowDepthMeters:2}),null);
 }
 const env={biome:s.ecology.biomes[0],water:false,moisture:.5,exposure:.6,slope:.1};assert(suitability(s,env)>0);assert.equal(suitability(s,{...env,water:true}),0);assert.equal(suitability(s,{...env,moisture:.05}),0);
 assert(await verifyApproval(JSON.parse(JSON.stringify(await approveSpecies(s)))));
}
console.log('Heath and wildflowers: five presets, stages, scale, habitats, snow burial and exports passed');
