import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

// The main stem and all removable whorls are separate material groups.
// Burnt form therefore keeps jointed stem only, never bare side branches.
export function generateCalamites(recipe,seed,palette){
 const rng=seededRandom(seed),stem=createFloraGeometry(seed),whorls=createFloraGeometry(seed);
 const range=(a,b)=>a+(b-a)*rng(),sizes={young:[1,2,5],mature:[5,12,8],giant:[15,20,9]};
 const [lo,hi,levels]=sizes[recipe.sizeClass||'mature'],height=range(lo,hi);
 const h=10,radius=recipe.sizeClass==='young'?.10:.19,phase=range(0,Math.PI*2),lean=range(-.18,.18);
 const at=t=>[lean*t*t,h*t,0],polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 const add=(a,b)=>a.map((v,k)=>v+b[k]);
 for(let i=0;i<14;i++){
  const t=i/14,next=(i+1)/14,r=radius*(1-.65*t),end=radius*(1-.65*next);
  stem.branch(at(t),at(next),r,end,palette.bark,8);
  if(i>0){const shade=palette.bark.map(v=>v*.55);stem.branch(at(t-.003),at(t+.003),r*1.12,r*1.12,shade,8);}
 }
 for(let level=0;level<levels;level++){
  const t=.22+level*.65/(levels-1),base=at(t),reach=range(.85,1.25)*(1-t*.55);
  for(let arm=0;arm<8;arm++){
   const a=phase+arm*Math.PI/4+level*.35,elbow=add(base,polar(a,reach*.55,.07)),tip=add(base,polar(a,reach,range(.35,.65)));
   whorls.branch(base,elbow,.025,.016,palette.leaf,4);
   whorls.branch(elbow,tip,.016,.005,palette.leaf,4);
   for(let j=1;j<=2;j++){
    const f=j/3,p=elbow.map((v,k)=>v+(tip[k]-v)*f);
    for(const side of [-1,1]){
     const end=add(p,polar(a+side*.55,range(.22,.38),range(.2,.38)));
     whorls.branch(p,end,.009,.0018,palette.leaf,3);
    }
   }
  }
 }
 const trunk=stem.finish().vertices,branches=whorls.finish().vertices;
 // Every side branch is removed by the existing burnt/winter material filter.
 for(let i=9;i<branches.length;i+=10)branches[i]=1;
 const vertices=new Float32Array(trunk.length+branches.length);vertices.set(trunk);vertices.set(branches,trunk.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:[[trunk.length,vertices.length]]};
 const {bounds,dimensions}=meshDiagnostics(mesh),scale=height/dimensions[1];
 for(let i=0;i<vertices.length;i+=10)for(let k=0;k<3;k++)vertices[i+k]=(vertices[i+k]-(k===1?bounds.min[1]:0))*scale;
 mesh.produceAnchors=[{position:at(1).map((v,k)=>(v-(k===1?bounds.min[1]:0))*scale),size:.4*scale}];
 return mesh;
}
