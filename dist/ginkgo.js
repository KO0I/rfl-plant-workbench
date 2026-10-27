import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

export function generateGinkgo(seed,palette){
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),leaf=createFloraGeometry(seed),groups=[],anchors=[];
 const range=(a,b)=>a+(b-a)*rng(),height=range(9,15),phase=range(0,Math.PI*2),lean=range(-.4,.4);
 const at=t=>[lean*t*t,10*t,0],polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r],add=(a,b)=>a.map((v,k)=>v+b[k]);
 const branch=(a,b,r0,r1)=>wood.branch(a,b,r0,r1,palette.bark,6);
 let leafOffset=0;
 function fan(base,angle,size){
  const forward=[Math.cos(angle),.42,Math.sin(angle)],side=[-Math.sin(angle),.08,Math.cos(angle)];
  const root=add(base,forward.map(v=>v*.025));
  const rim=Array.from({length:5},(_,i)=>{
   const a=-1+i*.5,r=size*(i===2?.72:1);
   return root.map((v,k)=>v+forward[k]*Math.cos(a)*r+side[k]*Math.sin(a)*r);
  });
  for(let i=0;i<4;i++){
   const color=palette.leaf.map(v=>v*(.84+(i%2)*.16));
   leaf.tri(root,rim[i],rim[i+1],color,1);leaf.tri(rim[i+1],rim[i],root,color,1);
  }
  groups.push([leafOffset,leafOffset+240]);leafOffset+=240;
 }
 for(let j=0;j<9;j++)branch(at(j/9),at((j+1)/9),.34*(1-j*.085),.34*(1-(j+1)*.085));
 for(let i=0;i<10;i++){
  const t=.30+i*.06,a=phase+i*2.399,reach=range(2.5,3.6)*(1-(t-.3)*.8),base=at(t);
  const elbow=add(base,polar(a,reach*.48,.6)),end=add(base,polar(a,reach,range(.9,1.5)));
  branch(base,elbow,.13*(1-t*.5),.065);branch(elbow,end,.065,.024);
  for(let fork=0;fork<3;fork++){
   const b=a+(fork-1)*.52,start=elbow.map((v,k)=>v+(end[k]-v)*(fork*.27));
   const tip=add(start,polar(b,range(.8,1.25),range(.35,.65)));
   branch(start,tip,.025,.007);
   for(let j=0;j<14;j++){
    const u=.14+j*.06,p=start.map((v,k)=>v+(tip[k]-v)*u),angle=b+j*2.399;
    fan(add(p,polar(angle,.04,.015)),angle,range(.12,.18));
   }
   anchors.push({position:start.map((v,k)=>v+(tip[k]-v)*.65),size:.065});
  }
 }
 const trunk=wood.finish().vertices,leaves=leaf.finish().vertices,vertices=new Float32Array(trunk.length+leaves.length);
 vertices.set(trunk);vertices.set(leaves,trunk.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:groups.map(([a,b])=>[a+trunk.length,b+trunk.length])};
 const {bounds,dimensions}=meshDiagnostics(mesh),scale=height/dimensions[1];
 for(let i=0;i<vertices.length;i+=10)for(let k=0;k<3;k++)vertices[i+k]=(vertices[i+k]-(k===1?bounds.min[1]:0))*scale;
 mesh.produceAnchors=anchors.map(a=>({position:a.position.map((v,k)=>(v-(k===1?bounds.min[1]:0))*scale),size:a.size*scale}));
 return mesh;
}
