import {createFloraGeometry,seededRandom,meshDiagnostics} from './faceted-flora.js';

// A generalized prehistoric tree-fern silhouette, not a fossil-species reconstruction.
export function generateTreeFern(recipe,seed,palette){
 const rng=seededRandom(seed),trunk=createFloraGeometry(seed),fronds=createFloraGeometry(seed);
 const range=(a,b)=>a+(b-a)*rng(),ranges={young:[3,6],mature:[8,12],giant:[12,15]};
 const height=range(...ranges[recipe.sizeClass||'mature']),phase=range(0,6.283);
 const polar=(a,r,y)=>[Math.cos(a)*r,y,Math.sin(a)*r],add=(a,b)=>a.map((v,k)=>v+b[k]);
 const stem=t=>[.15*Math.sin(t*2)*t,8*t,.10*t*t];
 for(let j=0;j<18;j++){
  const t=j/18,u=(j+1)/18,r=.29*(1-.32*t),next=.29*(1-.32*u);
  trunk.branch(stem(t),stem(u),r*(j%2?1:1.12),next,palette.bark.map(v=>v*(j%2?.83:1)),6);
 }
 for(let j=0;j<6;j++)trunk.branch(polar(phase+j*1.047,.48,0),stem(.06),.04,.13,palette.bark,6);
 const crown=stem(1);
 for(let i=0;i<10;i++){
  const a=phase+i*2.399,reach=range(2.8,3.7),rise=range(.65,1.15);
  const point=t=>add(crown,polar(a,reach*t,rise*Math.sin(t*Math.PI)-.65*t*t));
  for(let j=0;j<8;j++)fronds.branch(point(j/8),point((j+1)/8),.035*(1-j/9),.035*(1-(j+1)/9),palette.leaf,4);
  for(let j=0;j<10;j++)for(const side of [-1,1]){
   const t=.09+j*.085,base=point(t),b=a+side*1.18,length=.12+.65*Math.sin(t*Math.PI);
   const tip=add(base,polar(b,length,.06));
   fronds.branch(base,tip,.012,.002,palette.leaf,3);
   for(let k=0;k<3;k++){
    const u=.18+k*.27,p=base.map((v,n)=>v+(tip[n]-v)*u),leafTip=add(p,polar(b+side*.3,length*(1-u)*.7,.025));
    fronds.leaf(p,leafTip,.12*(1-u)+.025,.018,palette.leaf.map(v=>v*(.83+j*.014)));
   }
  }
 }
 const w=trunk.finish().vertices,f=fronds.finish().vertices;
 for(let i=9;i<f.length;i+=10)f[i]=1;
 const vertices=new Float32Array(w.length+f.length);vertices.set(w);vertices.set(f,w.length);
 const mesh={vertices,count:vertices.length/10,leafGroups:[],produceAnchors:[]};
 const d=meshDiagnostics(mesh),scale=height/d.dimensions[1];
 for(let i=0;i<vertices.length;i+=10)for(let k=0;k<3;k++)vertices[i+k]=(vertices[i+k]-(k===1?d.bounds.min[1]:0))*scale;
 return mesh;
}
