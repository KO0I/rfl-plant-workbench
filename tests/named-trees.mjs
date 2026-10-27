import assert from 'node:assert/strict';
import {floraSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {NAMED_TREES} from '../dist/named-trees.js';
import {produceGeometry,defaultProduce} from '../dist/plant-produce.js';
import {meshDiagnostics} from '../dist/faceted-flora.js';
const solids=mesh=>Array.from(mesh.vertices).filter((v,i)=>mesh.vertices[Math.floor(i/10)*10+9]===0);
const signatures=new Set();
for(const form of NAMED_TREES){
 const s=floraSpecies.find(s=>s.id==='tree-'+form);assert(s);assert(s.provenance.url.startsWith('https://'));
 for(const seed of[0,7,19,42,83,4294967295]){
  const source={...s,seeds:[seed]},v=generateSpecies(source),next=generateSpecies({...source,seeds:[(seed+1)>>>0]});
  assert.deepEqual(v.mesh.vertices,generateSpecies(source).mesh.vertices);
  assert.notDeepEqual(v.mesh.vertices,next.mesh.vertices);
  assert(v.diagnostics.triangles<6000);assert.equal(v.diagnostics.degenerate,0);assert(Math.abs(v.diagnostics.bounds.min[1])<1e-5);
  if(!['coconut','banana'].includes(form)){
   const winter=generateSpecies({...source,recipe:{...source.recipe,season:'winter'}});assert.deepEqual(solids(v.mesh),solids(winter.mesh));assert(winter.mesh.vertices.every((x,i)=>i%10!==9||x===0));assert.deepEqual(v.mesh.frameDiagnostics,winter.mesh.frameDiagnostics);
  }
 }
 const g=generateSpecies(s);signatures.add(JSON.stringify(g.diagnostics.dimensions));
 const a=await approveSpecies({...s,seeds:[19702419],recipe:{...s.recipe,stage:'fruiting'}});assert(await verifyApproval(JSON.parse(JSON.stringify(a))));
 for(const kind of['fruit','flower'])assert.equal(meshDiagnostics(produceGeometry(kind,[.8,.6,.2],42,form)).degenerate,0);
}
assert.equal(signatures.size,9,'distinct family proportions');
const aspen=generateSpecies(floraSpecies.find(s=>s.id==='tree-aspen')).mesh.vertices;
assert(aspen.some((v,i)=>i%10===6&&v>.8&&aspen[i+1]>.8&&aspen[i+3]===0),'white solid bark');
assert.equal(defaultProduce(floraSpecies.find(s=>s.id==='tree-oak')),'nuts');
for(const form of['pear','banana','coconut'])assert.notDeepEqual(produceGeometry('fruit',[.8,.6,.2],42,form).vertices,produceGeometry('fruit',[.8,.6,.2],42).vertices);
console.log('Nine tree identities, 54 seeded variants, winter structure, native produce and arbitrary-seed exports passed');
