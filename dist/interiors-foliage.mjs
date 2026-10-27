// Stationary world-space leaf clusters. No frame seed, screen-door grid or tree billboards.
function hash(x,y,z){const mod=n=>((n%251)+251)%251;let n=mod(x);n=mod(mod(n*n)*3+n*17+mod(y)*59);n=mod(mod(n*n)*3+n*17+mod(z)*101);return mod(mod(n*n)*3+n*17)/251;}
const clusterField=new Float32Array(32768);
for(let z=0;z<32;z++)for(let y=0;y<32;y++)for(let x=0;x<32;x++)clusterField[(z*32+y)*32+x]=hash(x,y,z);
const cell=(x,y,z)=>clusterField[((z&31)*32+(y&31))*32+(x&31)];
function cluster(x,y,z){x*=.68;y*=.68;z*=.68;const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let u=x-ix,v=y-iy,w=z-iz;u=u*u*(3-2*u);v=v*v*(3-2*v);w=w*w*(3-2*w);const a=cell(ix,iy,iz)*(1-u)+cell(ix+1,iy,iz)*u,b=cell(ix,iy+1,iz)*(1-u)+cell(ix+1,iy+1,iz)*u,c=cell(ix,iy,iz+1)*(1-u)+cell(ix+1,iy,iz+1)*u,d=cell(ix,iy+1,iz+1)*(1-u)+cell(ix+1,iy+1,iz+1)*u;return (a*(1-v)+b*v)*(1-w)+(c*(1-v)+d*v)*w;}
// Inverse-distance refinement: twice as close reveals twice as many leaf cells per metre.
// Blend fixed world-space octaves, never stretch/reseed a pattern as the camera moves.
export function foliageDensity(distance=Infinity){return Math.max(1,Math.min(8,28/Math.max(3.5,distance)));}
const noiseField=new Float32Array(64**3);for(let z=0;z<64;z++)for(let y=0;y<64;y++)for(let x=0;x<64;x++)noiseField[(z*64+y)*64+x]=hash(x,y,z);
const noiseCell=(x,y,z)=>noiseField[((z&63)*64+(y&63))*64+(x&63)];
// Continuous anisotropic noise gives irregular leaf-shaped islands, without cell outlines.
function noise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);let u=x-ix,v=y-iy,w=z-iz;u=u*u*(3-2*u);v=v*v*(3-2*v);w=w*w*(3-2*w);let sum=0;for(let k=0;k<2;k++)for(let j=0;j<2;j++)for(let i=0;i<2;i++)sum+=noiseCell(ix+i,iy+j,iz+k)*(i?u:1-u)*(j?v:1-v)*(k?w:1-w);return sum;}
function leafSample(x,y,z,scale){const a=(x*.82+z*.57)*scale,b=(y*1.35+x*.21-z*.18)*scale,c=(z*.82-x*.57)*scale;return noise(a,b,c)*.78+noise(a*2.07+7.3,b*2.07-3.1,c*2.07+1.7)*.22;}
export function foliageTier(x,y,z,distance=Infinity){
 const broad=cluster(x,y,z),lod=Math.log2(foliageDensity(distance)),level=Math.floor(lod),blend=lod-level,scale=6.5*2**level,a=leafSample(x,y,z,scale),b=blend?leafSample(x,y,z,scale*2):a,leaf=a+(b-a)*blend;
 if(broad<.06||leaf<.31+(broad<.32?.07:0))return -1;
 const tone=broad*.45+leaf*.55;return tone<.37?0:tone<.54?1:tone<.68?2:3;
}
export const foliageGLSL=`
float leafHash(vec3 p){p=mod(p,251.);float n=p.x;n=mod(mod(n*n,251.)*3.+n*17.+p.y*59.,251.);n=mod(mod(n*n,251.)*3.+n*17.+p.z*101.,251.);return mod(mod(n*n,251.)*3.+n*17.,251.)/251.;}
float leafCluster(vec3 p){vec3 i=floor(p*.68),f=fract(p*.68);f=f*f*(3.-2.*f);float a=mix(leafHash(mod(i,32.)),leafHash(mod(i+vec3(1,0,0),32.)),f.x),b=mix(leafHash(mod(i+vec3(0,1,0),32.)),leafHash(mod(i+vec3(1,1,0),32.)),f.x),c=mix(leafHash(mod(i+vec3(0,0,1),32.)),leafHash(mod(i+vec3(1,0,1),32.)),f.x),d=mix(leafHash(mod(i+vec3(0,1,1),32.)),leafHash(mod(i+vec3(1,1,1),32.)),f.x);return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);}
float leafNoise(vec3 p){vec3 i=mod(floor(p),64.),f=fract(p);f=f*f*(3.-2.*f);float a=mix(leafHash(i),leafHash(mod(i+vec3(1,0,0),64.)),f.x),b=mix(leafHash(mod(i+vec3(0,1,0),64.)),leafHash(mod(i+vec3(1,1,0),64.)),f.x),c=mix(leafHash(mod(i+vec3(0,0,1),64.)),leafHash(mod(i+vec3(1,0,1),64.)),f.x),d=mix(leafHash(mod(i+vec3(0,1,1),64.)),leafHash(mod(i+vec3(1,1,1),64.)),f.x);return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);}
float leafSample(vec3 p,float scale){vec3 q=vec3(p.x*.82+p.z*.57,p.y*1.35+p.x*.21-p.z*.18,p.z*.82-p.x*.57)*scale;return leafNoise(q)*.78+leafNoise(q*2.07+vec3(7.3,-3.1,1.7))*.22;}
float leafTier(vec3 p,float distance){float broad=leafCluster(p),lod=log2(clamp(28./max(3.5,distance),1.,8.)),level=floor(lod),blend=lod-level,scale=6.5*exp2(level),leaf=mix(leafSample(p,scale),leafSample(p,scale*2.),blend);if(broad<.06||leaf<.31+(broad<.32?.07:0.))return -1.;float tone=broad*.45+leaf*.55;return tone<.37?0.:tone<.54?1.:tone<.68?2.:3.;}
vec3 leafColor(vec3 base,float tier){if(tier<.5)return base*.5;if(tier<1.5)return base*.85;if(tier<2.5)return base*1.16+vec3(.06,.08,0.);return base*1.24+vec3(.1,.12,.015);}
`;
export function foliageColors(base){return [base.map(v=>v*.5),base.map(v=>v*.85),base.map((v,i)=>v*1.16+[.06,.08,0][i]),base.map((v,i)=>v*1.24+[.1,.12,.015][i])];}
// Small volumetric fringe patches break the large polygon outline from every angle.
export function foliageGeometry(p,s,color,emit){
 const q=(1+Math.sqrt(5))/2,raw=[[-1,q,0],[1,q,0],[-1,-q,0],[1,-q,0],[0,-1,q],[0,1,q],[0,-1,-q],[0,1,-q],[q,0,-1],[q,0,1],[-q,0,-1],[-q,0,1]],unit=raw.map(a=>a.map(v=>v/Math.sqrt(1+q*q))),points=unit.map(a=>a.map((v,k)=>p[k]+v*s[k]));
 const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 const normals=unit.map(a=>{const v=a.map((n,k)=>n/s[k]),l=Math.hypot(...v);return v.map(n=>n/l);});
 for(const f of faces)emit(...f.map(i=>points[i]),color,'foliage',1,f.map(i=>normals[i]));
 for(let i=0;i<12;i++){
  const direction=unit[i],n=normals[i],angle=i*2.39996+p[0]*.71+p[2]*.31,center=direction.map((v,k)=>p[k]+v*s[k]*(1+.06*Math.sin(angle))),axis=Math.abs(n[1])>.8?[1,0,0]:[0,1,0];
  let u=[n[1]*axis[2]-n[2]*axis[1],n[2]*axis[0]-n[0]*axis[2],n[0]*axis[1]-n[1]*axis[0]],len=Math.hypot(...u);u=u.map(v=>v/len);const v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]],radius=Math.min(...s)*(.3+.08*Math.sin(angle));
  const corners=[[-1,-.55],[.7,-.8],[1,.6],[-.8,1]].map(([a,b])=>center.map((x,k)=>x+(u[k]*a+v[k]*b)*radius));
  emit(corners[0],corners[1],corners[2],color,'foliage',1,[n,n,n]);emit(corners[0],corners[2],corners[3],color,'foliage',1,[n,n,n]);
 }
}
