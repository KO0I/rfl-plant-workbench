import assert from 'node:assert/strict';
import {floraSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
for(const s of floraSpecies.filter(s=>['interiors','tree-form'].includes(s.recipe.kind))){
 const shapes=[];
 for(const seed of s.seeds){
  const a=generateSpecies(s,seed),v=a.mesh.vertices;
  assert.deepEqual(v,generateSpecies(s,seed).mesh.vertices,'seed must reproduce geometry');
  assert.equal(a.diagnostics.degenerate,0);
  assert(a.diagnostics.triangles<6000,'authoring mesh budget');
  assert(Math.abs(a.diagnostics.bounds.min[1])<1e-6,'grounded roots');
  assert(v.some((n,i)=>i%10===9&&n===0),'solid wood');
  assert(v.some((n,i)=>i%10===9&&n===1),'dithered foliage');
  shapes.push(Array.from(v));
 }
 assert.notDeepEqual(shapes[0],shapes[1],'variants must differ');
 const approved=JSON.parse(JSON.stringify(await approveSpecies(s)));
 assert(await verifyApproval(approved),'export/import preserves approval');
 approved.recipe.heightMeters=3;
 assert.equal(await verifyApproval(approved),false,'edited shape invalidates approval');
}
console.log('Plant form variants and export contracts passed');

const family=floraSpecies.find(s=>s.id==='tree-palm');
const recolored=structuredClone(family);recolored.palette.leaf=[.6,.2,.1];
assert.notDeepEqual(generateSpecies(family).mesh.vertices,generateSpecies(recolored).mesh.vertices,'palette edits must change foliage');
assert.throws(()=>generateSpecies({...family,recipe:{kind:'tree-form',form:'missing'}}),/Unknown tree form/);
