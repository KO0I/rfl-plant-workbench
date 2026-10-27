// Input changes orientation and detail only. Camera framing is owned by the renderer.
export function bindPreviewControls(canvas,{onChange,initial={},frameInterval=0,host=window,page=document}){
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wrap=v=>((v+180)%360+360)%360-180;
 let state={yaw:35,pitch:15,lod:1.5,autoOrbit:false,...initial},frame=0,last=0,painted=0,dirty=false,gestureScale=1;
 const pointers=new Map(),listeners=[];
 const listen=(target,name,fn,options)=>{target.addEventListener(name,fn,options);listeners.push(()=>target.removeEventListener(name,fn,options));};
 const snapshot=()=>({...state});
 function schedule(){if(!frame&&!page.hidden)frame=host.requestAnimationFrame(tick);}
 function update(patch){const next={...state,...patch};next.yaw=wrap(next.yaw);next.pitch=clamp(next.pitch,-80,85);next.lod=clamp(next.lod,0,3);if(Object.keys(next).every(k=>next[k]===state[k]))return;state=next;dirty=true;schedule();}
 function tick(now){frame=0;if(page.hidden)return;const dt=last?Math.min(1,(now-last)/1000):0;last=now;
  if(state.autoOrbit&&!pointers.size){state.yaw=wrap(state.yaw+dt*18);dirty=true;}
  if(dirty&&now-painted>=frameInterval){dirty=false;painted=now;onChange(snapshot());}
  if(dirty||state.autoOrbit)schedule();else last=0;
 }
 const separation=()=>{const [a,b]=[...pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y);};
 listen(canvas,'pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.classList.add('dragging');});
 listen(canvas,'pointermove',e=>{const previous=pointers.get(e.pointerId);if(!previous)return;e.preventDefault();const before=pointers.size===2?separation():0;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===1)update({yaw:state.yaw+(e.clientX-previous.x)*.35,pitch:state.pitch+(e.clientY-previous.y)*.3});
  else if(pointers.size===2){const after=separation();if(before>2&&after>2)update({lod:state.lod-Math.log2(after/before)});}
 });
 function release(e){pointers.delete(e.pointerId);if(!pointers.size)canvas.classList.remove('dragging');}
 for(const event of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,event,release);
 listen(canvas,'wheel',e=>{e.preventDefault();const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1);update({lod:state.lod+clamp(pixels,-300,300)*(e.ctrlKey?.012:.003)});},{passive:false});
 // Safari trackpad gestures may arrive without touch PointerEvents.
 listen(canvas,'gesturestart',e=>{e.preventDefault();gestureScale=e.scale||1;},{passive:false});
 listen(canvas,'gesturechange',e=>{e.preventDefault();if(pointers.size<2&&e.scale>0)update({lod:state.lod-Math.log2(e.scale/gestureScale)});gestureScale=e.scale||1;},{passive:false});
 listen(canvas,'gestureend',e=>{e.preventDefault();gestureScale=1;},{passive:false});
 listen(canvas,'keydown',e=>{const changes={ArrowLeft:{yaw:state.yaw-5},ArrowRight:{yaw:state.yaw+5},ArrowUp:{pitch:state.pitch-5},ArrowDown:{pitch:state.pitch+5},'+':{lod:state.lod-.25},'=':{lod:state.lod-.25},'-':{lod:state.lod+.25}};if(changes[e.key]){e.preventDefault();update(changes[e.key]);}});
 listen(page,'visibilitychange',()=>{if(frame)host.cancelAnimationFrame(frame);frame=0;last=0;painted=0;if(!page.hidden&&(dirty||state.autoOrbit))schedule();});
 return {update,snapshot,dispose(){for(const remove of listeners)remove();if(frame)host.cancelAnimationFrame(frame);pointers.clear();canvas.classList.remove('dragging');}};
}
