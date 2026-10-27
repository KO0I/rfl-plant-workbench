import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {stagesForSpecies,supportsProduce} from '../dist/plant-produce.js';
import {suitability} from '../dist/flora-ecology.js';
const ranges={young:[3,6],mature:[8,12],giant:[12,15]};
for(const s of floraSpecies.filter(s=>s.recipe.form==='tree-fern')){
 assert.equal(supportsProduce(s),false);assert.deepEqual(stagesForSpecies(s),['normal']);
 for(const recipe of [{stage:'flowering'},{stage:'fruiting'},{produce:'nuts'},{heightMeters:15.1},{heightMeters:0},{sizeClass:'unknown'}])assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,...recipe}}));
 for(const seed of s.seeds){
  const p=generateSpecies(s,seed),[lo,hi]=ranges[s.recipe.sizeClass];
  assert(p.height>=lo-1e-5&&p.height<=hi+1e-5);
  assert.equal(p.diagnostics.degenerate,0);assert(p.diagnostics.triangles<6000);
  assert.deepEqual(p.mesh.vertices,generateSpecies(s,seed).mesh.vertices);
  const burnt=generateSpecies({...s,recipe:{...s.recipe,condition:'burnt'}},seed);
  const stem=[];for(let i=0;i<p.mesh.vertices.length;i+=10)if(p.mesh.vertices[i+9]===0)stem.push(...p.mesh.vertices.subarray(i,i+10));
  assert.equal(burnt.mesh.vertices.length,stem.length);
  for(let i=0;i<stem.length;i+=10){assert.deepEqual(Array.from(burnt.mesh.vertices.subarray(i,i+6)),stem.slice(i,i+6));for(let k=6;k<9;k++)assert(Math.abs(burnt.mesh.vertices[i+k]-stem[i+k]*.18)<1e-6);}
  const stump=generateSpecies({...s,recipe:{...s.recipe,condition:'stump'}},seed);assert(stump.height<=.60001);assert.equal(stump.diagnostics.degenerate,0);
 }
 for(const heightMeters of [1,15])assert(Math.abs(generateSpecies({...s,recipe:{...s.recipe,heightMeters}}).height-heightMeters)<1e-5);
 const env={biome:'moist-woodland',water:false,slope:.1,moisture:.8,substrate:'humus'};
 assert(suitability(s,env)>0);assert.equal(suitability(s,{...env,moisture:.1}),0);assert.equal(suitability(s,{...env,water:true}),0);
 assert(await verifyApproval(JSON.parse(JSON.stringify(await approveSpecies(s)))));
}
console.log('Tree ferns: height classes/15 m limit, fronds, no produce, burnt trunks, stumps, moist habitat and exports passed');
