import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

// Reference-led palm-like silhouette, with fine forked sprays instead of palm leaves.
export function generateCalamophyton(seed,palette){
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),sprays=createFloraGeometry(seed);
 const range=(a,b)=>a+(b-a)*rng(),polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const add=(a,b)=>a.map((v,k)=>v+b[k]);
 const produceAnchors=[];
 const height=range(4,6),phase=range(0,Math.PI*2),lean=range(.03,.12);
 const at=t=>[lean*t*t,3.75*t,0];
 const levels=[[0,.33],[.08,.25],[.25,.14],[.62,.105],[1,.13]];
 for(let i=1;i<levels.length;i++)wood.branch(at(levels[i-1][0]),at(levels[i][0]),levels[i-1][1],levels[i][1],palette.bark,7);
 // Short shed-branch stubs spiral up the slender trunk.
 for(let i=0;i<38;i++){
  const t=.18+i*.021,a=phase+i*2.399,p=add(at(t),polar(a,.105,0));
  wood.branch(p,add(p,polar(a,range(.035,.065),.025)),.025,.012,palette.bark.map(v=>v*.61),4);
 }
 for(let i=0;i<12;i++){
  const a=phase+i*2.399,base=at(range(.91,1)),reach=range(.85,1.4);
  const elbow=add(base,polar(a,reach*.48,range(.27,.48)));
  wood.branch(base,elbow,.045,.022,palette.bark,5);
  for(const side of [-1,1]){
   const angle=a+side*.25,tip=add(elbow,polar(angle,reach*.52,range(.17,.36)));
   wood.branch(elbow,tip,.022,.008,palette.bark,4);
   produceAnchors.push({position:tip,size:.16});
   for(let j=0;j<3;j++){
    const t=.3+j*.25,start=elbow.map((v,k)=>v+(tip[k]-v)*t);
    for(const fork of [-1,1]){
     const b=angle+fork*range(.35,.85),end=add(start,polar(b,range(.18,.36),range(.05,.19)));
     sprays.branch(start,end,.009,.003,palette.leaf,3);
     for(const twig of [-1,1])sprays.branch(end,add(end,polar(b+twig*.35,range(.08,.16),.05)),.004,.0015,palette.leaf,3);
    }
   }
  }
 }
 const stem=wood.finish().vertices,green=sprays.finish().vertices;
 for(let i=9;i<green.length;i+=10)green[i]=1;
 const vertices=new Float32Array(stem.length+green.length);vertices.set(stem);vertices.set(green,stem.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:[[stem.length,vertices.length]]};
 const {bounds,dimensions}=meshDiagnostics(mesh),scale=height/dimensions[1];
 for(let i=0;i<vertices.length;i+=10)for(let k=0;k<3;k++)vertices[i+k]=(vertices[i+k]-(k===1?bounds.min[1]:0))*scale;
 mesh.produceAnchors=produceAnchors.map(a=>({position:a.position.map((v,k)=>(v-(k===1?bounds.min[1]:0))*scale),size:a.size*scale}));
 return mesh;
}
