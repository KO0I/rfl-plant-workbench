import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';
import {TUSSOCK_PROFILES} from './tussock-profiles.js';

export function generateTussock(recipe,seed,palette){
 const p=TUSSOCK_PROFILES[recipe.ecotype],rng=seededRandom(seed),g=createFloraGeometry(seed);
 const height=p.height[0]+rng()*(p.height[1]-p.height[0]),phase=rng()*Math.PI*2;
 for(let i=0;i<p.blades;i++){
  const a=phase+i*2.399,r=.025+rng()*.11,reach=p.spread*(.35+rng()*.65),h=i===0?1:.45+rng()*.5;
  const point=t=>[Math.cos(a)*(r+reach*t*t),h*t*(1-p.arch*.22*t),Math.sin(a)*(r+reach*t*t)];
  const side=[-Math.sin(a),0,Math.cos(a)],width=.014+rng()*.016;
  const col=palette.leaf.map((v,k)=>v*(.78+rng()*.22)+(i%6===0?palette.bark[k]*.18:0));
  for(let j=0;j<5;j++){
   const t=j/5,u=(j+1)/5,b=point(t),tip=point(u),w=width*(1-t),v=width*(1-u);
   const L=b.map((n,k)=>n-side[k]*w),R=b.map((n,k)=>n+side[k]*w),A=tip.map((n,k)=>n-side[k]*v),B=tip.map((n,k)=>n+side[k]*v);
   for(const [x,y,z]of j===4?[[L,R,tip]]:[[L,R,A],[R,B,A]]){g.tri(x,y,z,col,1);g.tri(z,y,x,col,1);}
  }
 }
 const mesh=g.finish(),scale=height/meshDiagnostics(mesh).dimensions[1];
 for(let i=0;i<mesh.vertices.length;i+=10)for(let k=0;k<3;k++)mesh.vertices[i+k]*=scale;
 mesh.tussockHeight=height;mesh.leafGroups=[];return mesh;
}
export function attachTussockHeads(mesh,s,seed){
 if(!s.recipe.stage||s.recipe.stage==='normal')return mesh;
 const rng=seededRandom(seed+103),g=createFloraGeometry(seed),h=mesh.tussockHeight;
 const color=s.recipe.stage==='flowering'?s.palette.flower:s.palette.bark.map(v=>Math.min(1,v*1.15));
 for(let i=0;i<7;i++){
  const a=i*2.399,r=h*(.035+rng()*.07),x=Math.cos(a)*r,z=Math.sin(a)*r,top=h*(.80+rng()*.14);
  g.branch([x,0,z],[x,top,z],h*.004,h*.0015,s.palette.bark,3);
  for(let j=0;j<5;j++)for(const side of [-1,1]){
   const y=top-h*(.03+j*.035),b=a+side*1.1,reach=h*(.025+j*.007),tip=[x+Math.cos(b)*reach,y+h*.02,z+Math.sin(b)*reach];
   g.branch([x,y,z],tip,h*.0018,h*.0006,color,3);
   g.leaf(tip,[tip[0],tip[1]+h*.025,tip[2]+h*.006],h*.009,h*.001,color);
  }
 }
 const heads=g.finish().vertices,vertices=new Float32Array(mesh.vertices.length+heads.length);vertices.set(mesh.vertices);vertices.set(heads,mesh.vertices.length);
 return {...mesh,vertices,count:vertices.length/10};
}
