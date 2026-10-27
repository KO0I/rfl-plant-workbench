import {createFloraGeometry,seededRandom} from './faceted-flora.js';
export function generateHeathWildflowers(recipe,seed,palette){
 const rng=seededRandom(seed),g=createFloraGeometry(seed),heath=recipe.form==='heath',anchors=[];
 const count=heath?15:11,spread=heath?.38:.32;
 for(let i=0;i<count;i++){
  const a=i*2.399,r=Math.sqrt(rng())*spread,x=Math.cos(a)*r,z=Math.sin(a)*r,h=heath?.25+rng()*.4:.3+rng()*.6;
  const base=[x,0,z],top=[x+Math.cos(a)*.08,h,z+Math.sin(a)*.08];
  g.branch(base,top,heath?.012:.005,.002,palette.bark,4);
  for(let j=0;j<(heath?9:5);j++){
   const t=.12+j*(heath?.08:.13),p=base.map((v,k)=>v+(top[k]-v)*t);
   for(const side of [-1,1]){
    const b=a+side*1.2,len=heath?.065:.11;
    g.leaf(p,[p[0]+Math.cos(b)*len,p[1]+.025,p[2]+Math.sin(b)*len],heath?.016:.035,.008,palette.leaf);
   }
  }
  if(heath)for(const side of [-1,1]){
   const b=a+side*.9,p=base.map((v,k)=>v+(top[k]-v)*.5),tip=[p[0]+Math.cos(b)*.14,p[1]+h*.3,p[2]+Math.sin(b)*.14];
   g.branch(p,tip,.006,.001,palette.bark,4);
   for(let j=0;j<4;j++){const t=j/4,q=p.map((v,k)=>v+(tip[k]-v)*t);g.leaf(q,[q[0]+side*.035,q[1]+.04,q[2]+.025],.015,.006,palette.leaf);}
  }
  anchors.push({position:top,size:heath?.027:.055});
 }
 return {...g.finish(),produceAnchors:anchors,leafGroups:[]};
}
export function clusterFlower(kind,color,seed,form){
 const g=createFloraGeometry(seed);
 if(kind==='fruit'){
  g.clump([0,-.25,0],.20,[.49,.35,.19]);return g.finish();
 }
 if(form==='heath'){
  for(let j=0;j<5;j++){
   const a=j*2.399,p=[Math.cos(a)*.25,-j*.28,Math.sin(a)*.25];
   g.clump(p,.23,color);g.clump([p[0],p[1]-.14,p[2]],.12,color.map(v=>v*.65));
  }
 }else if(form==='wildflower-spike'){
  for(let j=0;j<8;j++)for(let k=0;k<3;k++){
   const a=k*2.094+j*.5,r=.35*(1-j/10);
   g.clump([Math.cos(a)*r,j*.19,Math.sin(a)*r],.16*(1-j*.055),color);
  }
 }else{
  const n=form==='wildflower-cup'?5:10;
  for(let j=0;j<n;j++){
   const a=j*6.283/n,p=[Math.cos(a)*.9,form==='wildflower-cup'?.45:.08,Math.sin(a)*.9];
   g.leaf([0,0,0],p,form==='wildflower-cup'?.7:.24,.12,color);
  }
  g.clump([0,.09,0],.24,form==='wildflower-cup'?[.15,.12,.19]:[.95,.68,.13]);
 }
 return g.finish();
}
