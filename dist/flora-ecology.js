// Ecology has no geometry or rendering dependencies. Legacy profile is isolated
// until other communities can be migrated with their own placement fixtures.
import {floraSpecies} from './flora-species.js';
export function selectGoldenNauptre({hash,scarred,slope,height,seaLevel,terrainHeight,latitude,cluster}){
 if(scarred||slope>=.58||height<=seaLevel+.3||terrainHeight>=22||latitude>=.9)return null;
 if(hash%100>=18+Math.max(0,cluster)*95)return null;
 let choice=hash%10;for(const s of floraSpecies){choice-=s.ecology.weight;if(choice<0)return s.id;}return null;
}
// Generic suitability for new communities. Missing measures use only explicit
// habitat defaults. Obstacles and aquatic mismatch always reject placement.
export function suitability(species,environment,defaults={}){
 const e={...defaults,...environment},rule=species.ecology;
 if(e.building||e.scarred||e.water===undefined||e.water!==rule.aquatic||!Number.isFinite(e.slope)||e.slope>rule.maxSlope)return 0;
 if(!rule.biomes.includes(e.biome))return 0;
 let score=rule.weight;
 for(const key of ['temperature','moisture','elevation','latitude','exposure']){const range=rule[key];if(!range)continue;const v=e[key];if(!Number.isFinite(v))return 0;const [lo,hi]=range;if(v<lo||v>hi)return 0;score*=.25+.75*(1-Math.abs((v-lo)/(hi-lo)*2-1));}
 return score;
}
export function selectCommunitySpecies(species,environment,hash,defaults={}){
 const candidates=species.map(s=>[s,suitability(s,environment,defaults)]).filter(([,w])=>w>0),total=candidates.reduce((n,[,w])=>n+w,0);let cursor=(hash>>>0)/4294967296*total;
 for(const [s,w] of candidates){cursor-=w;if(cursor<0)return s.id;}return null;
}
