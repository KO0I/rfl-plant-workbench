import {seededRandom} from './faceted-flora.js';
export const COLD_BIOMES=['moorland','heathland','high-desert','taiga','boreal-forest','deciduous-forest','temperate-forest','temperate-woodland','woodland','moist-woodland','montane-forest','alpine','rocky-upland','tundra','steppe','dry-grassland','prairie','grassland','riparian','wetland-edge','pond-edge','freshwater-marsh','floodplain','garden','temperate-garden','orchard'];
export const canonicalBiome=b=>({tiaga:'boreal-forest',taiga:'boreal-forest','deciduous-forest':'temperate-woodland','cold-deciduous-forest':'temperate-woodland'}[b]||b);
export const supportsSnow=s=>!!s.ecology?.snow?.biomes?.length;
// All elevations/depths are metres along the local surface normal. Base remains
// anchored to terrain, never lifted onto snow. Runtime can use this with baked bounds.
export function plantSnowState(s,e,seed,{heightMeters,baseElevationMeters=0,scale=1}){
 if(!Number.isFinite(heightMeters)||heightMeters<=0||!Number.isFinite(scale)||scale<=0||!Number.isFinite(baseElevationMeters))throw Error('Invalid placed plant dimensions');
 const depth=e.snowDepthMeters??0,cover=e.snowCover??0;
 if(!Number.isFinite(depth)||depth<0||!Number.isFinite(cover)||cover<0||cover>1)throw Error('Invalid local snow conditions');
 if(e.snowSurfaceElevationMeters!==undefined&&!Number.isFinite(e.snowSurfaceElevationMeters))throw Error('Invalid snow surface elevation');
 const snowSurface=e.snowSurfaceElevationMeters??baseElevationMeters+depth;
 const buried=(depth>0||e.snowSurfaceElevationMeters!==undefined)&&baseElevationMeters+heightMeters*scale<=snowSurface;
 const allowed=s.ecology.snow?.biomes.some(b=>canonicalBiome(b)===canonicalBiome(e.biome));
 const cold=e.temperature===undefined||(Number.isFinite(e.temperature)&&e.temperature<=2);
 const chance=(s.ecology.snow?.chance??0)*cover;
 return {buried,dusted:!buried&&!!allowed&&cold&&seededRandom(seed)()<chance,snowSurfaceElevationMeters:snowSurface};
}
export function dustPlantMesh(mesh,seed){
 const vertices=new Float32Array(mesh.vertices),rng=seededRandom(seed+719);
 for(let i=0;i<vertices.length;i+=30){
  const a=[0,1,2].map(k=>vertices[i+10+k]-vertices[i+k]),b=[0,1,2].map(k=>vertices[i+20+k]-vertices[i+k]);
  const n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const upward=n[1]/Math.hypot(...n),patch=rng();
  if(upward<=.12||patch>.35+.55*upward)continue;
  const strength=.72+.20*upward;
  for(let j=0;j<30;j+=10){
   for(let k=0;k<3;k++)vertices[i+j+6+k]=vertices[i+j+6+k]*(1-strength)+[.87,.91,.95][k]*strength;
   if(vertices[i+j+9]>1.5)vertices[i+j+9]=1;
  }
 }
 return {...mesh,vertices};
}
