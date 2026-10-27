import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {suitability} from '../dist/flora-ecology.js';
import {stagesForSpecies,supportsProduce} from '../dist/plant-produce.js';
const presets=floraSpecies.filter(s=>s.recipe.form==='cattail');
assert.equal(presets.length,2);
for(const s of presets){
 assert.deepEqual(stagesForSpecies(s),['normal','fruiting']);assert.equal(supportsProduce(s),false);
 for(const seed of s.seeds){
  const bare=generateSpecies({...s,recipe:{...s.recipe,stage:'normal'}},seed);
  const headed=generateSpecies({...s,recipe:{...s.recipe,stage:'fruiting'}},seed);
  assert(bare.height>=2&&bare.height<=3);assert.equal(headed.height,bare.height);
  assert.equal(headed.diagnostics.degenerate,0);assert(headed.diagnostics.triangles<3000);
  assert.equal(headed.mesh.cattailHeads.length,7);
  assert.deepEqual(headed.mesh.vertices.subarray(0,bare.mesh.vertices.length),bare.mesh.vertices);
  assert(headed.mesh.count>bare.mesh.count);
  assert.deepEqual(headed.mesh.frameDiagnostics,bare.mesh.frameDiagnostics);
  assert.deepEqual(headed.mesh.vertices,generateSpecies({...s,recipe:{...s.recipe,stage:'fruiting'}},seed).mesh.vertices);
  for(const heightMeters of [2,3])assert(Math.abs(generateSpecies({...s,recipe:{...s.recipe,heightMeters}},seed).height-heightMeters)<1e-5);
 }
 for(const heightMeters of [1.9,3.1,NaN])assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,heightMeters}}));
 const env={biome:'pond-edge',water:false,slope:.05,substrate:'mud',waterBodyType:'pond',shoreDistanceMeters:1};
 assert(suitability(s,env)>0);assert(suitability(s,{...env,water:true,waterDepthMeters:.3})>0);
 for(const patch of [{substrate:'sand'},{waterBodyType:'sea'},{waterBodyType:'lake'},{waterBodyType:undefined},{shoreDistanceMeters:undefined},{shoreDistanceMeters:4},{shoreDistanceMeters:-1},{water:true,waterDepthMeters:.6},{water:true,waterDepthMeters:undefined}])assert.equal(suitability(s,{...env,...patch}),0);
 const exported=JSON.parse(JSON.stringify(await approveSpecies(s)));assert(await verifyApproval(exported));
 assert.deepEqual(exported.ecology.waterBodyTypes,['pond','pool','small-lake']);
}
console.log('Cattails: 2–3 m, headed/headless stages, mud/shore/depth placement and exports passed');
