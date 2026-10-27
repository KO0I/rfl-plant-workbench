import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {supportsProduce,stagesForSpecies} from '../dist/plant-produce.js';
import {suitability} from '../dist/flora-ecology.js';

const b=floraSpecies.find(s=>s.id==='plant-prototaxite-b');
assert.equal(supportsProduce(b),false);
assert.deepEqual(stagesForSpecies(b),['normal','bud','flowering']);
for(const patch of [{stage:'fruiting'},{produce:'fruit'},{produce:'nuts'}])assert.throws(()=>validateSpecies({...b,recipe:{...b.recipe,...patch}}));
const stamenColors=new Set();
for(const seed of b.seeds){
 const normal=generateSpecies({...b,recipe:{...b.recipe,stage:'normal'}},seed);
 assert(normal.mesh.produceAnchors.length>5,'branching form has multiple upright tips');
 for(const stage of ['bud','flowering']){
  const s={...b,recipe:{...b.recipe,stage}},a=generateSpecies(s,seed);
  assert.equal(a.diagnostics.degenerate,0);
  assert(a.diagnostics.triangles<6000);
  assert.deepEqual(a.mesh.frameDiagnostics,normal.mesh.frameDiagnostics);
  assert.deepEqual(a.mesh.vertices.subarray(0,normal.mesh.vertices.length),normal.mesh.vertices);
  assert.deepEqual(a.mesh.vertices,generateSpecies(s,seed).mesh.vertices);
  const heads=a.mesh.vertices.subarray(normal.mesh.vertices.length);
  if(stage==='bud'){
   assert(heads.every((v,i)=>i%10<6||i%10>8||v>.89),'white buds');
   const perBud=heads.length/normal.mesh.produceAnchors.length;
   for(let offset=0;offset<heads.length;offset+=perBud){
    const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
    for(let i=offset;i<offset+perBud;i+=10)for(let k=0;k<3;k++){min[k]=Math.min(min[k],heads[i+k]);max[k]=Math.max(max[k],heads[i+k]);}
    const size=max.map((n,k)=>n-min[k]);assert(Math.max(...size)-Math.min(...size)<1e-5,'spherical bud proportions');
   }
  }else{
   const individualColors=new Set();let dark=0,bright=0;
   for(let i=0;i<heads.length;i+=10){
    if(heads[i+6]>.5||heads[i+7]>.5){individualColors.add(heads[i+6]>heads[i+7]?'orange':'cyan');bright++;}
    else if(heads[i+8]<.15&&heads[i+8]>heads[i+6])dark++;
   }
   assert(dark>0&&bright>0,'dark flowers and bright stamens');
   assert.equal(individualColors.size,1,'one stamen color per individual');
   stamenColors.add([...individualColors][0]);
  }
 }
}
assert.equal(stamenColors.size,2,'catalog seeds include orange and cyan');
for(const stage of stagesForSpecies(b))assert(await verifyApproval(JSON.parse(JSON.stringify(await approveSpecies({...b,recipe:{...b.recipe,stage}})))));

const prototypes=floraSpecies.filter(s=>['prototaxite-a','prototaxite-b'].includes(s.recipe.form));
for(const p of prototypes){
 const exported=JSON.parse(JSON.stringify(p));validateSpecies(exported);
 for(const tree of floraSpecies.filter(s=>s.category==='Trees'))for(const biome of tree.ecology.biomes){
  const rule=tree.ecology,environment={biome,water:rule.aquatic,slope:rule.maxSlope*.5,substrate:rule.requiredSubstrates?.[0]||rule.preferredSubstrates?.[0]||'soil'};
  for(const key of ['temperature','moisture','elevation','latitude','exposure'])if(rule[key])environment[key]=(rule[key][0]+rule[key][1])/2;
  assert(suitability(tree,environment)>0);
  assert(suitability(exported,environment)>0,`${p.id} shares ${tree.id} habitat`);
 }
 const shallows={biome:'mangrove',water:true,waterDepthMeters:.75,slope:.1,substrate:'mud',temperature:27,moisture:.9};
 assert(suitability(exported,shallows)>0);
 for(const patch of [{waterDepthMeters:10},{temperature:-10},{substrate:'rock'},{building:true},{scarred:true},{biome:'lifeless-ice'}])assert.equal(suitability(exported,{...shallows,...patch}),0);
 const corrupt=structuredClone(exported);corrupt.ecology.habitatAlternatives[0].habitatAlternatives=[];assert.throws(()=>validateSpecies(corrupt));
}
console.log('Prototaxite B: spherical buds, dark flowers, colored stamens, exports and A/B tree habitat coverage passed');
