// Garden Canyon leaf material with seeded branching silhouettes.
import {foliageGeometry} from './interiors-foliage.mjs';
import {seededRandom,meshDiagnostics,createFloraGeometry} from './faceted-flora.js';
export function interiorsPlant(recipe,seed){
 const random=seededRandom(seed),rows=[],groups=[],wood=createFloraGeometry(seed),greens=['254c35','376541','487c42','63944e','91aa59','295745'],rgb=h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255),bark=rgb('665d42');
 const emit=(a,b,c,color,kind,alpha,normals)=>{for(const [i,p] of [a,b,c].entries())rows.push(...p,...normals[i],...color,1);};
 const add=(a,b)=>a.map((v,k)=>v+b[k]);
 function crown(p,r){
  const color=rgb(greens[Math.floor(random()*greens.length)]);
  // Several small, offset lobes leave air around the branch tips.
  const count=2+Math.floor(random()*3);
  for(let i=0;i<count;i++){
   const angle=random()*Math.PI*2,reach=r*(.25+random()*.5),size=r*(.45+random()*.35);
   const start=rows.length;foliageGeometry(add(p,[Math.cos(angle)*reach,(random()-.35)*r*.65,Math.sin(angle)*reach]),[size*(.8+random()*.5),size*(.65+random()*.4),size*(.75+random()*.5)],color,emit);groups.push([start,rows.length]);
  }
 }
 if(recipe.form==='tree'){
  const height=5.6+random()*1.3,lean=[(random()-.5)*.8,0,(random()-.5)*.8],phase=random()*Math.PI*2;
  const at=t=>[lean[0]*t+Math.sin(t*3.1)*.14,height*t,lean[2]*t+Math.sin(t*4.2)*.12];
  const trunk=[0,.25,.48,.69,.86,1].map(at);
  for(let i=0;i<trunk.length-1;i++)wood.branch(trunk[i],trunk[i+1],.24*(1-i/6),.24*(1-(i+1)/6),bark,7);
  // Buttress roots anchor the trunk instead of ending in a square post.
  for(let i=0;i<5;i++){const a=phase+i*2.399;wood.branch([0,.18,0],[Math.cos(a)*(.55+random()*.25),.045,Math.sin(a)*(.55+random()*.25)],.16,.035,bark,5);}
  const limbs=7+Math.floor(random()*3);
  for(let i=0;i<limbs;i++){
   const t=.3+i/(limbs-1)*.57,a=phase+i*2.399+(random()-.5)*.65,start=at(t),reach=(1.9+random()*1.1)*(1-.48*t),rise=.55+random()*.8;
   const elbow=add(start,[Math.cos(a)*reach*.5,rise*.35,Math.sin(a)*reach*.5]);
   const tip=add(start,[Math.cos(a)*reach,rise,Math.sin(a)*reach]);
   const radius=.12*(1-t*.65);wood.branch(start,elbow,radius,radius*.65,bark,6);wood.branch(elbow,tip,radius*.65,.025,bark,5);
   crown(tip,.65+random()*.35);
   // Unequal forks, offset in height and azimuth, break radial symmetry.
   const side=a+(i%2?1:-1)*(.55+random()*.5),fork=add(elbow,[Math.cos(side)*reach*.65,.6+random()*.65,Math.sin(side)*reach*.65]);
   wood.branch(elbow,fork,radius*.5,.018,bark,5);crown(fork,.48+random()*.32);
  }
  crown(trunk.at(-1),.6);
 }else if(recipe.form==='bush'){
  const stems=5+Math.floor(random()*3),phase=random()*6.28;
  for(let i=0;i<stems;i++){const a=phase+i*2.399,reach=.4+random()*.8,tip=[Math.cos(a)*reach,.65+random()*.9,Math.sin(a)*reach];wood.branch([0,.05,0],tip,.055,.015,bark,5);crown(tip,.6+random()*.35);}
 }else throw Error('Unknown Interiors plant form');
 const timber=wood.finish().vertices,vertices=new Float32Array(timber.length+rows.length);vertices.set(timber);vertices.set(rows,timber.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:groups.map(([a,b])=>[a+timber.length,b+timber.length])},min=meshDiagnostics(mesh).bounds.min[1];
 for(let i=1;i<vertices.length;i+=10)vertices[i]-=min;
 return mesh;
}
