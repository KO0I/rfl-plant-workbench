import {createFloraGeometry,seededRandom} from './faceted-flora.js';
export const PLANT_STAGES=['normal','flowering','fruiting'];
export const PRODUCE_KINDS=['fruit','berries','nuts','pinecones'];
export const PRODUCE_COLORS={fruit:[.87,.25,.11],berries:[.48,.17,.61],nuts:[.61,.37,.17],pinecones:[.48,.29,.14]};
export function supportsProduce(s){return (s.recipe.kind==='nauptre-golden'&&s.recipe.group==='nauptre-cacti')||(s.recipe.kind==='interiors'&&s.recipe.form==='tree')||s.recipe.kind==='tree-form'||s.recipe.kind==='growth'||(s.recipe.kind==='botanical'&&s.recipe.form!=='fern')||s.recipe.kind==='xpm-cactus';}
export function defaultProduce(s){return s.recipe.form==='evergreen'?'pinecones':['baobab','oak'].includes(s.recipe.form)?'nuts':'fruit';}
// A single solid-mesh generator used by every plant's reproductive stage.
export function produceGeometry(kind,color,seed=0,form=null){
 const g=createFloraGeometry(seed),rng=seededRandom(seed),shade=(c,f)=>c.map(v=>Math.min(1,v*f));
 function ellipsoid(p,s,c){
  const q=(1+Math.sqrt(5))/2,l=Math.sqrt(1+q*q),v=[[-1,q,0],[1,q,0],[-1,-q,0],[1,-q,0],[0,-1,q],[0,1,q],[0,-1,-q],[0,1,-q],[q,0,-1],[q,0,1],[-q,0,-1],[-q,0,1]].map(a=>a.map((n,k)=>p[k]+n/l*s[k]));
  g.polyhedron(v,[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]],c);
 }
 if(kind==='flower'&&form==='banana'){
  ellipsoid([0,-.8,0],[.4,.85,.4],color);g.branch([0,0,0],[0,-.2,0],.06,.045,[.39,.48,.18],5);
 }else if(kind==='flower'&&['oak','aspen','ash','coconut','acacia'].includes(form)){
  for(let i=0;i<6;i++){const a=i*2.399,p=[Math.cos(a)*.28,-.12-i*.19,Math.sin(a)*.28];g.branch([0,0,0],p,.025,.012,[.44,.43,.2],4);ellipsoid(p,[.13,.2,.13],color);}
 }else if(kind==='fruit'&&form==='banana'){
  g.branch([0,.1,0],[0,-1.5,0],.07,.045,[.32,.41,.16],5);
  for(let j=0;j<3;j++)for(let i=0;i<6;i++){const a=i*6.283/6+j*.3,point=t=>[Math.cos(a)*(.14+.7*Math.sin(t*1.6)), -j*.42-t*.5,Math.sin(a)*(.14+.7*Math.sin(t*1.6))];for(let k=0;k<4;k++)g.branch(point(k/4),point((k+1)/4),.12-k*.015,.105-k*.015,color,5);}
 }else if(kind==='fruit'&&form==='pear'){
  ellipsoid([0,-.94,0],[.68,.67,.65],color);ellipsoid([0,-.4,0],[.31,.49,.31],shade(color,1.08));g.branch([0,-.04,0],[.07,.2,.02],.05,.035,[.32,.25,.13],4);
 }else if(kind==='fruit'&&form==='coconut'){
  ellipsoid([0,-.72,0],[.65,.85,.62],color);g.branch([0,0,0],[.08,.2,0],.06,.04,[.38,.4,.17],4);
 }else if(kind==='fruit'&&form==='acacia'){
  for(let i=0;i<3;i++)for(let j=0;j<8;j++){const point=t=>[Math.cos(t*5+i)*(.25+t*.18),-.15-i*.18-t*.4,Math.sin(t*5+i)*(.25+t*.18)];g.branch(point(j/8),point((j+1)/8),.065,.05,color,4);}
 }else if(kind==='fruit'&&form==='ash'){
  for(let i=0;i<7;i++){const a=i*2.399,p=[Math.cos(a)*.28,-.4,Math.sin(a)*.28];g.branch([0,0,0],p,.018,.01,[.36,.32,.16],4);g.leaf(p,[p[0]*1.6,-1.2-i*.04,p[2]*1.6],.2,.015,color);}
 }else if(kind==='fruit'&&form==='aspen'){
  for(let i=0;i<7;i++)ellipsoid([Math.sin(i)*.08,-.1-i*.18,Math.cos(i)*.08],[.13,.17,.13],color);
 }else if(kind==='flower'){
  const center=[0,.02,0];for(let i=0;i<5;i++){const a=i*Math.PI*2/5,tip=[Math.cos(a),.28,Math.sin(a)],left=[Math.cos(a-.5)*.63,-.08,Math.sin(a-.5)*.63],right=[Math.cos(a+.5)*.63,-.08,Math.sin(a+.5)*.63];g.tri(center,tip,left,color);g.tri(center,right,tip,shade(color,.85));}ellipsoid([0,.07,0],[.18,.12,.18],[.95,.75,.25]);
 }else if(kind==='fruit'){
  ellipsoid([0,-.72,0],form==='apple'?[.8,.7,.75]:[.7,.78,.68],color);if(form==='peach')ellipsoid([.22,-.73,.22],[.49,.64,.46],shade(color,.85));g.branch([0,0,0],[.05,.2,.03],.065,.045,[.33,.24,.12],4);g.leaf([.02,.08,0],[.55,.2,.05],.22,.06,[.23,.4,.13]);
 }else if(kind==='berries'){
  for(let i=0;i<7;i++){const a=i*2.399,r=i<3?.23:.47,p=[Math.cos(a)*r,-.35-i*.09,Math.sin(a)*r];ellipsoid(p,[.29,.32,.29],shade(color,.8+rng()*.3));g.branch([0,.05,0],p,.022,.012,[.3,.29,.12],4);}
 }else if(kind==='nuts'){
  ellipsoid([0,-.65,0],[.47,.68,.47],color);ellipsoid([0,-.22,0],[.54,.25,.54],shade(color,.56));g.branch([0,-.04,0],[.03,.18,0],.065,.04,[.36,.27,.15],4);
 }else if(kind==='pinecones'){
  ellipsoid([0,-.75,0],[.4,.85,.4],shade(color,.65));
  for(let j=0;j<6;j++)for(let i=0;i<7;i++){const a=i*Math.PI*2/7+j*.45,r=.16+.36*Math.sin((j+1)*Math.PI/7),y=-.13-j*.23,tip=[Math.cos(a)*(r+.11),y-.22,Math.sin(a)*(r+.11)],left=[Math.cos(a-.36)*r,y,Math.sin(a-.36)*r],right=[Math.cos(a+.36)*r,y,Math.sin(a+.36)*r];g.tri(left,tip,right,shade(color,.82+(j%3)*.12));}
 }else throw Error('Unknown produce kind');
 return g.finish();
}
export function attachProduce(mesh,s,seed){
 const stage=s.recipe.stage||'normal';if(stage==='normal'||!supportsProduce(s))return mesh;
 let anchors=mesh.produceAnchors;
 if(!anchors?.length){anchors=(mesh.leafGroups||[]).map(([start,end])=>{const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=start;i<end;i+=10)for(let k=0;k<3;k++){min[k]=Math.min(min[k],mesh.vertices[i+k]);max[k]=Math.max(max[k],mesh.vertices[i+k]);}return {position:[(min[0]+max[0])/2,min[1]+(max[1]-min[1])*.25,(min[2]+max[2])/2],size:.16};});}
 if(!anchors?.length)return mesh;
 const kind=s.recipe.produce||defaultProduce(s),color=s.recipe.produceColor||PRODUCE_COLORS[kind],count=Math.min(anchors.length,s.recipe.produceCount??12),parts=[mesh.vertices];
 for(let i=0;i<count;i++){
  const anchor=anchors[Math.floor(i*anchors.length/count)],bloom=stage==='flowering',assetKind=bloom?(s.recipe.form==='evergreen'?'pinecones':'flower'):kind,pigment=bloom?s.palette.flower:color;
  const asset=produceGeometry(assetKind,pigment,seed+i,s.recipe.form),v=asset.vertices,size=anchor.size*(bloom?.95:1.25)*(s.recipe.produceScale??1),p=anchor.position;
  for(let j=0;j<v.length;j+=10)for(let k=0;k<3;k++)v[j+k]=v[j+k]*size*(k===1&&anchor.up&&!bloom?-1:1)+p[k];if(anchor.up&&!bloom)for(let j=4;j<v.length;j+=10)v[j]*=-1;parts.push(v);
 }
 const vertices=new Float32Array(parts.reduce((n,v)=>n+v.length,0));let offset=0;for(const v of parts){vertices.set(v,offset);offset+=v.length;}
 return {...mesh,vertices,count:vertices.length/10};
}
