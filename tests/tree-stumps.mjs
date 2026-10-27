import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {supportsTreeCondition} from '../dist/tree-condition.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {suitability} from '../dist/flora-ecology.js';
let count=0;
for(const s of floraSpecies.filter(supportsTreeCondition)){
 for(const seed of s.seeds){
  const whole=generateSpecies(s,seed),stump=generateSpecies({...s,recipe:{...s.recipe,condition:'stump'}},seed);
  assert(stump.height<=.60001&&stump.height>0,s.id+' stump height');
  assert.equal(stump.diagnostics.degenerate,0,s.id);
  assert(stump.mesh.count<whole.mesh.count,s.id+' removes crown');
  assert.deepEqual(stump.mesh.frameDiagnostics,whole.mesh.frameDiagnostics);
  assert(Math.abs(stump.diagnostics.bounds.min[1]-whole.diagnostics.bounds.min[1])<1e-5);
  assert(!stump.mesh.vertices.some((v,i)=>i%10===9&&v===1),'no foliage');
  const top=stump.diagnostics.bounds.max[1];
  assert(stump.mesh.vertices.some((v,i)=>i%10===1&&Math.abs(v-top)<1e-5&&stump.mesh.vertices[i+3]>.99),'upward cut cap');
  count++;
 }
 const exported=await approveSpecies({...s,seeds:[s.seeds[0]],recipe:{...s.recipe,condition:'stump'}});
 assert(await verifyApproval(JSON.parse(JSON.stringify(exported))));
}
const cal=floraSpecies.find(s=>s.id==='tree-calamophyton');
const base={biome:'riparian',water:false,slope:.1,substrate:'rock',riverDistanceMeters:200};
const baseline=suitability(cal,base);
assert(baseline>0);
for(const substrate of ['sand','mud'])assert(suitability(cal,{...base,substrate})>baseline);
assert(suitability(cal,{...base,riverDistanceMeters:5})>baseline);
assert.equal(suitability(cal,{...base,substrate:'mud',riverDistanceMeters:5,water:true}),0);
assert.equal(suitability(cal,{...base,building:true}),0);
assert.throws(()=>validateSpecies({...cal,ecology:{...cal.ecology,preferredRiverDistanceMeters:-1}}));
console.log(`${count} tree stump variants: cut caps, roots, framing, exports and habitat preferences passed`);
