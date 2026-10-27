import assert from 'node:assert/strict';
import {floraSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {generateNamedTree} from '../dist/named-trees.js';
import {supportsSeasons} from '../dist/plant-seasons.js';
import {meshDiagnostics} from '../dist/faceted-flora.js';
for(const id of ['tree-acacia-spined','tree-jam-wattle']){
 const s=floraSpecies.find(s=>s.id===id);
 for(const seed of s.seeds){
  const base=generateSpecies(s,seed);assert.equal(base.diagnostics.degenerate,0);assert(base.diagnostics.triangles<6000);
  if(id==='tree-jam-wattle'){assert(base.height>=3&&base.height<=7);assert.equal(base.mesh.leafGroups.length,336);assert.equal(supportsSeasons(s),false);}
  else{
   const bare=generateNamedTree('acacia',seed,s.palette),spined=generateNamedTree('acacia',seed,s.palette,{trunkSpines:true});
   assert.equal(meshDiagnostics(spined).triangles-meshDiagnostics(bare).triangles,288);
   assert.deepEqual(base.mesh.vertices,spined.vertices);
   assert(supportsSeasons(s));
   const winter=generateSpecies({...s,recipe:{...s.recipe,season:'winter'}},seed);assert(winter.mesh.count<base.mesh.count);
  }
  for(const stage of ['flowering','fruiting']){
   const source={...s,recipe:{...s.recipe,stage}},p=generateSpecies(source,seed);assert.equal(p.diagnostics.degenerate,0);assert(p.diagnostics.triangles<12000);
   assert.deepEqual(p.mesh.vertices.subarray(0,base.mesh.vertices.length),base.mesh.vertices);assert.deepEqual(p.mesh.frameDiagnostics,base.mesh.frameDiagnostics);
  }
  const burnt=generateSpecies({...s,recipe:{...s.recipe,condition:'burnt'}},seed);
  for(let i=9;i<burnt.mesh.vertices.length;i+=10)assert.equal(burnt.mesh.vertices[i],0);
  const stump=generateSpecies({...s,recipe:{...s.recipe,condition:'stump'}},seed);assert(stump.height<=.60001);assert.equal(stump.diagnostics.degenerate,0);
  assert.deepEqual(base.mesh.vertices,generateSpecies(s,seed).mesh.vertices);
 }
 assert(await verifyApproval(JSON.parse(JSON.stringify(await approveSpecies(s)))));
}
console.log('Acacia varieties: trunk spines, jam-wattle scale/phyllodes, stages, seasons, damage and exports passed');
