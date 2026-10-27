import {createFloraGeometry,meshDiagnostics} from './faceted-flora.js';
export function supportsTreeCondition(s){
 return s.category==='Trees'||s.recipe.kind==='growth'||(s.recipe.kind==='tree-form'&&s.recipe.form!=='banana')||(s.recipe.kind==='interiors'&&s.recipe.form==='tree');
}
// Cut the existing woody mesh so each seed retains its own root flare and lean.
export function stumpMesh(mesh){
 const {bounds,dimensions}=meshDiagnostics(mesh),cut=bounds.min[1]+Math.min(.6,dimensions[1]*.12);
 const g=createFloraGeometry(),rim=[];
 const area=(a,b,c)=>Math.hypot((b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));
 const tri=(a,b,c,color)=>{if(area(a,b,c)>1e-10)g.tri(a,b,c,color);};
 const v=mesh.vertices;let color=[.5,.35,.2];
 for(let i=0;i<v.length;i+=30){
  if(v[i+9]>.5)continue;
  const points=[0,10,20].map(j=>Array.from(v.slice(i+j,i+j+3))),poly=[];
  const pigment=Array.from(v.slice(i+6,i+9));
  for(let j=0;j<3;j++){
   const a=points[j],b=points[(j+1)%3],inside=a[1]<=cut;
   if(inside)poly.push(a);
   if(inside!==(b[1]<=cut)){
    const t=(cut-a[1])/(b[1]-a[1]),p=a.map((n,k)=>n+(b[k]-n)*t);p[1]=cut;
    poly.push(p);rim.push(p);color=pigment;
   }
  }
  for(let j=1;j<poly.length-1;j++)tri(poly[0],poly[j],poly[j+1],pigment);
 }
 // Convex cross-section seals the cut, including trunks made of several rings.
 const points=[...new Map(rim.map(p=>[p[0].toFixed(7)+','+p[2].toFixed(7),p])).values()].sort((a,b)=>a[0]-b[0]||a[2]-b[2]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
 const half=pts=>{const h=[];for(const p of pts){while(h.length>1&&cross(h.at(-2),h.at(-1),p)<=1e-10)h.pop();h.push(p);}return h;};
 if(points.length>=3){
  const lower=half(points),upper=half([...points].reverse()),hull=[...lower.slice(0,-1),...upper.slice(0,-1)];
  const center=[hull.reduce((n,p)=>n+p[0],0)/hull.length,cut,hull.reduce((n,p)=>n+p[2],0)/hull.length];
  const endgrain=color.map((c,k)=>Math.min(1,c*.65+[.28,.22,.13][k]));
  for(let i=0;i<hull.length;i++)tri(center,hull[(i+1)%hull.length],hull[i],endgrain);
 }
 return {...g.finish(),leafGroups:[],produceAnchors:[]};
}
