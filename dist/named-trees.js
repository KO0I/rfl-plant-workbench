// Botanical silhouettes, stylized for the workbench. References live in tree-references.js.
import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';
import {foliageGeometry} from './interiors-foliage.mjs';
export const NAMED_TREES=['acacia','oak','aspen','ash','apple','peach','coconut','banana','pear'];
export function generateNamedTree(form,seed,palette,{trunkSpines=false}={}){
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),leaves=createFloraGeometry(seed),crowns=[],groups=[],bladeGroups=[],produceAnchors=[];
 const rand=(a,b)=>a+(b-a)*rng(),add=(p,q)=>p.map((v,k)=>v+q[k]),polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r],mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t),phase=rand(0,6.283);
 const limb=(a,b,r,s)=>wood.branch(a,b,r,s,palette.bark,7);
 function cluster(p,s){const start=crowns.length,color=palette.leaf.map(v=>v*rand(.88,1.12));foliageGeometry(p,s,color,(a,b,c,col,kind,alpha,normals)=>{for(const [i,q]of[a,b,c].entries())crowns.push(...q,...normals[i],...col,1);});groups.push([start,crowns.length]);}
 function trunk(h,r,lean){const at=t=>polar(phase,lean*t*t,h*t);for(let i=0;i<10;i++)limb(at(i/10),at((i+1)/10),r*(1-.76*i/10),r*(1-.76*(i+1)/10));if(trunkSpines)for(let j=0;j<24;j++){
 const t=.08+j*.034,a=phase+j*2.399,radius=r*(1-.76*t),p=add(at(t),polar(a,radius*.85,0));
 const tip=add(p,polar(a,.10+(j%4)*.025,.035));
 wood.branch(p,tip,.018,.0008,[.62,.53,.36],4);
 }return at;}
 const anchor=(p,size=.19)=>produceAnchors.push({position:[...p],size});
 let bladeOffset=0;
 function twigLeaves(p,a,length,width){for(let j=0;j<5;j++){const base=add(p,polar(a,length*j/5,j*.035));for(const side of[-1,1]){leaves.leaf(base,add(base,polar(a+side*.85,width,rand(-.05,.12))),width*.38,.035,palette.leaf);bladeGroups.push([bladeOffset,bladeOffset+120]);bladeOffset+=120;}}}
 if(form==='coconut'){
  const h=rand(7.5,11),at=trunk(h,.23,rand(1.2,2.8)),top=at(1),n=12+Math.floor(rand(0,4));
  // Pale growth scars follow the curved trunk, without changing its silhouette.
  for(let j=1;j<30;j++){const p=at(j/32),q=at(j/32+.008),r=.23*(1-.76*j/32)+.008;wood.branch(p,q,r,r,[.63,.56,.4],7);}
  for(let i=0;i<n;i++){const a=phase+i*6.283/n+rand(-.12,.12),len=rand(3.2,4.7),rise=rand(.7,1.9),drop=rand(1.2,2.4),point=t=>add(top,polar(a,len*t,rise*Math.sin(t*Math.PI)-drop*t*t));let prev=top;
   for(let j=1;j<=12;j++){const t=j/12,p=point(t);wood.branch(prev,p,.032*(1-t*.7),.008,[.35,.42,.17],5);for(const side of[-1,1]){const reach=.08+Math.sin(t*Math.PI)*rand(.65,1.05);leaves.leaf(prev,add(p,polar(a+side*1.1,reach,-reach*.32)),.2*(1-t*.5),.025,palette.leaf);}prev=p;}}
  for(let i=0;i<9;i++)anchor(add(top,polar(phase+i*2.399,rand(.25,.48),rand(-.55,-.18))),.35);
 }else if(form==='banana'){
  const h=rand(2.7,4.1),at=trunk(h,.19,rand(.12,.4)),top=at(1);
  // Overlapping leaf sheaths and a small sucker distinguish a pseudostem from a palm trunk.
  for(let i=0;i<7;i++){const a=phase+i*2.399;wood.branch(polar(a,.13,.05),add(at(.8),polar(a,.09,0)),.045,.02,[.4,.51,.23],5);}
  function blade(base,a,length,rise){const point=t=>add(base,polar(a,length*t,rise*Math.sin(t*Math.PI*.8)-.5*t*t));let prev=base;
   for(let j=1;j<=10;j++){const t=j/10,p=point(t),before=(j-1)/10,w=.025+Math.sin(Math.PI*(t*.95))*.48,wp=.025+Math.sin(Math.PI*(before*.95))*.48;wood.branch(prev,p,.018,.009,[.51,.59,.24],4);
    for(const side of[-1,1]){const torn=j>3&&rng()<.27,outer=add(p,polar(a+side*Math.PI/2,w*(torn?.6:1),-.07)),outerPrev=add(prev,polar(a+side*Math.PI/2,wp,-.07)),end=torn?mix(prev,p,.84):p;for(const tri of[[prev,outerPrev,outer],[prev,outer,end]]){leaves.tri(...tri,palette.leaf);leaves.tri(tri[2],tri[1],tri[0],palette.leaf);}}prev=p;}}
  for(let i=0;i<8;i++)blade(add(top,[0,-i*.09,0]),phase+i*2.399,rand(1.6,2.7),rand(.45,1.1));
  const sucker=polar(phase+2,.47,.02),sTop=add(sucker,[0,h*.42,0]);limb(sucker,sTop,.1,.06);for(let i=0;i<3;i++)blade(sTop,phase+i*2.399,.9+rand(0,.4),.4);
  const fruitTip=add(top,polar(phase,.7,-.7));wood.branch(top,fruitTip,.045,.025,[.39,.48,.18],5);anchor(fruitTip,.52);
 }else{
  const configs={acacia:{h:[5.5,7.5],r:.36,stem:.46,reach:.58,n:6},oak:{h:[8,11],r:.62,stem:.3,reach:.43,n:7},aspen:{h:[9,13],r:.23,stem:1,reach:.16,n:11},ash:{h:[8,11],r:.32,stem:1,reach:.27,n:10},apple:{h:[3.8,5.2],r:.24,stem:.35,reach:.48,n:6},peach:{h:[3.5,4.8],r:.2,stem:.27,reach:.42,n:5},pear:{h:[5.5,7],r:.24,stem:1,reach:.29,n:10}};
  const c=configs[form],h=rand(...c.h),at=trunk(h*c.stem,c.r,rand(.12,.45)),tall=['aspen','ash','pear'].includes(form);
  // Roots and trunk scars are solid geometry, retained in winter.
  for(let i=0;i<5;i++)limb(polar(phase+i*1.257,c.r*1.8,.03),at(.1),c.r*.24,c.r*.36);
  if(form==='aspen')for(let i=0;i<22;i++){const t=rand(.08,.87),a=rand(0,6.283),r=c.r*(1-.76*t)+.007,p=add(at(t),polar(a,r,0)),q=add(at(t+.008),polar(a+.38,r,0));wood.branch(p,q,.016,.011,[.17,.19,.19],4);}
  for(let i=0;i<c.n;i++){
   const level=tall?.3+(form==='ash'?Math.floor(i/2)*2:i)/c.n*.57:rand(.6,1),base=at(level),a=phase+(form==='ash'?Math.floor(i/2)*1.15+(i%2)*Math.PI:i*2.399)+rand(-.24,.24),reach=h*c.reach*(tall?Math.pow(1-level,.65):1)*rand(.77,1.12);
   const endY=form==='acacia'?h*rand(.79,.87):tall?Math.min(h*.97,base[1]+h*rand(.13,.23)):h*rand(.67,.84);
   const elbow=add(base,polar(a+(form==='oak'?rand(-.28,.28):0),reach*.48,(endY-base[1])*(form==='oak'?.32:.47))),tip=add(base,polar(a,reach,endY-base[1]));limb(base,elbow,c.r*(tall?.3:.57),c.r*.22);limb(elbow,tip,c.r*.22,.035);
   const forks=form==='oak'?4:3;
   for(let j=0;j<forks;j++){
    const angle=a+(j-(forks-1)/2)*.6,p=add(tip,polar(angle,reach*rand(.18,.38),h*rand(.035,.1)));limb(mix(elbow,tip,.65),p,.05,.012);
    if(form==='peach'){cluster(p,[h*.12,h*.13,h*.12]);twigLeaves(p,angle,.38,.25);}
    else if(form==='ash'){cluster(p,[h*.12,h*.095,h*.12]);for(let k=0;k<2;k++)twigLeaves(add(p,polar(angle+k*2.1,.24,0)),angle+k*2.1,.55,.33);}
    else{const scale=form==='acacia'?[h*.23,h*.065,h*.21]:form==='oak'?[h*.17,h*.145,h*.16]:form==='aspen'?[h*.09,h*.12,h*.085]:form==='pear'?[h*.105,h*.125,h*.105]:[h*.18,h*.15,h*.17];cluster(p,scale);}
    anchor(add(p,[0,-h*(form==='acacia'?.04:.065),0]),['apple','peach','pear'].includes(form)?.2:.13);
   }
  }
  if(form==='oak')for(let i=0;i<3;i++){const p=add(at(.95),polar(phase+i*2.399,h*.17,h*rand(.38,.49)));limb(at(.95),p,.2,.04);cluster(p,[h*.18,h*.17,h*.18]);anchor(add(p,[0,-h*.1,0]),.13);}
  if(tall)cluster(at(.97),[h*(form==='aspen'?.085:.1),h*.12,h*.1]);
 }
 const solid=wood.finish().vertices,fronds=leaves.finish().vertices;for(let i=9;i<fronds.length;i+=10)fronds[i]=1;
 const vertices=new Float32Array(solid.length+fronds.length+crowns.length);vertices.set(solid);vertices.set(fronds,solid.length);vertices.set(crowns,solid.length+fronds.length);
 const leafGroups=groups.map(([a,b])=>[a+solid.length+fronds.length,b+solid.length+fronds.length]);if(bladeGroups.length)leafGroups.push(...bladeGroups.map(([a,b])=>[a+solid.length,b+solid.length]));else if(fronds.length)leafGroups.push([solid.length,solid.length+fronds.length]);
 const mesh={vertices,count:vertices.length/10,leafGroups,produceAnchors},min=meshDiagnostics(mesh).bounds.min[1];for(let i=1;i<vertices.length;i+=10)vertices[i]-=min;for(const a of produceAnchors)a.position[1]-=min;
 return mesh;
}
