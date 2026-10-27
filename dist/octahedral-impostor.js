// Shared capture convention: right-handed object space, Y up, unit view points
// from object to camera. Mesh and package retain the same origin and unit scale.
export const IMPOSTOR_VERSION=1;
// JSON has no negative zero. Canonicalize before hashing so export, reload and
// the GPU's float32 buffer share one stable identity.
export function meshFloat32(vertices){return new Float32Array(Array.from(vertices,x=>x===0?0:x));}
export const dot=(a,b)=>a.reduce((s,v,k)=>s+v*b[k],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const unit=v=>{const n=Math.hypot(...v);if(!n)throw Error('Zero view direction');return v.map(x=>x/n);};
const sign=x=>x<0?-1:1;
export function octDecode(uv){let [x,z]=uv.map(v=>v*2-1),y=1-Math.abs(x)-Math.abs(z);if(y<0)[x,z]=[(1-Math.abs(z))*sign(x),(1-Math.abs(x))*sign(z)];return unit([x,y,z]);}
export function octEncode(v){const sum=v.reduce((s,x)=>s+Math.abs(x),0);if(!sum)throw Error('Zero view direction');let [x,y,z]=v.map(x=>x/sum);if(y<0)[x,z]=[(1-Math.abs(z))*sign(x),(1-Math.abs(x))*sign(z)];return [(x+1)/2,(z+1)/2];}
export function hemiDecode(uv){const [u,v]=uv.map(x=>x*2-1),x=(u+v)/2,z=(u-v)/2;return unit([x,Math.max(0,1-Math.abs(x)-Math.abs(z)),z]);}
export function hemiEncode(v){const [x,y,z]=unit([v[0],Math.max(0,v[1]),v[2]]),sum=Math.abs(x)+y+Math.abs(z);return [((x+z)/sum+1)/2,((x-z)/sum+1)/2];}
export function captureBasis(direction){const right=unit(cross(Math.abs(direction[1])>.99?[0,0,1]:[0,1,0],direction));return {right,up:cross(direction,right),direction};}
export function selectFrames(direction,grid,sampling='sphere'){const encode=sampling==='hemisphere'?hemiEncode:octEncode,decode=sampling==='hemisphere'?hemiDecode:octDecode;const p=encode(direction).map(x=>Math.min(grid-1,Math.max(0,x*(grid-1)))),q=p.map(x=>Math.min(grid-2,Math.floor(x))),f=p.map((x,i)=>x-q[i]);const ids=[[q[0],q[1]],f[0]>f[1]?[q[0]+1,q[1]]:[q[0],q[1]+1],[q[0]+1,q[1]+1]];return ids.map(([x,y],i)=>({index:y*grid+x,weight:[1-Math.max(...f),Math.abs(f[0]-f[1]),Math.min(...f)][i],...captureBasis(decode([x/(grid-1),y/(grid-1)]))}));}
export function useImpostor(pixels,previous=false){return Number.isFinite(pixels)&&pixels<(previous?28:22);}
export function validatePackage(p){
 if(p?.format!=='rfl-octahedral-impostor'||p.version!==IMPOSTOR_VERSION||p.geometry!=='faceted-surface'||p.approved!==true||p.animated)throw Error('Unapproved or unsupported impostor');
 if(p.sampling!==undefined&&!['sphere','hemisphere'].includes(p.sampling))throw Error('Unknown sampling domain');
 if(![8,16].includes(p.grid)||!Number.isInteger(p.size)||p.size<16||p.size>256||p.layers!==p.grid*p.grid)throw Error('Invalid capture layout');
 if(!Array.isArray(p.center)||p.center.length!==3||!p.center.every(Number.isFinite)||!Number.isFinite(p.radius)||p.radius<=0||!Number.isFinite(p.height)||p.height<=0)throw Error('Invalid physical bounds');
 if(!/^[a-f0-9]{64}$/.test(p.meshHash)||!p.textures?.color||!p.textures?.normalDepth)throw Error('Incomplete package');
 let offset=0,expected=p.size;for(const level of p.levels||[]){if(level.size!==expected||level.offset!==offset||level.length!==expected*expected*p.layers*4)throw Error('Invalid mip layout');offset+=level.length;expected=Math.max(1,Math.floor(expected/2));}if(!p.levels?.length||p.levels.at(-1).size!==1)throw Error('Missing mip chain');return p;
}
export async function loadImpostorPackage(url,expectedHash,{fetcher=fetch,signal}={}){
 const manifestURL=new URL(url,globalThis.location?.href||'http://localhost/');
 const response=await fetcher(manifestURL,{signal});if(!response.ok)throw Error('Impostor manifest '+response.status);
 const p=validatePackage(await response.json());if(expectedHash&&p.meshHash!==expectedHash)throw Error('Stale impostor mesh');
 const arrays=await Promise.all(['color','normalDepth'].map(async name=>{const entry=p.textures[name],r=await fetcher(new URL(entry.url,manifestURL),{signal});if(!r.ok)throw Error('Impostor texture '+r.status);const packed=await r.arrayBuffer();const bytes=new Uint8Array(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());if(bytes.length!==p.levels.reduce((n,l)=>n+l.length,0))throw Error('Invalid impostor texture length');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==entry.sha256)throw Error('Corrupt impostor texture');return bytes;}));
 return {...p,color:arrays[0],normalDepth:arrays[1]};
}
// Three independent view projections. Arrays isolate views during filtering.
export const impostorGLSL=`
uniform highp sampler2DArray uOctColor,uOctNormalDepth;
uniform vec3 uOctCenter;uniform float uOctRadius,uOctGrid,uOctHemisphere,uOctLodBias;
in vec3 vOctDirection;in mat3 vOctModel;
vec3 octDecode(vec2 uv){vec2 p=uv*2.-1.;vec3 n=vec3(p.x,1.-abs(p.x)-abs(p.y),p.y);if(n.y<0.)n.xz=(1.-abs(n.zx))*mix(vec2(-1.),vec2(1.),greaterThanEqual(n.xz,vec2(0.)));return normalize(n);}
vec2 octEncode(vec3 n){n/=abs(n.x)+abs(n.y)+abs(n.z);vec2 p=n.xz;if(n.y<0.)p=(1.-abs(p.yx))*mix(vec2(-1.),vec2(1.),greaterThanEqual(p,vec2(0.)));return p*.5+.5;}
vec3 viewDecode(vec2 uv){if(uOctHemisphere<.5)return octDecode(uv);vec2 p=uv*2.-1.;vec2 q=vec2(p.x+p.y,p.x-p.y)*.5;return normalize(vec3(q.x,max(0.,1.-abs(q.x)-abs(q.y)),q.y));}
vec2 viewEncode(vec3 n){if(uOctHemisphere<.5)return octEncode(n);n.y=max(0.,n.y);n/=max(.000001,abs(n.x)+n.y+abs(n.z));return vec2(n.x+n.z,n.x-n.z)*.5+.5;}
void octSample(vec2 cell,vec3 point,vec3 ray,out vec4 pigment,out vec3 normal,out float emission){
 vec3 d=viewDecode(cell/(uOctGrid-1.));vec3 r=normalize(cross(abs(d.y)>.99?vec3(0,0,1):vec3(0,1,0),d)),u=cross(d,r);
 vec2 uv=vec2(dot(point,r),dot(point,u))/(2.*uOctRadius)+.5;float layer=cell.y*uOctGrid+cell.x;
 vec4 nd=texture(uOctNormalDepth,vec3(uv,layer),uOctLodBias);float depth=(nd.b*2.-1.)*uOctRadius;
 vec3 corrected=point+ray*clamp((depth-dot(point,d))/max(.15,dot(ray,d)),-uOctRadius,uOctRadius);
 uv=vec2(dot(corrected,r),dot(corrected,u))/(2.*uOctRadius)+.5;
 pigment=texture(uOctColor,vec3(uv,layer),uOctLodBias);nd=texture(uOctNormalDepth,vec3(uv,layer),uOctLodBias);
 if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))pigment.a=0.;
 normal=octDecode(nd.rg);emission=nd.a; // Unlit pigment; lighting stays in the surface shader.
}
void octSurface(out vec4 pigment,out vec3 normal){
 vec3 ray=normalize(vOctDirection);vec2 p=viewEncode(ray)*(uOctGrid-1.),cell=min(floor(p),vec2(uOctGrid-2.)),f=p-cell;
 vec3 weights=vec3(1.-max(f.x,f.y),abs(f.x-f.y),min(f.x,f.y));
 vec4 a,b,c;vec3 na,nb,nc;float ea,eb,ec;vec3 point=vModel-uOctCenter;
 octSample(cell,point,ray,a,na,ea);octSample(cell+(f.x>f.y?vec2(1,0):vec2(0,1)),point,ray,b,nb,eb);octSample(cell+1.,point,ray,c,nc,ec);
 vec3 coverage=weights*vec3(a.a,b.a,c.a);float alpha=dot(coverage,vec3(1.));if(alpha<.45)discard;
 pigment=vec4((a.rgb*coverage.x+b.rgb*coverage.y+c.rgb*coverage.z)/alpha,dot(vec3(ea,eb,ec),coverage)/alpha);
 normal=normalize(vOctModel*normalize(na*coverage.x+nb*coverage.y+nc*coverage.z));
}
`;
