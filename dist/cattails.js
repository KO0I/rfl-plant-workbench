import {createFloraGeometry,seededRandom} from './faceted-flora.js';

export function generateCattails(seed,palette){
 const rng=seededRandom(seed),g=createFloraGeometry(seed),anchors=[];
 const height=2+rng(),phase=rng()*Math.PI*2;
 for(let stem=0;stem<7;stem++){
  const a=phase+stem*2.399,r=stem===0?0:.16+rng()*.28;
  const x=Math.cos(a)*r,z=Math.sin(a)*r,h=stem===0?height:height*(.78+rng()*.20);
  g.branch([x,0,z],[x,h,z],.016,.007,palette.bark,5);
  anchors.push({position:[x,h-.12,z],length:.29+rng()*.09,radius:.045+rng()*.009});
  for(let leaf=0;leaf<5;leaf++){
   const angle=a+leaf*2.399,reach=.28+rng()*.35,lh=h*(.62+rng()*.27);
   const at=t=>[x+Math.cos(angle)*reach*t*t,.03+lh*t,z+Math.sin(angle)*reach*t*t];
   const side=[-Math.sin(angle),0,Math.cos(angle)],width=.045+rng()*.02;
   for(let j=0;j<6;j++){
    const t=j/6,u=(j+1)/6,p=at(t),q=at(u),w=width*(1-t)*.5,v=width*(1-u)*.5;
    const L=p.map((n,k)=>n-side[k]*w),R=p.map((n,k)=>n+side[k]*w),A=q.map((n,k)=>n-side[k]*v),B=q.map((n,k)=>n+side[k]*v);
    for(const [one,two,three]of j===5?[[L,R,q]]:[[L,R,A],[R,B,A]]){g.tri(one,two,three,palette.leaf);g.tri(three,two,one,palette.leaf);}
   }
  }
 }
 const mesh=g.finish();mesh.cattailHeads=anchors;mesh.leafGroups=[];return mesh;
}
export function attachCattailHeads(mesh,s){
 if(s.recipe.stage!=='fruiting')return mesh;
 const g=createFloraGeometry(),color=s.palette.flower;
 for(const {position:p,length,radius:r} of mesh.cattailHeads){
  const at=y=>[p[0],p[1]+y,p[2]];
  g.branch(at(-length),at(-length+.025),r*.6,r,color,10);
  g.branch(at(-length+.025),at(-.025),r,r,color,10);
  g.branch(at(-.025),p,r,r*.6,color,10);
 }
 const heads=g.finish().vertices,vertices=new Float32Array(mesh.vertices.length+heads.length);
 vertices.set(mesh.vertices);vertices.set(heads,mesh.vertices.length);
 return {...mesh,vertices,count:vertices.length/10};
}
