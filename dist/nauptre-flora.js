// Small flat-shaded solids, retained as meshes through the distance fade.
import {floraAdd as add,createFloraGeometry} from './faceted-flora.js';
export function nauptreFlora(group,{flowers=true}={}){return (group==='nauptre-cacti'?[0,1,2,3,4,5]:[0,1,2]).map(variant=>{
 const produceAnchors=[],geometry=createFloraGeometry(variant),{tri,branch,crown,clump}=geometry;
 const cactus=[.13,.31,.30],bark=[.27,.23,.30],leaf=[.27,.40,.37];
 let height;
 if(group==='nauptre-cacti'){
  const shape=variant%3,flower=variant<3?[.98,.34,.62]:[1.,.79,.19];
  height=3.4+shape*.65;
  // Broad pentagonal limbs fork out of the basal clump, not horizontal elbows.
  // Shared rings keep each bend watertight and preserve the angular silhouette.
  function stem(points,radii){
   const rings=points.map((p,j)=>Array.from({length:5},(_,i)=>add(p,[Math.cos(i*2*Math.PI/5+.3)*radii[j],0,Math.sin(i*2*Math.PI/5+.3)*radii[j]])));
   for(let j=0;j<rings.length-1;j++)for(let i=0;i<5;i++){
    const k=(i+1)%5,A=rings[j][i],B=rings[j][k],C=rings[j+1][i],D=rings[j+1][k],tone=cactus.map(c=>c*(.76+i*.075));
    tri(A,C,B,tone);tri(B,C,D,tone);
   }
   const tip=points.at(-1),ring=rings.at(-1);
   for(let i=0;i<5;i++)tri(tip,ring[(i+1)%5],ring[i],cactus);
   // One flower palette per entire plant; low, ragged tufts at every arm tip.
   produceAnchors.push({position:[...tip],size:radii.at(-1)*1.15,up:true});
   if(flowers){crown(add(tip,[0,.006,0]),radii.at(-1)*1.35,flower);
   clump(add(tip,[0,.018,0]),radii.at(-1)*.55,flower);}
  }
  stem([[0,0,0],[.035,.43,0],[.065+shape*.012,.98,0]],[.125,.14,.105]);
  stem([[-.03,.09,.015],[-.23,.38,.025],[-.37-shape*.018,.85-shape*.035,.045]],[.105,.115,.085]);
  stem([[.045,.10,.005],[.25,.36,.035],[.42,.67+shape*.035,.06]],[.10,.112,.079]);
  stem([[0,.035,.075],[-.075,.24,.16],[-.14,.49+shape*.025,.20]],[.095,.095,.071]);
 }else if(group==='nauptre-joshua'){
  height=2.3+variant*.35;
  branch([0,0,0],[-.08,.32,.03],.085,.065,bark);branch([-.08,.32,.03],[.06,.57,0],.065,.046,bark);
  for(let i=0;i<3;i++){const a=i*2.1+variant*.3,x=Math.cos(a)*.28,z=Math.sin(a)*.28,mid=[x,.61+i*.045,z],tip=[x*.9,.79+i*.055,z*1.1];branch([.02,.46,0],mid,.048,.033,bark);branch(mid,tip,.033,.023,bark);crown(tip,.20,leaf);}
 }else{
  height=.75+variant*.16;
  for(let i=0;i<5;i++){const a=i*2.4,r=.14+(i%3)*.08,tip=[Math.cos(a)*r,.36+(i%3)*.15,Math.sin(a)*r];branch([0,0,0],tip,.022,.008,bark,4);clump(tip,.24,leaf);clump(add(tip,[.03,.14,0]),.17,cactus);}
 }
 return {id:group+'-'+variant,height,mesh:{...geometry.finish(),produceAnchors}};
});}
