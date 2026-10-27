import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {stagesForSpecies,defaultProduce} from '../dist/plant-produce.js';
const female=floraSpecies.find(s=>s.id==='tree-ginkgo-female'),male=floraSpecies.find(s=>s.id==='tree-ginkgo-male');
assert.equal(defaultProduce(female),'nuts');
assert.throws(()=>validateSpecies({...male,recipe:{...male.recipe,stage:'fruiting'}}));
assert.throws(()=>validateSpecies({...female,recipe:{...female.recipe,sex:'unknown'}}));
for(const s of [female,male])for(const seed of s.seeds){
 const summer=generateSpecies(s,seed);
 assert(summer.height>=9&&summer.height<=15);
 assert.equal(summer.diagnostics.degenerate,0);assert(summer.diagnostics.triangles<6000);
 assert(summer.mesh.leafGroups.length>=400,'many small individual fan leaves');
 assert.deepEqual(summer.mesh.vertices,generateSpecies(s,seed).mesh.vertices);
 const wood=[];for(let i=0;i<summer.mesh.vertices.length;i+=10)if(summer.mesh.vertices[i+9]===0)wood.push(...summer.mesh.vertices.subarray(i,i+10));
 const winter=generateSpecies({...s,recipe:{...s.recipe,season:'winter'}},seed);
 assert.deepEqual(Array.from(winter.mesh.vertices),wood,'winter leaves a bare branch structure');
 for(const stage of stagesForSpecies(s)){
  const source={...s,recipe:{...s.recipe,stage}},plant=generateSpecies(source,seed);
  if(stage!=='normal')assert(plant.mesh.count>summer.mesh.count);
  assert.equal(plant.diagnostics.degenerate,0);
  const winterStage=generateSpecies({...source,recipe:{...source.recipe,season:'winter'}},seed);
  assert.deepEqual(winterStage.mesh.vertices,winter.mesh.vertices,'no winter flowers or seeds');
  const burnt=generateSpecies({...source,recipe:{...source.recipe,condition:'burnt'}},seed);
  assert.equal(burnt.mesh.vertices.length,wood.length);
  for(let i=0;i<wood.length;i+=10){
   assert.deepEqual(Array.from(burnt.mesh.vertices.subarray(i,i+6)),wood.slice(i,i+6));
   for(let k=6;k<9;k++)assert(Math.abs(burnt.mesh.vertices[i+k]-wood[i+k]*.18)<1e-6);
  }
 }
 for(const season of ['spring','fall']){
  const plant=generateSpecies({...s,recipe:{...s.recipe,season}},seed);
  assert.deepEqual(plant.mesh.frameDiagnostics,summer.mesh.frameDiagnostics);
  assert.notDeepEqual(plant.mesh.vertices,summer.mesh.vertices);
  if(season==='fall')for(let i=0;i<plant.mesh.vertices.length;i+=10)if(plant.mesh.vertices[i+9]===1){assert(plant.mesh.vertices[i+6]>.65);assert(plant.mesh.vertices[i+7]>.4);assert(plant.mesh.vertices[i+8]<.25);}
 }
 const stump=generateSpecies({...s,recipe:{...s.recipe,condition:'stump'}},seed);
 assert(stump.height<=.60001);assert.equal(stump.diagnostics.degenerate,0);
}
const flower=s=>generateSpecies({...s,recipe:{...s.recipe,stage:'flowering'}}).mesh.vertices;
assert.notDeepEqual(flower(female),flower(male),'paired ovules differ from pollen catkins');
for(const s of [female,male])for(const stage of stagesForSpecies(s)){
 const exported=JSON.parse(JSON.stringify(await approveSpecies({...s,recipe:{...s.recipe,stage}})));
 assert(await verifyApproval(exported));assert.equal(exported.recipe.sex,s.recipe.sex);
}
console.log('Ginkgo: fan leaves, male/female stages, nuts, deciduous seasons, burnt/stump forms and exports passed');
