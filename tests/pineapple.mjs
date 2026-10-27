import assert from 'node:assert/strict';
import {floraSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
const s=floraSpecies.find(s=>s.id==='plant-pineapple');
for(const seed of s.seeds){
 const normal=generateSpecies({...s,recipe:{...s.recipe,stage:'normal'}},seed);
 assert.equal(normal.mesh.produceAnchors.length,1);
 for(const stage of ['normal','flowering','fruiting']){
  const plant=generateSpecies({...s,recipe:{...s.recipe,stage}},seed);
  assert(plant.height>=1&&plant.height<1.5);
  assert.equal(plant.diagnostics.degenerate,0);
  assert(plant.diagnostics.triangles<2000);
  assert.deepEqual(plant.mesh.vertices.subarray(0,normal.mesh.vertices.length),normal.mesh.vertices);
  assert.deepEqual(plant.mesh.vertices,generateSpecies({...s,recipe:{...s.recipe,stage}},seed).mesh.vertices);
 }
}
const exported=JSON.parse(JSON.stringify(await approveSpecies(s)));
assert(await verifyApproval(exported));
assert.equal(exported.ecology.aquatic,false);
console.log('Pineapple scale, single central head, stages, deterministic geometry and export passed');
