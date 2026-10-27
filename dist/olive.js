import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

export function generateOlive(seed,palette){
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),leaves=createFloraGeometry(seed),groups=[],anchors=[];
 const range=(a,b)=>a+(b-a)*rng(),phase=range(0,6.283),height=range(4,8);
 const add=(a,b)=>a.map((v,k)=>v+b[k]),polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const limb=(a,b,r0,r1)=>wood.branch(a,b,r0,r1,palette.bark,7);
 const trunk=t=>[Math.sin(t*4+phase)*.26*t,2.5*t,Math.cos(t*5+phase)*.22*t];
 for(let j=0;j<8;j++)limb(trunk(j/8),trunk((j+1)/8),.36*(1-.55*j/8),.36*(1-.55*(j+1)/8));
 // Irregular roots and twisting ridges keep the short trunk visibly gnarled.
 for(let i=0;i<5;i++){
  const a=phase+i*1.256;limb(polar(a,.62,0),trunk(.18),.055,.16);
  let prev=polar(a,.29,.02);
  for(let j=1;j<=5;j++){const t=j/6,p=add(trunk(t),polar(a+t*2,.27*(1-t*.5),0));limb(prev,p,.075,.06);prev=p;}
 }
 let offset=0;
 for(let i=0;i<7;i++){
  const a=phase+i*2.399,base=trunk(.48+i*.065),elbow=add(base,polar(a,range(.7,1.2),range(.5,1))),end=add(elbow,polar(a,range(.6,1.2),range(.35,.75)));
  limb(base,elbow,.17,.09);limb(elbow,end,.09,.035);
  for(let fork=0;fork<5;fork++){
   const b=a+(fork-2)*.55,start=elbow.map((v,k)=>v+(end[k]-v)*fork/5),tip=add(start,polar(b,range(.65,1.1),range(.3,.65)));
   limb(start,tip,.03,.006);
   for(let j=0;j<10;j++)for(const side of [-1,1]){
    const t=.12+j*.085,p=start.map((v,k)=>v+(tip[k]-v)*t),angle=b+side*1.05;
    const leafTip=add(p,polar(angle,range(.09,.14),range(.015,.055)));
    leaves.leaf(p,leafTip,.027,.012,palette.leaf.map(v=>Math.min(1,v*range(.86,1.12))));
    groups.push([offset,offset+120]);offset+=120;
   }
   anchors.push({position:start.map((v,k)=>v+(tip[k]-v)*.7),size:.055});
  }
 }
 const w=wood.finish().vertices,l=leaves.finish().vertices;
 for(let i=9;i<l.length;i+=10)l[i]=1;
 // Alternate reverse faces have the pale, silvery underside of olive leaves.
 for(let i=30;i<l.length;i+=60)for(let j=0;j<30;j+=10)for(let k=0;k<3;k++)l[i+j+6+k]=[.60,.65,.53][k];
 const vertices=new Float32Array(w.length+l.length);vertices.set(w);vertices.set(l,w.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:groups.map(([a,b])=>[a+w.length,b+w.length])};
 const {bounds,dimensions}=meshDiagnostics(mesh),scale=height/dimensions[1];
 for(let i=0;i<vertices.length;i+=10)for(let k=0;k<3;k++)vertices[i+k]=(vertices[i+k]-(k===1?bounds.min[1]:0))*scale;
 mesh.produceAnchors=anchors.map(a=>({position:a.position.map((v,k)=>(v-(k===1?bounds.min[1]:0))*scale),size:a.size*scale}));
 return mesh;
}
