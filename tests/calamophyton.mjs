import assert from 'node:assert/strict';
import {floraSpecies} from '../dist/flora-species.js';
import {generateSpecies} from '../dist/flora-authoring.js';
const species=floraSpecies.find(s=>s.id==='tree-calamophyton');
assert(species);
for(let seed=0;seed<32;seed++){
 const result=generateSpecies({...species,seeds:[seed]},seed);
 assert(result.height>=4&&result.height<=6,'Calamophyton must be 4–6 metres');
 assert(result.diagnostics.triangles<6000);
 assert.equal(result.diagnostics.degenerate,0);
 assert.equal(result.diagnostics.bounds.min[1],0);
}
console.log('Calamophyton: 32 seeds grounded, nondegenerate, 4–6 m, under mesh budget');

const normal=generateSpecies(species);
for(const stage of ['flowering','fruiting'])for(const produce of ['pinecones','nuts']){
 const source={...species,recipe:{...species.recipe,stage,produce}};
 const live=generateSpecies(source);
 assert(live.mesh.count>normal.mesh.count,'stage must add visible produce');
 const burnt=generateSpecies({...source,recipe:{...source.recipe,condition:'burnt'}});
 const wood=[];
 for(let i=0;i<normal.mesh.vertices.length;i+=10)if(normal.mesh.vertices[i+9]===0)wood.push(...normal.mesh.vertices.slice(i,i+10));
 assert.equal(burnt.mesh.vertices.length,wood.length,'burning removes all crown sprays and produce');
 for(let i=0;i<wood.length;i+=10){
  assert.deepEqual(Array.from(burnt.mesh.vertices.slice(i,i+6)),wood.slice(i,i+6),'burning preserves wood positions/normals');
  for(let k=6;k<9;k++)assert(Math.abs(burnt.mesh.vertices[i+k]-wood[i+k]*.18)<1e-6);
 }
 assert.deepEqual(burnt.mesh.frameDiagnostics,normal.mesh.frameDiagnostics,'burning keeps camera framing');
 const {approveSpecies,verifyApproval}=await import('../dist/flora-authoring.js');
 const approved=await approveSpecies({...source,seeds:[7],recipe:{...source.recipe,condition:'burnt'}});
 assert(await verifyApproval(JSON.parse(JSON.stringify(approved))));
}
console.log('Calamophyton flowers, cones/nuts, burnt geometry and export round trips passed');

const stageMesh=stage=>generateSpecies({...species,recipe:{...species.recipe,stage,produce:'pinecones'}}).mesh.vertices;
assert.notDeepEqual(stageMesh('flowering'),stageMesh('fruiting'),'flowers and cones must be distinct');
