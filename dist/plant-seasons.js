export const SEASONS=['summer','fall','winter','spring'];
export function supportsSeasons(s){return (s.recipe.kind==='interiors'&&s.recipe.form==='tree')||(s.recipe.kind==='tree-form'&&['ginkgo','willow','acacia-spined','acacia','oak','aspen','ash','apple','peach','pear'].includes(s.recipe.form))||(s.recipe.kind==='botanical'&&s.recipe.form==='baobab')||s.recipe.kind==='growth';}
// Seasons change only leaves. Branch positions and seed identity remain stable.
export function applySeason(mesh,season,form=null){
 if(season==='summer')return mesh;
 if(season==='winter'){
  const rows=[];for(let i=0;i<mesh.vertices.length;i+=30)if(mesh.vertices[i+9]<.5)for(let j=0;j<30;j++)rows.push(mesh.vertices[i+j]);
  return {...mesh,vertices:new Float32Array(rows),count:rows.length/10};
 }
 const vertices=new Float32Array(mesh.vertices),autumn=['ginkgo','aspen','pear','peach'].includes(form)?[[.88,.65,.12],[.94,.76,.2],[.76,.5,.09],[.87,.69,.18]]:[[.72,.3,.09],[.84,.53,.12],[.6,.19,.08],[.67,.42,.13]];
 for(const [index,group] of (mesh.leafGroups||[]).entries()){
  const [start,end]=group,min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=start;i<end;i+=10)for(let k=0;k<3;k++){min[k]=Math.min(min[k],vertices[i+k]);max[k]=Math.max(max[k],vertices[i+k]);}
  const center=min.map((v,k)=>(v+max[k])/2),color=autumn[index%autumn.length];
  for(let i=start;i<end;i+=10)for(let k=0;k<3;k++){
   if(season==='spring'){vertices[i+k]=center[k]+(vertices[i+k]-center[k])*.62;vertices[i+6+k]=Math.min(1,vertices[i+6+k]*.65+[.22,.34,.09][k]);}
   else vertices[i+6+k]=color[k]*(.88+.12*vertices[i+6+k]);
  }
 }
 // Generic growth geometry has foliage flags but no crown ranges.
 if(!mesh.leafGroups?.length)for(let i=0;i<vertices.length;i+=10)if(vertices[i+9]>.5)for(let k=0;k<3;k++)vertices[i+6+k]=season==='fall'?autumn[0][k]:Math.min(1,vertices[i+6+k]*.65+[.22,.34,.09][k]);
 return {...mesh,vertices};
}
