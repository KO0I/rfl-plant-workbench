import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';
export function generateJamWattle(seed,palette){
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),leaves=createFloraGeometry(seed),anchors=[],groups=[];
 const range=(a,b)=>a+(b-a)*rng(),height=range(3,7),phase=range(0,6.283),add=(a,b)=>a.map((v,k)=>v+b[k]),polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const stem=t=>[.12*t*t,3.4*t,0],branch=(a,b,r0,r1)=>wood.branch(a,b,r0,r1,palette.bark,6);
 for(let j=0;j<8;j++)branch(stem(j/8),stem((j+1)/8),.15*(1-j*.085),.15*(1-(j+1)*.085));
 let offset=0;
 for(let i=0;i<8;i++){
  const a=phase+i*2.399,base=stem(.25+i*.075),elbow=add(base,polar(a,.45,.55)),end=add(elbow,polar(a,range(.4,.8),range(.5,.85)));
  branch(base,elbow,.065,.035);branch(elbow,end,.035,.012);
  for(let fork=0;fork<3;fork++){
   const b=a+(fork-1)*.6,start=elbow.map((v,k)=>v+(end[k]-v)*fork*.3),tip=add(start,polar(b,range(.45,.7),range(.4,.65)));
   branch(start,tip,.018,.004);
   for(let j=0;j<14;j++){
    const t=.1+j*.06,p=start.map((v,k)=>v+(tip[k]-v)*t),angle=b+(j%2?1:-1)*.8;
    const leafTip=add(p,polar(angle,range(.08,.13),.055));
    leaves.leaf(p,leafTip,.009,.008,palette.leaf);
    groups.push([offset,offset+120]);offset+=120;
   }
   anchors.push({position:start.map((v,k)=>v+(tip[k]-v)*.6),size:.04});
  }
 }
 const w=wood.finish().vertices,l=leaves.finish().vertices;for(let i=9;i<l.length;i+=10)l[i]=1;
 const vertices=new Float32Array(w.length+l.length);vertices.set(w);vertices.set(l,w.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:groups.map(([a,b])=>[a+w.length,b+w.length])},d=meshDiagnostics(mesh),scale=height/d.dimensions[1];
 for(let i=0;i<vertices.length;i+=10)for(let k=0;k<3;k++)vertices[i+k]=(vertices[i+k]-(k===1?d.bounds.min[1]:0))*scale;
 mesh.produceAnchors=anchors.map(a=>({size:a.size*scale,position:a.position.map((v,k)=>(v-(k===1?d.bounds.min[1]:0))*scale)}));return mesh;
}
