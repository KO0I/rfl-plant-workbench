import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {generateZosteophyl} from '../dist/zosteophyl.js';
import {produceGeometry,defaultProduce} from '../dist/plant-produce.js';
import {suitability} from '../dist/flora-ecology.js';

const forms=floraSpecies.filter(s=>s.recipe.form==='zosteophyl');
assert.equal(forms.length,2);
for(const s of forms){
 assert.equal(defaultProduce(s),'spiky-pods');
 for(const heightMeters of [.5,2])for(const stage of ['normal','flowering','fruiting']){
  const plant=generateSpecies({...s,recipe:{...s.recipe,heightMeters,stage}});
  assert(Math.abs(plant.height-heightMeters)<.0001);
 }
 for(const heightMeters of [.49,2.01,NaN])assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,heightMeters}}));
 assert(suitability(s,{biome:'prairie',water:false,slope:.1})>0);
 assert.equal(suitability(s,{biome:'prairie',water:true,slope:.1}),0);
 for(const seed of s.seeds){
  const source={...s,recipe:{...s.recipe,stage:'normal'}},normal=generateSpecies(source,seed);
  assert(normal.mesh.vertices.every((v,i)=>i%10!==9||v===0),'leafless stems');
  const anchors=normal.mesh.produceAnchors;
  assert(anchors.length>=4&&anchors.length<=6);
  assert.equal(new Set(anchors.map(a=>JSON.stringify(a.position))).size,anchors.length);
  for(const stage of ['flowering','fruiting']){
   const plant=generateSpecies({...s,recipe:{...s.recipe,stage}},seed);
   assert.equal(plant.diagnostics.degenerate,0);
   assert(plant.diagnostics.triangles<6000);
   assert(plant.height>=.5&&plant.height<=2.00001,'0.5–2 metres including heads');
   assert.deepEqual(plant.mesh.vertices.subarray(0,normal.mesh.vertices.length),normal.mesh.vertices,'stage preserves stems');
   const head=produceGeometry(stage==='flowering'?'flower':'spiky-pods',s.palette.flower,seed,'zosteophyl');
   assert.equal(plant.mesh.count-normal.mesh.count,anchors.length*head.count,'exactly one head per stem');
   assert.deepEqual(plant.mesh.vertices,generateSpecies({...s,recipe:{...s.recipe,stage}},seed).mesh.vertices);
  }
 }
 const approved=JSON.parse(JSON.stringify(await approveSpecies(s)));
 assert(await verifyApproval(approved));
 approved.recipe.thorns=false;
 assert.equal(await verifyApproval(approved),false);
 assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,thorns:'yes'}}));
}
let thorny=0;
for(let seed=0;seed<100;seed++){
 const s=forms[0],auto=generateZosteophyl({},seed,s.palette);
 if(auto.count>6*9*15*3)thorny++;
 const bare=generateZosteophyl({thorns:false},seed,s.palette),armed=generateZosteophyl({thorns:true},seed,s.palette);
 assert(armed.count>bare.count);
}
assert(thorny>65&&thorny<100,'usually thorny, occasionally thornless');
console.log('Zosteophyl: leafless forms, terminal heads, scale, thorn frequency, stages and exports passed');
