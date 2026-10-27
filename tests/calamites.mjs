import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {suitability} from '../dist/flora-ecology.js';

const limits={young:[1,2],mature:[5,12],giant:[15,20]};
const forms=floraSpecies.filter(s=>s.recipe.form==='calamites');assert.equal(forms.length,3);
assert(floraSpecies.some(s=>s.id==='tree-calamophyton'),'separate Calamophyton retained');
for(const s of forms){
 for(const seed of s.seeds){
  const normal=generateSpecies(s,seed),[lo,hi]=limits[s.recipe.sizeClass];
  assert(normal.height>=lo&&normal.height<=hi);
  assert(normal.diagnostics.triangles<6000);
  assert.equal(normal.diagnostics.degenerate,0);
  assert.equal(normal.diagnostics.bounds.min[1],0);
  assert.deepEqual(normal.mesh.vertices,generateSpecies(s,seed).mesh.vertices);
  const trunk=[];
  for(let i=0;i<normal.mesh.vertices.length;i+=10)if(normal.mesh.vertices[i+9]===0)trunk.push(...normal.mesh.vertices.subarray(i,i+10));
  const cones=[];
  for(const stage of ['normal','flowering','fruiting']){
   const source={...s,recipe:{...s.recipe,stage}},live=generateSpecies(source,seed);
   if(stage!=='normal'){assert(live.mesh.count>normal.mesh.count);cones.push(live.mesh.vertices);}
   assert(live.height>=lo&&live.height<=hi);
   const burnt=generateSpecies({...source,recipe:{...source.recipe,condition:'burnt'}},seed);
   assert.equal(burnt.mesh.vertices.length,trunk.length,'all whorls and cones are removed');
   for(let i=0;i<trunk.length;i+=10){
    assert.deepEqual(Array.from(burnt.mesh.vertices.subarray(i,i+6)),trunk.slice(i,i+6),'jointed main stem unchanged');
    for(let k=6;k<9;k++)assert(Math.abs(burnt.mesh.vertices[i+k]-trunk[i+k]*.18)<1e-6);
   }
   assert(burnt.diagnostics.dimensions[0]<normal.diagnostics.dimensions[0]*.4,'no bare side branches remain');
   assert.deepEqual(burnt.mesh.frameDiagnostics,normal.mesh.frameDiagnostics);
  }
  assert.notDeepEqual(...cones,'orange fertile cone differs from green cone');
  const stump=generateSpecies({...s,recipe:{...s.recipe,condition:'stump'}},seed);
  assert(stump.height<=.60001);assert.equal(stump.diagnostics.degenerate,0);
 }
 for(const heightMeters of [1,20])for(const stage of ['normal','flowering','fruiting']){
  const a=generateSpecies({...s,recipe:{...s.recipe,heightMeters,stage}});
  assert(Math.abs(a.height-heightMeters)<1e-5);
 }
 for(const heightMeters of [.99,20.01,NaN])assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,heightMeters}}));
 const habitat={biome:'riparian',water:false,slope:.1,substrate:'mud',riverDistanceMeters:10};
 assert(suitability(s,habitat)>0);
 assert(suitability(s,{...habitat,water:true,waterDepthMeters:.3})>0);
 assert.equal(suitability(s,{...habitat,water:true,waterDepthMeters:2}),0);
 for(const condition of ['healthy','burnt','stump']){
  const exported=JSON.parse(JSON.stringify(await approveSpecies({...s,seeds:[7],recipe:{...s.recipe,condition,stage:'fruiting'}})));
  assert(await verifyApproval(exported));
 }
}
console.log('Calamites: 1–20 m, seeded whorls, cones, stem-only burnt form, stumps, habitat and exports passed');
