// This face is selected only by canvas text; website typography stays in its CSS.
let fontPromise;
export function loadRflViewfinderFont(){
 if(!fontPromise)fontPromise=(async()=>{
  if(typeof FontFace==='undefined'||typeof document==='undefined'||!document.fonts)return false;
  try{
   const source=new URL('./assets/fonts/rfl-english.woff',import.meta.url);
   const face=await new FontFace('RFL English',`url("${source.href}")`,{style:'normal',weight:'400'}).load();
   document.fonts.add(face);
   return true;
  }catch{return false;}
 })();
 return fontPromise;
}
