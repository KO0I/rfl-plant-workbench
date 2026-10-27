import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

export function generatePrototaxiteB(seed,palette){
 const rng=seededRandom(seed),wood=createFloraGeometry(seed),lobes=createFloraGeometry(seed),anchors=[];
 const h=6+rng()*4,phase=rng()*Math.PI*2,lean=(rng()-.5)*h*.07;
 const at=t=>[lean*t*t,h*t,0],polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const add=(a,b)=>a.map((v,k)=>v+b[k]);
 for(let i=0;i<8;i++)wood.branch(at(i/8),at((i+1)/8),h*.045*(1-i*.1),h*.045*(1-(i+1)*.1),palette.bark,7);
 function shoot(base,tip,radius){
  const mid=base.map((v,k)=>v+(tip[k]-v)*.42);
  lobes.branch(base,mid,radius*.45,radius,palette.leaf,7);
  lobes.branch(mid,tip,radius,radius*.025,palette.leaf,7);
  anchors.push({position:tip,size:h*.045});
 }
 for(let i=0;i<9;i++){
  const t=.22+i*.065,a=phase+i*2.399,reach=h*(.17-.09*t)*( .85+rng()*.3);
  const start=at(t),elbow=add(start,polar(a,reach,h*.06)),tip=add(elbow,polar(a,reach*.3,h*(.23+rng()*.07)));
  wood.branch(start,elbow,h*.022,h*.013,palette.bark,6);
  wood.branch(elbow,tip,h*.013,h*.003,palette.bark,5);
  shoot(elbow,tip,h*(.03+rng()*.012));
 }
 shoot(at(.76),at(1.07),h*.045);
 const solid=wood.finish().vertices,green=lobes.finish().vertices;
 for(let i=9;i<green.length;i+=10)green[i]=1;
 const vertices=new Float32Array(solid.length+green.length);vertices.set(solid);vertices.set(green,solid.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:[[solid.length,vertices.length]],produceAnchors:anchors};
 const floor=meshDiagnostics(mesh).bounds.min[1];
 for(let i=1;i<vertices.length;i+=10)vertices[i]-=floor;
 for(const a of anchors)a.position[1]-=floor;
 return mesh;
}

export function attachPrototaxiteBHeads(mesh,s,seed){
 const stage=s.recipe.stage||'normal';if(stage==='normal')return mesh;
 const g=createFloraGeometry(seed),rng=seededRandom(seed^0x71bc),anchors=mesh.produceAnchors;
 // One bright stamen color per individual, on half its flowers.
 const stamenColor=rng()<.5?[1,.44,.06]:[.08,.9,1];
 const withStamens=new Set(anchors.map((_,i)=>({i,rank:rng()})).sort((a,b)=>a.rank-b.rank).slice(0,Math.floor(anchors.length/2)).map(x=>x.i));
 anchors.forEach((anchor,index)=>{
  const p=v=>v.map((n,k)=>n*anchor.size+anchor.position[k]);
  const tri=(a,b,c,color)=>g.tri(p(a),p(b),p(c),color);
  if(stage==='bud'){
   // Latitude rings plus pole fans produce a round white sphere without degenerate poles.
   const rings=Array.from({length:7},(_,j)=>Array.from({length:12},(_,i)=>{
    const phi=(j+1)*Math.PI/8,a=i*Math.PI/6;
    return [Math.sin(phi)*Math.cos(a)*.64,.6+Math.cos(phi)*.64,Math.sin(phi)*Math.sin(a)*.64];
   }));
   for(let i=0;i<12;i++){
    const n=(i+1)%12;tri([0,1.24,0],rings[0][i],rings[0][n],[.96,.96,.92]);
    tri([0,-.04,0],rings[6][n],rings[6][i],[.91,.92,.9]);
    for(let j=0;j<6;j++){tri(rings[j][i],rings[j+1][i],rings[j][n],[.96,.96,.92]);tri(rings[j][n],rings[j+1][i],rings[j+1][n],[.96,.96,.92]);}
   }
  }else{
   const phase=rng()*Math.PI*2;
   for(let petal=0;petal<5;petal++){
    const a=phase+petal*Math.PI*2/5,polar=(angle,r,y)=>[Math.cos(angle)*r,y,Math.sin(angle)*r];
    const base=[0,.14,0],left=polar(a-.35,.62,.22),right=polar(a+.35,.62,.22),ridge=polar(a,.58,.43),tip=polar(a,1.25,.4),bottom=polar(a,.52,.02);
    const color=s.palette.flower;
    for(const face of [[base,left,ridge],[base,ridge,right],[left,tip,ridge],[ridge,tip,right],[base,bottom,left],[base,right,bottom],[left,bottom,tip],[bottom,right,tip]])tri(...face,color);
   }
   if(withStamens.has(index))for(let j=0;j<7;j++){
    const a=phase+(j-3)*.13,start=[0,.25,0],tip=[Math.cos(a)*(.35+j*.06),1.0+(j%3)*.15,Math.sin(a)*(.35+j*.06)];
    g.branch(p(start),p(tip),anchor.size*.018,anchor.size*.006,stamenColor,4);
    for(let k=1;k<=3;k++){
     const t=k/4,middle=start.map((v,n)=>v+(tip[n]-v)*t);
     for(const side of [-1,1]){
      const barb=middle.map((v,n)=>v+(n===1?.1:(n===0?-Math.sin(a):Math.cos(a))*side*.14));
      g.branch(p(middle),p(barb),anchor.size*.009,anchor.size*.002,stamenColor,3);
     }
    }
   }
  }
 });
 const heads=g.finish().vertices,vertices=new Float32Array(mesh.vertices.length+heads.length);
 vertices.set(mesh.vertices);vertices.set(heads,mesh.vertices.length);
 return {...mesh,vertices,count:vertices.length/10};
}
