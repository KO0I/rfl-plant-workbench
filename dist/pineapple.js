import {createFloraGeometry,seededRandom} from './faceted-flora.js';

export function generatePineapple(seed,palette){
 const rng=seededRandom(seed),g=createFloraGeometry(seed),phase=rng()*Math.PI*2;
 g.branch([0,0,0],[0,.68,0],.065,.035,palette.bark,8);
 for(let i=0;i<42;i++){
  const a=phase+i*2.399,t=i/41,reach=.83*(1-t)+.12,y=.25+t*.75;
  const base=[Math.cos(a)*.035,.06+t*.16,Math.sin(a)*.035];
  const tip=[Math.cos(a)*reach,y,Math.sin(a)*reach];
  g.leaf(base,tip,.065+rng()*.035,.10,palette.leaf.map(v=>v*(.85+rng()*.2)));
 }
 const mesh=g.finish();
 return {...mesh,produceAnchors:[{position:[0,.68,0],size:.32,up:true}],leafGroups:[]};
}

// Unit reproductive head; generic attachment scales it onto the central stalk.
export function pineappleHead(color,flowering,seed){
 const g=createFloraGeometry(seed),sides=10,rows=7;
 const point=(a,y,r)=>[Math.cos(a)*r,y,Math.sin(a)*r];
 g.branch([0,.02,0],[0,.30,0],.25,.34,color.map(v=>v*.65),10);
 g.branch([0,.30,0],[0,.90,0],.34,.33,color.map(v=>v*.65),10);
 g.branch([0,.90,0],[0,1.18,0],.33,.22,color.map(v=>v*.65),10);
 for(let row=0;row<rows;row++)for(let i=0;i<sides;i++){
  const a=(i+(row%2)*.5)*Math.PI*2/sides,y=.12+row*.16;
  const r=.27+.10*Math.sin((row+1)*Math.PI/8),c=color.map(v=>v*(.78+.18*((i+row)%3)/2));
  const center=point(a,y,r+.045),corners=[point(a-.32,y,r),point(a,y+.10,r),point(a+.32,y,r),point(a,y-.10,r)];
  for(let j=0;j<4;j++)g.tri(center,corners[j],corners[(j+1)%4],c);
  if(flowering){const p=point(a,y,r+.06),tip=point(a,y+.06,r+.14);g.branch(p,tip,.026,.012,color,4);}
 }
 for(let i=0;i<16;i++){
  const a=i*2.399,reach=.15+(i%4)*.06,tip=point(a,1.35+(i%5)*.10,reach);
  g.leaf([0,1.12,0],tip,.09,.04,[.24,.42,.20]);
 }
 const mesh=g.finish();
 // Upright anchors flip fruit Y on attachment, while flowers remain upright.
 if(!flowering)for(let i=0;i<mesh.vertices.length;i+=10){mesh.vertices[i+1]*=-1;mesh.vertices[i+4]*=-1;}
 return mesh;
}
