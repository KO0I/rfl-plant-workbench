import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {supportsProduce,stagesForSpecies} from '../dist/plant-produce.js';
import {createFloraPreview} from '../dist/flora-preview.js';

const forms=floraSpecies.filter(s=>s.recipe.form==='prototaxite-a');
assert.equal(forms.length,4);
for(const s of forms){
 assert.equal(supportsProduce(s),false);
 assert.deepEqual(stagesForSpecies(s),['normal','bud','flowering']);
 for(const invalid of [{stage:'fruiting'},{produce:'nuts'},{produce:'fruit'},{produceScale:1},{emissiveCrown:'blue'}]){
  assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,...invalid}}));
 }
 for(const seed of s.seeds){
  const bare=generateSpecies({...s,recipe:{...s.recipe,stage:'normal'}},seed);
  for(const stage of ['bud','flowering']){
   const source={...s,recipe:{...s.recipe,stage}},a=generateSpecies(source,seed);
   assert.equal(a.diagnostics.degenerate,0);
   assert(a.diagnostics.triangles<1500);
   assert.equal(a.diagnostics.bounds.min[1],0);
   assert.deepEqual(a.mesh.vertices.subarray(0,bare.mesh.vertices.length),bare.mesh.vertices,'crown preserves column');
   assert.deepEqual(a.mesh.frameDiagnostics,bare.mesh.frameDiagnostics,'stable stage framing');
   assert.deepEqual(a.mesh.vertices,generateSpecies(source,seed).mesh.vertices);
   const crown=a.mesh.vertices.subarray(bare.mesh.vertices.length);
   const expectedMaterial=stage==='bud'?0:s.recipe.emissiveCrown?2:1;
   assert(crown.every((v,i)=>i%10!==9||v===expectedMaterial));
   if(stage==='flowering')assert(a.diagnostics.dimensions[0]>bare.diagnostics.dimensions[0],'spreading feather crown');
  }
 }
 for(const stage of stagesForSpecies(s)){
  const exported=JSON.parse(JSON.stringify(await approveSpecies({...s,recipe:{...s.recipe,stage}})));
  assert(await verifyApproval(exported));
  assert.equal(exported.recipe.emissiveCrown,s.recipe.emissiveCrown);
  exported.recipe.emissiveCrown=!exported.recipe.emissiveCrown;
  assert.equal(await verifyApproval(exported),false);
 }
}
const ordinary=floraSpecies.find(s=>s.id==='tree-palm');
assert.deepEqual(stagesForSpecies(ordinary),['normal','flowering','fruiting']);
assert.throws(()=>validateSpecies({...ordinary,recipe:{...ordinary.recipe,stage:'bud'}}));

// Exercise the actual software preview, including dithered crown pixels at night.
globalThis.devicePixelRatio=1;
let solid=[],feathers=[];
const ctx={clearRect(){solid=[];feathers=[];},beginPath(){},moveTo(){},lineTo(){},stroke(){},closePath(){},fill(){solid.push(this.fillStyle)},arc(){},fillText(){},fillRect(){feathers.push(this.fillStyle)}};
const canvas={clientWidth:140,clientHeight:140,getContext:type=>type==='2d'?ctx:null};
for(const s of [forms[0],forms[2],forms[3]]){
 const preview=createFloraPreview(canvas);preview.setMesh(generateSpecies(s).mesh);
 preview.setSettings({night:false,reference:'none',lod:0});
 const daySolid=[...solid],dayFeathers=[...feathers];assert(dayFeathers.length>0);
 preview.setSettings({night:true});
 assert.notDeepEqual(solid,daySolid,'column darkens at night');
 if(s.recipe.emissiveCrown)assert.deepEqual(feathers,dayFeathers,'luminous crown retains brightness');
 else assert.notDeepEqual(feathers,dayFeathers,'white crown is not luminous');
 preview.dispose();
}
console.log('Prototaxite A: stages, no fruit, four crowns, emission, night preview and exports passed');
