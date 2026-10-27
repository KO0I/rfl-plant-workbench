import {NAMED_TREES,generateNamedTree} from './named-trees.js';
// Distinct tree architectures. All dimensions are metres and variation is seeded.
import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';
import {foliageGeometry} from './interiors-foliage.mjs';
export const TREE_FORMS=['evergreen','willow','palm','dragonblood',...NAMED_TREES];
export function generateTreeForm(recipe,seed,palette){
 if(NAMED_TREES.includes(recipe.form))return generateNamedTree(recipe.form,seed,palette);
 if(!TREE_FORMS.includes(recipe.form))throw Error('Unknown tree form');
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),leaves=createFloraGeometry(seed),crowns=[],groups=[];
 const range=(a,b)=>a+(b-a)*rng(),add=(a,b)=>a.map((v,k)=>v+b[k]),polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const phase=range(0,Math.PI*2),tone=()=>palette.leaf.map(v=>Math.min(1,v*range(.86,1.12)));
 function cluster(p,s){const start=crowns.length;foliageGeometry(p,s,tone(),(a,b,c,color,kind,alpha,normals)=>{for(const [i,q] of [a,b,c].entries())crowns.push(...q,...normals[i],...color,1);});groups.push([start,crowns.length]);}
 const limb=(a,b,r0,r1)=>wood.branch(a,b,r0,r1,palette.bark,6);
 function trunk(height,radius,lean=0){const bend=polar(phase,lean,0),at=t=>[bend[0]*t*t,height*t,bend[2]*t*t];for(let i=0;i<7;i++)limb(at(i/7),at((i+1)/7),radius*(1-.62*i/7),radius*(1-.62*(i+1)/7));return at;}
 if(recipe.form==='evergreen'){
  const h=range(7,10),at=trunk(h,.22,range(.15,.5)),levels=7;
  for(let j=0;j<levels;j++){
   const t=.18+j*.105,reach=(1-t)*range(2.8,3.8),branches=5+(j%2);
   for(let i=0;i<branches;i++){
    const a=phase+i*Math.PI*2/branches+j*.73+range(-.16,.16),start=at(t),end=add(start,polar(a,reach*range(.78,1.08),range(-.28,.1)));
    limb(start,end,.065*(1-t),.012);
    const middle=start.map((v,k)=>v+(end[k]-v)*.65);
    cluster(middle,[reach*.42,range(.24,.42),reach*.42]);
    leaves.crown(add(end,[0,.12,0]),.36,palette.leaf);
   }
  }
  cluster(at(.93),[.3,.75,.3]);
 }else if(recipe.form==='willow'){
  const h=range(5.8,7),at=trunk(h*.65,.32,range(.35,.7));
  for(let i=0;i<8;i++){
   const a=phase+i*2.399,base=at(range(.65,1)),reach=range(2.4,3.6),arch=add(base,polar(a,reach*.65,range(1.2,2.1))),tip=add(arch,polar(a,reach*.35,-.25));
   limb(base,arch,.15,.07);limb(arch,tip,.07,.025);
   cluster(arch,[1.15,.55,1.15]);
   for(let j=0;j<3;j++){
    const angle=a+(j-1)*.27,start=add(tip,polar(a+Math.PI/2,(j-1)*.62,range(-.15,.25))),drop=Math.min(start[1]-.5,range(2.5,4.4));
    limb(tip,start,.025,.018);let previous=start;
    for(let k=1;k<=3;k++){const t=k/3,p=add(start,polar(angle,.5*Math.sin(t*Math.PI/2),-drop*t));limb(previous,p,.012*(1-t*.7),.004);cluster(previous.map((v,n)=>(v+p[n])/2),[range(.065,.11),drop/5.1,range(.065,.11)]);previous=p;}
   }
  }
 }else if(recipe.form==='palm'){
  const h=range(6,9),at=trunk(h,.19,range(.7,1.8)),top=at(1),fronds=10+Math.floor(rng()*4);
  for(let i=0;i<fronds;i++){
   const a=phase+i*Math.PI*2/fronds+range(-.13,.13),length=range(2.5,3.7),rise=range(1,1.8),fall=range(.8,1.8),color=tone();
   const point=t=>add(top,polar(a,length*t,rise*Math.sin(t*Math.PI*.85)-fall*t*t));
   let previous=top;
   for(let k=1;k<=10;k++){
    const t=k/10,p=point(t);limb(previous,p,.035*(1-.7*t),.01);
    for(const side of [-1,1]){const width=Math.sin(t*Math.PI)*range(.5,.85)+.05,tip=add(p,polar(a+side*1.15,width,-.12-width*.22));leaves.leaf(previous,tip,.27*(1-t*.6),.045,color);}
    previous=p;
   }
  }
  cluster(top,[.28,.35,.28]);
 }else{
  // Repeated forks support a broad umbrella of compact terminal crowns.
  const h=range(4.8,6.2),at=trunk(h*.48,.45,range(.12,.4)),top=at(1),radius=range(2.6,3.5);
  for(let i=0;i<5;i++){
   const a=phase+i*Math.PI*2/5+range(-.15,.15),elbow=add(top,polar(a,radius*.43,h*.22));limb(top,elbow,.23,.14);
   for(const side of [-1,1]){
    const angle=a+side*.38,end=add(top,polar(angle,radius*.77,h*.39));limb(elbow,end,.14,.075);cluster(add(end,[0,h*.1,0]),[1,.4,1]);
    for(const fork of [-1,1]){
     const b=angle+fork*.2,tip=add(top,polar(b,radius*range(.86,1.06),h*.48+range(-.12,.12)));limb(end,tip,.075,.035);
     cluster(tip,[range(.65,.9),range(.23,.36),range(.65,.9)]);
     leaves.crown(add(tip,[0,.16,0]),.48,palette.leaf);
    }
   }
  }
  cluster(add(top,[0,h*.49,0]),[1.1,.32,1.1]);
 }
 const solid=wood.finish().vertices,fronds=leaves.finish().vertices;
 for(let i=9;i<fronds.length;i+=10)fronds[i]=1;
 const vertices=new Float32Array(solid.length+fronds.length+crowns.length);vertices.set(solid);vertices.set(fronds,solid.length);vertices.set(crowns,solid.length+fronds.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:groups.map(([a,b])=>[a+solid.length+fronds.length,b+solid.length+fronds.length])},min=meshDiagnostics(mesh).bounds.min[1];for(let i=1;i<vertices.length;i+=10)vertices[i]-=min;
 return mesh;
}
