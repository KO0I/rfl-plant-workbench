import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,generatePlacedSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {suitability} from '../dist/flora-ecology.js';
import {stagesForSpecies} from '../dist/plant-produce.js';
const s=floraSpecies.find(s=>s.id==='plant-shield-fern');
assert.deepEqual(stagesForSpecies(s),['normal']);
for(const seed of s.seeds){
 const p=generateSpecies(s,seed);assert(p.height>=.3&&p.height<=1.2);assert.equal(p.diagnostics.degenerate,0);assert(p.diagnostics.triangles<4000);
 assert.deepEqual(p.mesh.vertices,generateSpecies(s,seed).mesh.vertices);
 const snowy=generateSpecies({...s,recipe:{...s.recipe,snowDusting:'dusted'}},seed);assert.notDeepEqual(snowy.mesh.vertices,p.mesh.vertices);assert.deepEqual(snowy.diagnostics,p.diagnostics);
 assert.equal(generatePlacedSpecies(s,seed,{biome:'cold-deciduous-forest',snowDepthMeters:p.height}),null);
 assert(generatePlacedSpecies(s,seed,{biome:'cold-deciduous-forest',snowDepthMeters:p.height-.01}));
}
for(const biome of ['woodland','deciduous-forest','cold-deciduous-forest','montane-forest'])assert(suitability(s,{biome,water:false,moisture:.7,exposure:.2,slope:.1})>0);
for(const patch of [{biome:'tundra'},{biome:'desert'},{biome:'boreal-forest'},{water:true},{moisture:.1},{exposure:1}])assert.equal(suitability(s,{biome:'woodland',water:false,moisture:.7,exposure:.2,slope:.1,...patch}),0);
for(const recipe of [{heightMeters:1.21},{heightMeters:.29},{stage:'fruiting'},{stage:'flowering'},{produce:'fruit'},{condition:'stump'}])assert.throws(()=>validateSpecies({...s,recipe:{...s.recipe,...recipe}}));
for(const heightMeters of [.3,1.2])assert(Math.abs(generateSpecies({...s,recipe:{...s.recipe,heightMeters}}).height-heightMeters)<1e-5);
assert(await verifyApproval(JSON.parse(JSON.stringify(await approveSpecies(s)))));
console.log('Shield fern: rosettes, scale, cold deciduous habitats, snow/burial, stages and exports passed');
