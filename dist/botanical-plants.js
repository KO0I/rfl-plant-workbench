import {generateHeathWildflowers} from './heath-wildflowers.js';
import {generateShieldFern} from './shield-fern.js';
import {generateTussock} from './tussock.js';
import {generateCattails} from './cattails.js';
import {generatePineapple} from './pineapple.js';
import {generatePrototaxiteB} from './prototaxite-b.js';
import {generatePrototaxiteA} from './prototaxite-a.js';
import {generateZosteophyl} from './zosteophyl.js';
import {createFloraGeometry,seededRandom} from './faceted-flora.js';
import {foliageGeometry} from './interiors-foliage.mjs';
export const BOTANICAL_FORMS=['heath','wildflower-spike','wildflower-daisy','wildflower-cup','shield-fern','tussock','cattail','pineapple','prototaxite-b','prototaxite-a','zosteophyl','desert-rose','fern','baobab','saguaro','barrel-cactus','prickly-pear'];
export function generateBotanical(recipe,seed,palette){
 if(['heath','wildflower-spike','wildflower-daisy','wildflower-cup'].includes(recipe.form))return generateHeathWildflowers(recipe,seed,palette);
 if(recipe.form==='shield-fern')return generateShieldFern(seed,palette);
 if(recipe.form==='tussock')return generateTussock(recipe,seed,palette);
 if(recipe.form==='cattail')return generateCattails(seed,palette);
 if(recipe.form==='pineapple')return generatePineapple(seed,palette);
 if(recipe.form==='prototaxite-b')return generatePrototaxiteB(seed,palette);
 if(recipe.form==='prototaxite-a')return generatePrototaxiteA(seed,palette);
 if(recipe.form==='zosteophyl')return generateZosteophyl(recipe,seed,palette);
 if(!BOTANICAL_FORMS.includes(recipe.form))throw Error('Unknown botanical form');
 const random=seededRandom(seed),solid=createFloraGeometry(seed),leaves=createFloraGeometry(seed),rows=[],groups=[],produceAnchors=[];
 const range=(a,b)=>a+(b-a)*random(),polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r],add=(a,b)=>a.map((v,k)=>v+b[k]),phase=range(0,6.28);
 const branch=(a,b,r0,r1)=>solid.branch(a,b,r0,r1,palette.bark,7);
 function cluster(p,s){const start=rows.length;foliageGeometry(p,s,palette.leaf,(a,b,c,col,kind,alpha,normals)=>{for(const [i,q]of[a,b,c].entries())rows.push(...q,...normals[i],...col,1);});groups.push([start,rows.length]);}
 function profile(base,levels,color,sides=12,depth=1){
  const rings=levels.map(([y,r])=>Array.from({length:sides},(_,i)=>{const a=i*Math.PI*2/sides,ridge=i%2?1:.87;return add(base,[Math.cos(a)*r*ridge,y,Math.sin(a)*r*ridge*depth]);}));
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<sides;i++){const n=(i+1)%sides,c=color.map(v=>v*(i%2?.95:1.08));solid.tri(rings[j][i],rings[j+1][i],rings[j][n],c);solid.tri(rings[j][n],rings[j+1][i],rings[j+1][n],c);}
  for(let i=0;i<sides;i++){const n=(i+1)%sides;solid.tri(add(base,[0,levels[0][0],0]),rings[0][i],rings[0][n],color);solid.tri(add(base,[0,levels.at(-1)[0],0]),rings.at(-1)[n],rings.at(-1)[i],color);}
 }
 function flower(p,r){produceAnchors.push({position:p,size:r,up:true});}
 function spines(base,height,radius){for(let j=0;j<5;j++)for(let i=0;i<8;i++){const a=phase+i*Math.PI/4,p=add(base,polar(a,radius,height*(j+.5)/5)),tip=add(p,polar(a,.08,.03));solid.tri(add(p,[-.01,0,0]),add(p,[.01,.015,.008]),tip,[.75,.7,.48]);}}
 const form=recipe.form;
 if(form==='baobab'||form==='desert-rose'){
  const baobab=form==='baobab',h=baobab?range(6.5,8.5):range(1.8,2.7),r=baobab?range(1.1,1.55):range(.45,.7),top=[range(-.16,.16),h*.69,0];
  profile([0,0,0],[[0,r*.86],[h*.12,r],[h*.42,r*.78],[h*.69,r*.38]],palette.bark,14);
  const count=baobab?6:5;
  for(let i=0;i<count;i++){
   const a=phase+i*2.399,reach=baobab?range(1.4,2.4):range(.55,.9),elbow=add(top,polar(a,reach*.55,h*.14));branch(top,elbow,r*.32,r*.15);
   for(const side of [-1,1]){const b=a+side*.46,tip=add(elbow,polar(b,reach*.6,h*range(.1,.2)));branch(elbow,tip,r*.15,r*.045);cluster(tip,baobab?[.65,.4,.6]:[.22,.13,.22]);
    if(!baobab)for(let j=0;j<4;j++){const aa=phase+j*2.399;flower(add(tip,polar(aa,.17,.13+range(0,.08))),range(.1,.16));}
   }
  }
 }else if(form==='fern'){
  const count=9,h=range(.7,1.2);
  for(let i=0;i<count;i++){
   const a=phase+i*2.399,length=h*range(.85,1.4),point=t=>polar(a,length*t,h*(Math.sin(t*Math.PI*.7)*.8+.12*t));let previous=[0,0,0];
   for(let j=1;j<=10;j++){const t=j/10,p=point(t);solid.branch(previous,p,.014*(1-t*.65),.005,palette.leaf,4);
    for(const side of [-1,1]){const tip=add(p,polar(a+side*1.3,Math.sin(t*Math.PI)*length*.32+.015,.025));leaves.leaf(previous,tip,.07*(1-t*.55),.025,palette.leaf);}
    previous=p;
   }
  }
 }else if(form==='saguaro'){
  const h=range(3.5,5.5),r=range(.21,.29);profile([0,0,0],[[0,r],[h*.9,r],[h,r*.14]],palette.leaf,16);spines([0,0,0],h,r);produceAnchors.push({position:[0,h,0],size:r*.85,up:true});
  for(let i=0;i<3;i++){const a=phase+i*2.399,base=[0,h*range(.35,.63),0],elbow=add(base,polar(a,range(.55,.85),.12)),length=h*range(.25,.4);solid.branch(base,elbow,r*.7,r*.65,palette.leaf,10);profile(elbow,[[0,r*.65],[length*.9,r*.65],[length,r*.12]],palette.leaf,12);spines(elbow,length,r*.65);produceAnchors.push({position:add(elbow,[0,length,0]),size:r*.7,up:true});}
 }else if(form==='barrel-cactus'){
  const h=range(.65,1.25),r=h*.5;profile([0,0,0],[[0,r*.65],[h*.25,r],[h*.65,r*.95],[h*.92,r*.6],[h,r*.15]],palette.leaf,24);spines([0,0,0],h,r*.95);for(let i=0;i<5;i++)flower(polar(phase+i*1.26,r*.3,h*.97),.07);
 }else{
  function pad(base,h,w,angle){
   const g=createFloraGeometry(),q=(1+Math.sqrt(5))/2,raw=[[-1,q,0],[1,q,0],[-1,-q,0],[1,-q,0],[0,-1,q],[0,1,q],[0,-1,-q],[0,1,-q],[q,0,-1],[q,0,1],[-q,0,-1],[-q,0,1]],pts=raw.map(([x,y,z])=>add(base,[x*w*.5*Math.cos(angle)-z*.055*Math.sin(angle),(y/q+1)*h*.5,x*w*.5*Math.sin(angle)+z*.055*Math.cos(angle)]));
   g.polyhedron(pts,[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],palette.leaf);
   const v=g.finish().vertices;for(let i=0;i<v.length;i+=30)solid.tri(Array.from(v.slice(i,i+3)),Array.from(v.slice(i+10,i+13)),Array.from(v.slice(i+20,i+23)),palette.leaf);
   return add(base,[0,h,0]);
  }
  const top=pad([0,0,0],.7,.45,phase);
  for(let i=0;i<4;i++){const a=phase+i*2.399,base=add(top,polar(a,.18,-.16)),tip=pad(base,range(.5,.85),range(.3,.5),a);if(i%2===0){const end=pad(add(tip,[.08,-.1,0]),.45,.3,a+.3);flower(add(end,[0,.02,0]),.09);}else flower(tip,.09);}
 }
 const stem=solid.finish().vertices,fronds=leaves.finish().vertices;for(let i=9;i<fronds.length;i+=10)fronds[i]=1;
 const vertices=new Float32Array(stem.length+fronds.length+rows.length);vertices.set(stem);vertices.set(fronds,stem.length);vertices.set(rows,stem.length+fronds.length);
 return {vertices,count:vertices.length/10,produceAnchors,leafGroups:groups.map(([a,b])=>[a+stem.length+fronds.length,b+stem.length+fronds.length])};
}
