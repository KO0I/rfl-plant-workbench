import assert from 'node:assert/strict';
import {floraSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {supportsSeasons} from '../dist/plant-seasons.js';
const presets=floraSpecies.filter(s=>s.recipe.form==='olive');
assert.equal(presets.length,2);
for(const s of presets){
 assert.equal(supportsSeasons(s),false,'evergreen foliage');
 for(const seed of s.seeds){
  const base=generateSpecies({...s,recipe:{...s.recipe,stage:'normal'}},seed);
  assert(base.height>=4&&base.height<=8);assert.equal(base.mesh.leafGroups.length,700);
  for(const stage of ['normal','flowering','fruiting']){
   const p=generateSpecies({...s,recipe:{...s.recipe,stage}},seed);
   assert.equal(p.diagnostics.degenerate,0);assert(p.diagnostics.triangles<12000);
   assert.deepEqual(p.mesh.vertices.subarray(0,base.mesh.vertices.length),base.mesh.vertices);
   assert.deepEqual(p.mesh.frameDiagnostics,base.mesh.frameDiagnostics);
   assert.deepEqual(p.mesh.vertices,generateSpecies({...s,recipe:{...s.recipe,stage}},seed).mesh.vertices);
  }
  const burnt=generateSpecies({...s,recipe:{...s.recipe,condition:'burnt'}},seed);
  for(let i=9;i<burnt.mesh.vertices.length;i+=10)assert.equal(burnt.mesh.vertices[i],0);
  assert(burnt.mesh.count<base.mesh.count);
  const stump=generateSpecies({...s,recipe:{...s.recipe,condition:'stump'}},seed);
  assert(stump.height<=.60001);assert.equal(stump.diagnostics.degenerate,0);
 }
 assert(await verifyApproval(JSON.parse(JSON.stringify(await approveSpecies(s)))));
}
const green=generateSpecies(presets[0]),ripe=generateSpecies(presets[1]);
assert.notDeepEqual(green.mesh.vertices,ripe.mesh.vertices);
assert.deepEqual(green.diagnostics.bounds,ripe.diagnostics.bounds);
console.log('Olive: evergreen leaves, 4–8 m, flowers, green/ripe olives, damage forms and exports passed');
