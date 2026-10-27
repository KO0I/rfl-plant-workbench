import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

// Fictional prairie plant: bare stems, one terminal reproductive head per stem.
export function generateZosteophyl(recipe,seed,palette){
 const rng=seededRandom(seed),g=createFloraGeometry(seed),anchors=[];
 const range=(a,b)=>a+(b-a)*rng(),thorny=recipe.thorns??(rng()<.85);
 const heightMeters=range(.5,2),phase=range(0,Math.PI*2),count=4+Math.floor(rng()*3);
 for(let stem=0;stem<count;stem++){
  const a=phase+stem*2.399,height=stem===0?2:range(1.25,1.9),spread=stem===0?.1:range(.22,.55);
  const at=t=>[Math.cos(a)*spread*t*t,height*t,Math.sin(a)*spread*t*t];
  for(let j=0;j<9;j++){
   const t=j/9,next=(j+1)/9;
   g.branch(at(t),at(next),.022*(1-.65*t),.022*(1-.65*next),palette.bark,5);
  }
  if(thorny)for(let j=0;j<12;j++){
   const t=.12+j*.06,p=at(t),angle=a+j*2.399,length=range(.055,.12);
   const tip=[p[0]+Math.cos(angle)*length,p[1]+length*.5,p[2]+Math.sin(angle)*length];
   g.branch(p,tip,.012,.0008,palette.bark.map((v,k)=>v*.65+[.20,.09,.05][k]),4);
  }
  anchors.push({position:at(1),size:.17});
 }
 const mesh=g.finish(),diagnostics=meshDiagnostics(mesh),minimum=diagnostics.bounds.min[1],scale=heightMeters/diagnostics.dimensions[1];
 for(let i=0;i<mesh.vertices.length;i+=10)for(let k=0;k<3;k++)mesh.vertices[i+k]=(mesh.vertices[i+k]-(k===1?minimum:0))*scale;
 mesh.produceAnchors=anchors.map(a=>({size:a.size*scale,position:a.position.map((v,k)=>(v-(k===1?minimum:0))*scale)}));
 mesh.leafGroups=[];
 return mesh;
}
