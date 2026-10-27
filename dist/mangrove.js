import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';
import {foliageGeometry} from './interiors-foliage.mjs';

// Red-mangrove form. Root origin is the sediment surface, including under water.
export function generateMangrove(seed,palette){
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),crowns=[],groups=[],anchors=[];
 const range=(a,b)=>a+(b-a)*rng(),polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const add=(a,b)=>a.map((v,k)=>v+b[k]),phase=range(0,Math.PI*2);
 const limb=(a,b,r0,r1)=>wood.branch(a,b,r0,r1,palette.bark,6);
 const at=t=>[.32*t*t,5.1*t,.13*t*t];
 for(let i=0;i<6;i++)limb(at(i/6),at((i+1)/6),.24*(1-i/8),.24*(1-(i+1)/8));
 // Angular, arching supports with smaller forks rooted beyond the main trunk.
 for(let i=0;i<9;i++){
  const a=phase+i*Math.PI*2/9+range(-.16,.16),reach=range(1.5,2.5);
  const start=at(range(.18,.44)),knee=polar(a,reach*.48,range(.55,1.05)),toe=polar(a,reach,.03);
  limb(start,knee,.12,.075);limb(knee,toe,.075,.025);
  const fork=polar(a+range(.18,.4),reach*range(.85,1.15),.02);
  limb(knee,fork,.045,.014);
 }
 function cluster(p,s){
  const start=crowns.length,color=palette.leaf.map(v=>v*range(.88,1.12));
  foliageGeometry(p,s,color,(a,b,c,pigment,kind,alpha,normals)=>{
   for(const [i,q] of [a,b,c].entries())crowns.push(...q,...normals[i],...pigment,1);
  });groups.push([start,crowns.length]);
  anchors.push({position:add(p,[0,-s[1]*.65,0]),size:.14});
 }
 for(let i=0;i<10;i++){
  const t=.43+i*.05,a=phase+i*2.399,start=at(t),reach=range(1.05,1.85)*(1-.35*(t-.4));
  const elbow=add(start,polar(a,reach*.55,.42)),tip=add(start,polar(a,reach,range(.65,1.05)));
  limb(start,elbow,.095,.055);limb(elbow,tip,.055,.02);
  for(const side of [-1,1]){
   const leafTip=add(tip,polar(a+side*.75,range(.25,.5),range(.1,.4)));
   limb(tip,leafTip,.025,.009);cluster(leafTip,[range(.5,.8),range(.45,.7),range(.5,.8)]);
  }
  if(i<3){const root=add(elbow,polar(a,.4,-elbow[1]+.03));limb(elbow,root,.045,.012);}
 }
 cluster(at(1),[.6,.75,.65]);
 const solid=wood.finish().vertices,vertices=new Float32Array(solid.length+crowns.length);
 vertices.set(solid);vertices.set(crowns,solid.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:groups.map(([a,b])=>[a+solid.length,b+solid.length])};
 const {bounds,dimensions}=meshDiagnostics(mesh),scale=6/dimensions[1];
 for(let i=0;i<vertices.length;i+=10)for(let k=0;k<3;k++)vertices[i+k]=(vertices[i+k]-(k===1?bounds.min[1]:0))*scale;
 mesh.produceAnchors=anchors.map(a=>({position:a.position.map((v,k)=>(v-(k===1?bounds.min[1]:0))*scale),size:a.size*scale}));
 return mesh;
}
