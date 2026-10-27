import {attachProduce} from './plant-produce.js';
import {generateXpmCactus} from './xpm-cacti.js';
import {generateBotanical} from './botanical-plants.js';
import {applySeason,supportsSeasons} from './plant-seasons.js';
import {generateTreeForm} from './tree-forms.js';
import {interiorsPlant} from './interiors-plants.js';
// Workbench + offline builder entry point. Never imported by gameplay.
import {createSpeciesRegistry,validateSpecies} from './flora-species.js';
import {nauptreFlora} from './nauptre-flora.js';
import {growFlora,meshDiagnostics} from './faceted-flora.js';
export {createSpeciesRegistry};
export function generateSpecies(s,seed=s.seeds[0]){
 validateSpecies(s);if(!s.seeds.includes(seed))throw Error('Seed must belong to the species approved variant set');
 let mesh,conversion=null;
 if(s.recipe.kind==='nauptre-golden'){
  if(!['nauptre-cacti','nauptre-bushes','nauptre-joshua'].includes(s.recipe.group))throw Error('Unknown golden recipe');
  const legacy=nauptreFlora(s.recipe.group,{flowers:s.recipe.stage===undefined})[seed];if(!legacy)throw Error('Unknown golden variant');
  mesh={vertices:new Float32Array(legacy.mesh.vertices),count:legacy.mesh.count,produceAnchors:legacy.mesh.produceAnchors?.map(a=>({...a,position:a.position.map(v=>v*legacy.height),size:a.size*legacy.height}))};
  // Explicit one-time legacy adapter: old renderer applied this multiplier.
  // Preserve its exact appearance in local meters, not its misleading label.
  conversion={kind:'legacy-normalized-to-meters',multiplier:legacy.height};
  for(let i=0;i<mesh.vertices.length;i+=10)for(let k=0;k<3;k++)mesh.vertices[i+k]*=legacy.height;
 }else if(s.recipe.kind==='interiors')mesh=interiorsPlant(s.recipe,seed);
 else if(s.recipe.kind==='tree-form')mesh=generateTreeForm(s.recipe,seed,s.palette);
 else if(s.recipe.kind==='botanical')mesh=generateBotanical(s.recipe,seed,s.palette);
 else if(s.recipe.kind==='xpm-cactus')mesh=generateXpmCactus(s.recipe,seed,s.palette);
 else if(s.recipe.kind==='growth')mesh=growFlora(s.recipe,seed,s.palette);
 else {mesh={vertices:new Float32Array(s.recipe.vertices),count:s.recipe.vertices?.length/10};}
 const framingMesh={vertices:new Float32Array(mesh.vertices),count:mesh.count};
 mesh=attachProduce(mesh,s,seed);
 if(s.recipe.heightMeters!==undefined){const original=meshDiagnostics(framingMesh),scale=s.recipe.heightMeters/original.dimensions[1];if(!Number.isFinite(scale)||scale<=0||scale>100)throw Error('Invalid height override');for(let i=0;i<mesh.vertices.length;i+=10)for(let k=0;k<3;k++)mesh.vertices[i+k]*=scale;for(let i=0;i<framingMesh.vertices.length;i+=10)for(let k=0;k<3;k++)framingMesh.vertices[i+k]*=scale;}
 if(s.recipe.tint){if(s.recipe.tint.length!==3||!s.recipe.tint.every(x=>Number.isFinite(x)&&x>=0&&x<=2))throw Error('Invalid tint');for(let i=0;i<mesh.vertices.length;i+=10)for(let k=0;k<3;k++)mesh.vertices[i+6+k]=Math.min(1,mesh.vertices[i+6+k]*s.recipe.tint[k]);}
 const frameDiagnostics=meshDiagnostics(framingMesh);
 if(supportsSeasons(s))mesh=applySeason(mesh,s.recipe.season||'summer',s.recipe.form);
 mesh.frameDiagnostics=frameDiagnostics;
 mesh.foliage=s.rendering.foliage==='interiors-coarse-v1';
 const diagnostics=meshDiagnostics(mesh);if((diagnostics.nonFlat&&!['interiors','tree-form','botanical'].includes(s.recipe.kind))||diagnostics.degenerate)throw Error('Mesh must have nondegenerate flat-shaded triangles');
 return {id:s.id+'-'+seed,speciesId:s.id,seed,mesh,diagnostics,units:'m',height:diagnostics.dimensions[1],conversion};
}
export function canonicalJSON(value){if(Array.isArray(value))return '['+value.map(canonicalJSON).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalJSON(value[k])).join(',')+'}';return JSON.stringify(value);}
export async function contentHash(value){const bytes=new TextEncoder().encode(canonicalJSON(value));return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');}
export async function approveSpecies(species){const source=structuredClone(species);delete source.approval;const variants=source.seeds.map(seed=>generateSpecies(source,seed));const payload={source,variants:variants.map(v=>({seed:v.seed,vertices:Array.from(v.mesh.vertices)}))};return {...source,approval:{algorithm:'sha256',digest:await contentHash(payload),generatorVersion:1}};}
export async function verifyApproval(species){if(!species.approval)return false;const approved=await approveSpecies(species);return species.approval.digest===approved.approval.digest&&species.approval.generatorVersion===1;}
