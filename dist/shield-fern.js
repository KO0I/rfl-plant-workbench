import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

export function generateShieldFern(seed,palette){
 const rng=seededRandom(seed),g=createFloraGeometry(seed),phase=rng()*Math.PI*2,height=.3+rng()*.9;
 const polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r],add=(a,b)=>a.map((v,k)=>v+b[k]);
 // Basal rosette: ten lance-shaped fronds, with paired pointed, toothed pinnae.
 for(let i=0;i<10;i++){
  const a=phase+i*2.399,reach=.7+rng()*.45,rise=.75+rng()*.35;
  const at=t=>polar(a,.03+reach*t,rise*Math.sin(t*Math.PI*.7)+.04*t);
  for(let j=0;j<8;j++)g.branch(at(j/8),at((j+1)/8),.009*(1-j/9),.009*(1-(j+1)/9),palette.bark,3);
  for(let j=0;j<11;j++)for(const side of [-1,1]){
   const t=.13+j*.075,p=at(t),b=a+side*1.1,length=(.04+.32*Math.sin(t*Math.PI))*(.95-t*.35);
   const tip=add(p,polar(b,length,.025)),color=palette.leaf.map(v=>v*(.8+rng()*.2));
   g.leaf(p,tip,length*.34,.012,color);
   for(let tooth=0;tooth<2;tooth++){
    const u=.3+tooth*.3,base=p.map((v,k)=>v+(tip[k]-v)*u);
    g.leaf(base,add(base,polar(b+side*.6,length*(1-u)*.55,.012)),length*.17,.006,color);
   }
  }
 }
 const mesh=g.finish();for(let i=9;i<mesh.vertices.length;i+=10)mesh.vertices[i]=1;
 const d=meshDiagnostics(mesh),scale=height/d.dimensions[1];
 for(let i=0;i<mesh.vertices.length;i+=10)for(let k=0;k<3;k++)mesh.vertices[i+k]=(mesh.vertices[i+k]-(k===1?d.bounds.min[1]:0))*scale;
 mesh.leafGroups=[];mesh.produceAnchors=[];return mesh;
}
