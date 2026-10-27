import {canonicalBiome,plantSnowState} from './plant-snow.js';
// Ecology has no geometry or rendering dependencies. Legacy profile is isolated
// until other communities can be migrated with their own placement fixtures.
import {floraSpecies} from './flora-species.js';
export function selectGoldenNauptre({hash,scarred,slope,height,seaLevel,terrainHeight,latitude,cluster}){
 if(scarred||slope>=.58||height<=seaLevel+.3||terrainHeight>=22||latitude>=.9)return null;
 if(hash%100>=18+Math.max(0,cluster)*95)return null;
 let choice=hash%10;for(const id of ['nauptre-cacti','nauptre-bushes','nauptre-joshua']){const s=floraSpecies.find(s=>s.id===id);choice-=s.ecology.weight;if(choice<0)return s.id;}return null;
}
// Generic suitability for new communities. Missing measures use only explicit
// habitat defaults. Amphibious plants require an explicit shallow-water depth.
// temperature is Celsius; moisture is 0–1; waterDepthMeters is above sediment.
// Place root origins on the sediment surface, never on the water surface.
export function suitability(species,environment,defaults={}){
 const e={...defaults,...environment},rule=species.ecology;
 if(rule.habitatAlternatives){
  if(!rule.biomes.some(b=>canonicalBiome(b)===canonicalBiome(e.biome)))return 0;
  return rule.weight*Math.max(0,...rule.habitatAlternatives.map(ecology=>suitability({ecology},e)/ecology.weight));
 }
 if(e.building||e.scarred||typeof e.water!=='boolean'||!Number.isFinite(e.slope)||e.slope>rule.maxSlope)return 0;
 if(rule.waterTolerance==='amphibious'){
  if(e.water&&(!Number.isFinite(e.waterDepthMeters)||e.waterDepthMeters<=0||e.waterDepthMeters>rule.maxWaterDepthMeters))return 0;
 }else if(e.water!==rule.aquatic)return 0;
 if(rule.waterBodyTypes&&!rule.waterBodyTypes.includes(e.waterBodyType))return 0;
 if(rule.maxShoreDistanceMeters!==undefined&&(!Number.isFinite(e.shoreDistanceMeters)||e.shoreDistanceMeters<0||e.shoreDistanceMeters>rule.maxShoreDistanceMeters))return 0;
 if(rule.requiredSubstrates&&!rule.requiredSubstrates.includes(e.substrate))return 0;
 if(!rule.biomes.some(b=>canonicalBiome(b)===canonicalBiome(e.biome)))return 0;
 let score=rule.weight;
 for(const key of ['temperature','moisture','elevation','latitude','exposure']){const range=rule[key];if(!range)continue;const v=e[key];if(!Number.isFinite(v))return 0;const [lo,hi]=range;if(v<lo||v>hi)return 0;score*=.25+.75*(1-Math.abs((v-lo)/(hi-lo)*2-1));}
 // Soft preferences preserve habitat and land/water constraints above.
 if(rule.preferredSubstrates?.includes(e.substrate))score*=2;
 if(rule.preferredRiverDistanceMeters&&Number.isFinite(e.riverDistanceMeters)&&e.riverDistanceMeters>=0&&e.riverDistanceMeters<=rule.preferredRiverDistanceMeters)score*=1+2*(1-e.riverDistanceMeters/rule.preferredRiverDistanceMeters);
 return score;
}
export function selectCommunitySpecies(species,environment,hash,defaults={}){
 const e={...defaults,...environment};
 const candidates=species.map(s=>{
  const weight=suitability(s,e);if(!weight)return [s,0];
  if((e.snowDepthMeters??0)>0||e.snowSurfaceElevationMeters!==undefined){
   const heightMeters=e.plantHeights?.[s.id];
   if(heightMeters===undefined)throw Error('Snow placement requires actual variant heights');
   if(plantSnowState(s,e,hash,{heightMeters,baseElevationMeters:e.baseElevationMeters??0,scale:e.plantScale??1}).buried)return [s,0];
  }
  return [s,weight];
 }).filter(([,w])=>w>0),total=candidates.reduce((n,[,w])=>n+w,0);let cursor=(hash>>>0)/4294967296*total;
 for(const [s,w] of candidates){cursor-=w;if(cursor<0)return s.id;}return null;
}
