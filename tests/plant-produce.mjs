import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {supportsProduce,defaultProduce,PRODUCE_KINDS,produceGeometry,PRODUCE_COLORS} from '../dist/plant-produce.js';
import {meshDiagnostics} from '../dist/faceted-flora.js';
import {supportsSeasons,SEASONS} from '../dist/plant-seasons.js';
for(const kind of [...PRODUCE_KINDS,'flower']){const v=produceGeometry(kind,PRODUCE_COLORS[kind]||[.9,.2,.5]);assert.equal(meshDiagnostics(v).degenerate,0);}
for(const s of floraSpecies.filter(supportsProduce))for(const seed of s.seeds){
 const base={...s,recipe:{...s.recipe,stage:'normal',heightMeters:3}},normal=generateSpecies(base,seed);
 for(const stage of ['flowering','fruiting'])for(const produce of PRODUCE_KINDS){
  const source={...base,recipe:{...base.recipe,stage,produce}},v=generateSpecies(source,seed);
  assert(v.mesh.vertices.length>normal.mesh.vertices.length,s.id+' has reproductive geometry');
  assert.deepEqual(v.mesh.vertices.subarray(0,normal.mesh.vertices.length),normal.mesh.vertices,'stage preserves scaled body');
  assert.deepEqual(v.mesh.frameDiagnostics,normal.mesh.frameDiagnostics,'stage keeps framing');
  assert.equal(v.diagnostics.degenerate,0);assert(v.diagnostics.triangles<12000);
  assert.deepEqual(v.mesh.vertices,generateSpecies(source,seed).mesh.vertices,'deterministic stages');
 }
 if(supportsSeasons(s))for(const season of SEASONS)generateSpecies({...s,recipe:{...s.recipe,season,stage:'fruiting',produce:'berries'}},seed);
}
assert.equal(defaultProduce(floraSpecies.find(s=>s.id==='tree-evergreen')),'pinecones');
for(const id of ['xpm-cactus-low','tree-evergreen','plant-desert-rose']){
 const s=structuredClone(floraSpecies.find(s=>s.id===id));s.recipe={...s.recipe,stage:'fruiting',produce:'berries',produceColor:[.18,.25,.8],produceCount:3,produceScale:1.8};const a=await approveSpecies(s);assert(await verifyApproval(JSON.parse(JSON.stringify(a))));a.recipe.produceColor=[.9,.1,.1];assert.equal(await verifyApproval(a),false);
}
const invalid=structuredClone(floraSpecies.find(s=>s.id==='xpm-cactus-low'));for(const [key,value]of[['stage','invalid'],['produce','invalid'],['produceCount',100],['produceScale',Infinity],['produceColor',[1,NaN,0]]])assert.throws(()=>validateSpecies({...invalid,recipe:{...invalid.recipe,[key]:value}}));
console.log('Produce shapes, all plant stages/seeds, season combinations, scaled-body/frame stability and exports passed');
