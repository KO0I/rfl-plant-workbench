import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,generatePlacedSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {plantSnowState} from '../dist/plant-snow.js';
import {selectCommunitySpecies,suitability} from '../dist/flora-ecology.js';
const grass=floraSpecies.find(s=>s.id==='grass-tussock-tundra'),tree=floraSpecies.find(s=>s.id==='tree-evergreen');
const env={biome:'tundra',water:false,slope:.1,exposure:.8,moisture:.6,temperature:-3,snowCover:1,snowDepthMeters:.1};
let snowy=0;for(let seed=0;seed<100;seed++){const a=plantSnowState(grass,env,seed,{heightMeters:1});assert.deepEqual(a,plantSnowState(grass,env,seed,{heightMeters:1}));if(a.dusted)snowy++;}
assert(snowy>20&&snowy<90);
for(const patch of [{snowCover:0},{temperature:10},{biome:'tropical'}])assert.equal(plantSnowState(grass,{...env,...patch},7,{heightMeters:1}).dusted,false);
for(const snowDepthMeters of [-1,NaN])assert.throws(()=>plantSnowState(grass,{...env,snowDepthMeters},7,{heightMeters:1}));
for(const s of [grass,tree,floraSpecies.find(s=>s.id==='tree-ginkgo-female')]){
 const plain=generateSpecies(s),source={...s,recipe:{...s.recipe,snowDusting:'dusted'}},snow=generateSpecies(source);
 assert.notDeepEqual(snow.mesh.vertices,plain.mesh.vertices);assert.deepEqual(snow.diagnostics,plain.diagnostics);
 for(let i=0;i<plain.mesh.vertices.length;i+=10){assert.deepEqual(snow.mesh.vertices.subarray(i,i+6),plain.mesh.vertices.subarray(i,i+6));}
 for(let i=0;i<plain.mesh.vertices.length;i+=30){const v=plain.mesh.vertices,a=[0,1,2].map(k=>v[i+10+k]-v[i+k]),b=[0,1,2].map(k=>v[i+20+k]-v[i+k]);if(a[2]*b[0]-a[0]*b[2]<=0)for(let j=0;j<30;j+=10)assert.deepEqual(snow.mesh.vertices.subarray(i+j+6,i+j+9),v.subarray(i+j+6,i+j+9));}
 const h=plain.diagnostics.bounds.max[1];
 assert.equal(generatePlacedSpecies(s,s.seeds[0],{...env,snowDepthMeters:h}),null);
 assert(generatePlacedSpecies(s,s.seeds[0],{...env,snowDepthMeters:h-.001}));
 assert(generatePlacedSpecies(s,s.seeds[0],{...env,snowDepthMeters:h},{scale:2}));
 assert.equal(generatePlacedSpecies(s,s.seeds[0],{...env,snowSurfaceElevationMeters:10+h},{baseElevationMeters:10}),null);
 assert(await verifyApproval(JSON.parse(JSON.stringify(await approveSpecies(source)))));
}
assert.equal(selectCommunitySpecies([grass],{...env,plantHeights:{[grass.id]:.05}},123),null);
assert.equal(selectCommunitySpecies([grass],{...env,plantHeights:{[grass.id]:.5}},123),grass.id);
const boreal=floraSpecies.find(s=>s.id==='grass-tussock-boreal');
for(const biome of ['taiga','tiaga','boreal-forest'])assert(suitability(boreal,{...env,biome})>0);
assert(floraSpecies.find(s=>s.id==='grass-tussock-desert').ecology.snow.biomes.includes('high-desert'));
const oak=floraSpecies.find(s=>s.id==='tree-oak');assert(suitability(oak,{...env,biome:'deciduous-forest'})>0);
const palm=floraSpecies.find(s=>s.id==='tree-palm');assert.throws(()=>validateSpecies({...palm,recipe:{...palm.recipe,snowDusting:'dusted'}}));
console.log('Snow: deterministic chance, cold biomes/aliases, upward-only dusting, scaled/elevated burial, selection and exports passed');

assert.throws(()=>selectCommunitySpecies([grass],env,123),/actual variant heights/);
