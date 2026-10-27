import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

// Fictional RFL form based on the user's column, feather crown and closed bud.
export function generatePrototaxiteA(seed,palette){
 const rng=seededRandom(seed),g=createFloraGeometry(seed),height=4+rng()*4;
 const radius=height*(.065+rng()*.025),lean=(rng()-.5)*height*.09,sides=9;
 const levels=[[0,1.3],[.08,1.05],[.45,.8],[.8,.55],[.94,.34],[1,.035]];
 const rings=levels.map(([t,r])=>Array.from({length:sides},(_,i)=>{
  const a=i*Math.PI*2/sides;
  return [Math.cos(a)*radius*r+lean*t*t,height*t,Math.sin(a)*radius*r];
 }));
 for(let row=0;row<rings.length-1;row++)for(let i=0;i<sides;i++){
  const j=(i+1)%sides,tone=palette.bark.map(v=>v*(.72+(i%3)*.14));
  g.tri(rings[row][i],rings[row][j],rings[row+1][i],tone);
  g.tri(rings[row][j],rings[row+1][j],rings[row+1][i],tone);
 }
 for(let i=0;i<sides;i++)g.tri([lean,height,0],rings.at(-1)[i],rings.at(-1)[(i+1)%sides],palette.bark);
 const mesh=g.finish();mesh.produceAnchors=[{position:[lean*.94*.94,height*.94,0],size:height*.1}];
 mesh.leafGroups=[];return mesh;
}

export function attachPrototaxiteCrown(mesh,s,seed){
 const stage=s.recipe.stage||'normal';if(stage==='normal')return mesh;
 const g=createFloraGeometry(seed),rng=seededRandom(seed),anchor=mesh.produceAnchors[0];
 const material=stage==='flowering'?(s.recipe.emissiveCrown?2:1):0;
 const polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const transform=p=>p.map((v,k)=>v*anchor.size+anchor.position[k]);
 const tri=(a,b,c,color)=>g.tri(transform(a),transform(b),transform(c),color);
 if(stage==='bud'){
  // Overlapping pointed scales enclose a single bud, not a fruit or nut.
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,base=polar(a,.2,-.1),left=polar(a-.35,.62,.7),right=polar(a+.35,.62,.7),ridge=polar(a,.75,.86),tip=polar(a,.03,1.75);
   const color=s.palette.leaf.map(v=>v*(.8+(i%3)*.12));
   for(const face of [[base,left,ridge],[base,ridge,right],[left,tip,ridge],[ridge,tip,right]])tri(...face,color);
  }
 }else{
  // Broad feather fans, with paired narrow barbs along each rachis.
  for(let i=0;i<14;i++){
   const a=i*2.399,reach=1.05+rng()*.85,rise=.8+rng()*.8,base=polar(a,.13,0);
   const point=t=>polar(a,reach*t,.15+rise*t+.2*Math.sin(t*Math.PI));
   for(let j=0;j<7;j++){
    const t=j/7,next=(j+1)/7,p=point(t),q=point(next),width=.30*Math.sin((t+.08)*Math.PI)+.045;
    const side=[-Math.sin(a)*width,0,Math.cos(a)*width],tone=s.palette.flower.map(v=>Math.min(1,v*(.84+.16*t)));
    const left=p.map((v,k)=>v+side[k]),right=p.map((v,k)=>v-side[k]);
    tri(left,right,q,tone);tri(q,right,left,tone);
    for(const sign of [-1,1]){
     const tip=p.map((v,k)=>v+side[k]*sign*1.9+(k===1?.22:0));
     tri(p,q,tip,tone);tri(tip,q,p,tone);
    }
   }
   tri(base,point(.3),polar(a+.2,.25,.25),s.palette.flower);
  }
 }
 const crown=g.finish().vertices;for(let i=9;i<crown.length;i+=10)crown[i]=material;
 const vertices=new Float32Array(mesh.vertices.length+crown.length);vertices.set(mesh.vertices);vertices.set(crown,mesh.vertices.length);
 const result={...mesh,vertices,count:vertices.length/10,leafGroups:stage==='flowering'?[[mesh.vertices.length,vertices.length]]:[]};
 if(meshDiagnostics(result).degenerate)throw Error('Degenerate Prototaxite crown');
 return result;
}
