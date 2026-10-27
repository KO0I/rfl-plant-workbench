// Vertex material flags: 0 solid, 1 dithered crown, 2 emissive dithered crown.
// Preserve flag 2 in exported meshes; emission belongs only to crown triangles.
export function previewBrightness(material,normalDotLight,night=false){
 return material>1.5?1:(night?.04:.36)+(night?.08:.64)*Math.max(0,normalDotLight);
}
export const previewLightingGLSL=`
uniform float uNight;
float floraBrightness(float material,float light){
 if(material>1.5)return 1.;
 return mix(.36,.04,uNight)+mix(.64,.08,uNight)*max(0.,light);
}`;
