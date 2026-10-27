import assert from 'node:assert/strict';
import {floraSpecies,validateSpecies} from '../dist/flora-species.js';
import {generateSpecies,approveSpecies,verifyApproval} from '../dist/flora-authoring.js';
import {SEASONS,supportsSeasons} from '../dist/plant-seasons.js';
const wood=mesh=>{const out=[];for(let i=0;i<mesh.vertices.length;i+=30)if(mesh.vertices[i+9]<.5)out.push(...mesh.vertices.subarray(i,i+30));return out;};
for(const s of floraSpecies){
 if(s.recipe.kind==='botanical')for(const seed of s.seeds){const m=generateSpecies(s,seed);assert.equal(m.diagnostics.degenerate,0);assert(m.diagnostics.triangles<6000);assert.deepEqual(m.mesh.vertices,generateSpecies(s,seed).mesh.vertices);}
 if(supportsSeasons(s))for(const seed of s.seeds){
  const summer=generateSpecies(s,seed),original=wood(summer.mesh);
  for(const season of SEASONS){const source={...s,recipe:{...s.recipe,season}},v=generateSpecies(source,seed);assert.deepEqual(wood(v.mesh),original,s.id+' branch preservation '+season);assert.deepEqual(v.mesh.frameDiagnostics,summer.mesh.frameDiagnostics,'stable framing');assert.equal(v.diagnostics.degenerate,0);
   if(season==='winter'){assert.equal(v.mesh.vertices.length,original.length);assert(v.mesh.vertices.length<summer.mesh.vertices.length);}
   if(season==='spring'||season==='fall')assert.notDeepEqual(v.mesh.vertices,summer.mesh.vertices);
  }
 }
}
for(const id of ['plant-desert-rose','plant-fern','plant-baobab','plant-saguaro','plant-barrel-cactus','plant-prickly-pear','tree-willow']){
 const s=structuredClone(floraSpecies.find(s=>s.id===id));if(supportsSeasons(s))s.recipe.season='winter';const a=await approveSpecies(s);assert(await verifyApproval(JSON.parse(JSON.stringify(a))));
}
const palm=structuredClone(floraSpecies.find(s=>s.id==='tree-palm'));palm.recipe.season='winter';assert.throws(()=>validateSpecies(palm),/Invalid season/);
const tree={...structuredClone(floraSpecies[2]),id:'test-growth',recipe:{kind:'growth',height:4,depth:2,forks:3,spread:.6,foliage:1,flowers:0},seeds:[42]};assert(generateSpecies({...tree,recipe:{...tree.recipe,season:'winter'}}).mesh.vertices.length<generateSpecies(tree).mesh.vertices.length);
console.log('24 botanical variants, seasonal branch/frame preservation, export and validation passed');
