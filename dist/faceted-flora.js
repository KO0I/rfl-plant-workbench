// Authoring/offline geometry only. Positions are meters; Y up; flat face normals.
// Runtime streaming consumes baked assets, never these generators.
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]);
const mul=(a,s)=>a.map(x=>x*s),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const n=Math.hypot(...a);return n?mul(a,1/n):[0,0,0];};
export {add as floraAdd};
export function seededRandom(seed){let state=seed>>>0;return()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function createFloraGeometry(variant=0){
 const vertices=[];
 const tri=(a,b,c,color,material=0)=>{const n=norm(cross(sub(b,a),sub(c,a)));for(const p of [a,b,c])vertices.push(...p,...n,...color,material);};
 function branch(a,b,r0,r1,color,sides=5){
  const axis=norm(sub(b,a)),right=norm(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),depth=cross(axis,right);
  const ring=(p,r,i)=>add(p,add(mul(right,Math.cos(i*2*Math.PI/sides)*r),mul(depth,Math.sin(i*2*Math.PI/sides)*r)));
  for(let i=0;i<sides;i++){const A=ring(a,r0,i),B=ring(a,r0,i+1),C=ring(b,r1,i),D=ring(b,r1,i+1),tone=color.map(c=>c*(.78+.065*i));tri(A,B,C,tone);tri(B,D,C,tone);tri(b,C,D,tone);}
 }
 function crown(p,r,color){
  for(let i=0;i<6;i++){const a=i*2*Math.PI/6+variant*.4,d=[Math.cos(a),0,Math.sin(a)],side=[-d[2]*r*.16,0,d[0]*r*.16],tip=add(p,[d[0]*r,r*(i%3===0?.9:.22),d[2]*r]);const A=sub(p,side),B=add(p,side);tri(A,B,tip,color);tri(B,A,tip,color);}
 }
 function clump(p,r,color,material=0){
  const top=add(p,[0,r*.7,0]),bottom=sub(p,[0,r*.7,0]);
  for(let i=0;i<4;i++){const a=i*Math.PI/2,b=(i+1)*Math.PI/2,A=add(p,[Math.cos(a)*r,0,Math.sin(a)*r]),B=add(p,[Math.cos(b)*r,0,Math.sin(b)*r]);tri(top,B,A,color.map(c=>c*(.8+i*.08)),material);tri(bottom,A,B,color,material);}
 }
 function leaf(base,tip,width,fold,color){
  const axis=norm(sub(tip,base)),side=mul(norm(cross(axis,Math.abs(axis[1])>.95?[1,0,0]:[0,1,0])),width/2);
  const mid=add(mul(add(base,tip),.5),[0,fold,0]),left=add(mid,side),right=sub(mid,side);
  for(const [a,b,c] of [[base,left,tip],[base,tip,right]]){tri(a,b,c,color);tri(c,b,a,color);}
 }
 function polyhedron(points,faces,color){for(const [i,j,k] of faces)tri(points[i],points[j],points[k],color);}
 function finish(){return {vertices:new Float32Array(vertices),count:vertices.length/10};}
 return {tri,branch,crown,clump,leaf,polyhedron,finish};
}
export function meshDiagnostics(mesh){
 const v=mesh.vertices;if(!v?.length||v.length%30||v.length>3000000||!Array.from(v).every(Number.isFinite))throw Error('Expected finite triangular position/normal/color vertices (stride 10)');
 const min=[Infinity,Infinity,Infinity],max=min.map(x=>-x);let degenerate=0,nonFlat=0;
 for(let i=0;i<v.length;i+=30){const a=v.slice(i,i+3),b=v.slice(i+10,i+13),c=v.slice(i+20,i+23),area=cross(sub(b,a),sub(c,a));if(Math.hypot(...area)<1e-12)degenerate++;
  for(let j=0;j<30;j+=10){for(let k=0;k<3;k++){min[k]=Math.min(min[k],v[i+j+k]);max[k]=Math.max(max[k],v[i+j+k]);if(Math.abs(v[i+j+3+k]-v[i+3+k])>1e-6)nonFlat++;}}
 }
 const dimensions=max.map((x,i)=>x-min[i]),center=max.map((x,i)=>(x+min[i])/2);let radius=0;for(let i=0;i<v.length;i+=10)radius=Math.max(radius,Math.hypot(...center.map((x,k)=>v[i+k]-x)));
 return {triangles:v.length/30,degenerate,nonFlat,bounds:{min,max,center,radius},dimensions};
}
// General recursive growth recipe. All variation comes from the supplied seed.
export function growFlora(recipe,seed=0,palette={bark:[.27,.23,.30],leaf:[.27,.40,.37],flower:[.98,.34,.62]}){
 const {height=3,spread=.6,depth=2,forks=3,taper=.65,foliage=1,flowers=0}=recipe;
 if(![height,spread,depth,forks,taper,foliage,flowers].every(Number.isFinite)||height<=0||height>200||spread<=0||spread>5||!Number.isInteger(depth)||depth<0||depth>4||!Number.isInteger(forks)||forks<1||forks>5||taper<=0||taper>=1||foliage<0||foliage>3||flowers<0||flowers>1)throw Error('Growth recipe exceeds bounded authoring limits');
 const random=seededRandom(seed),g=createFloraGeometry(seed%16),produceAnchors=[];
 function grow(a,b,r,level){g.branch(a,b,r,r*taper,palette.bark);if(!level){produceAnchors.push({position:[...b],size:height*.035});if(foliage)g.clump(b,height*.12*foliage,palette.leaf,1);if(flowers&&random()<flowers)g.crown(add(b,[0,height*.08,0]),height*.07,palette.flower);return;}
  for(let i=0;i<forks;i++){const angle=i*2*Math.PI/forks+random()*.8,len=height*.32*Math.pow(taper,depth-level),tip=add(b,[Math.cos(angle)*len*spread,len*(.65+random()*.35),Math.sin(angle)*len*spread]);grow(b,tip,r*taper,level-1);}}
 grow([0,0,0],[0,height*.42,0],height*.035,depth);
 const mesh=g.finish(),bounds=meshDiagnostics(mesh);const scale=height/bounds.dimensions[1];
 // A recipe height is exact; normalize once during authoring, never per planet.
 for(let i=0;i<mesh.vertices.length;i+=10)for(let k=0;k<3;k++)mesh.vertices[i+k]=(mesh.vertices[i+k]-(k===1?bounds.bounds.min[1]:0))*scale;
 mesh.produceAnchors=produceAnchors.map(a=>({position:a.position.map((v,k)=>(v-(k===1?bounds.bounds.min[1]:0))*scale),size:a.size*scale}));
 return mesh;
}
