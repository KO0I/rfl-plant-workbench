import {createFloraGeometry,seededRandom} from './faceted-flora.js';
// Mesh adaptation of XPM Workbench drawCactus, retaining its 7/15-unit
// silhouettes, 56% arm junction, unequal arm heights and source palettes.
// Exact original sprites and provenance are in xpm-cactus-references.json.
export function generateXpmCactus(recipe,seed,palette){
 if(!['low','tall'].includes(recipe.form))throw Error('Unknown XPM cactus form');
 const g=createFloraGeometry(seed),rng=seededRandom(seed),tall=recipe.form==='tall',units=tall?15:7,step=.22*(.9+rng()*.2),h=units*step,r=step*(tall?.72:.63),reach=(tall?4:3)*step,y=Math.round(units*.56)*step,anchors=[];
 const angle=(rng()-.5)*.35,point=(x,y)=>[x*Math.cos(angle),y,x*Math.sin(angle)];
 function tube(a,b,radius){g.branch(a,b,radius,radius*.92,palette.leaf,8);}
 function cap(p,radius){g.clump(p,radius,palette.leaf.map(v=>Math.min(1,v*1.2)));anchors.push({position:[p[0],p[1]+radius*.7,p[2]],size:radius*.9,up:true});}
 tube([0,0,0],[0,h-r*.5,0],r);cap([0,h-r*.5,0],r);
 const left=-Math.max(2,(tall?4:3)-1)*step;
 for(const [x,base,top]of[[reach,y,y+3*step],[left,y-2*step,y]]){const elbow=point(x,base),tip=point(x,top);tube(point(0,base),elbow,r*.78);tube(elbow,tip,r*.78);cap(tip,r*.78);}
 // Small, pale areoles echo the sprite's alternating highlights.
 for(let i=1;i<units;i+=2){const p=[r*.75,i*step,r*.55];g.clump(p,step*.055,[.72,.78,.47]);}
 return {...g.finish(),produceAnchors:anchors};
}
