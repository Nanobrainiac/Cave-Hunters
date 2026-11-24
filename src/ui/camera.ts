export function attachCamera(svg: SVGSVGElement, zoomLabel: HTMLElement) {
 let x=150,y=150,zoom=1;
 let drag: {id:number; x:number;y:number; moved:boolean}|null=null;
 let suppressClick=false;
 const size=()=>{const r=svg.getBoundingClientRect();const w=Math.max(r.width,1),h=Math.max(r.height,1);const scale=420/Math.min(w,h)/zoom;return {w:w*scale,h:h*scale,scale};};
 function draw(){const s=size();svg.setAttribute('viewBox',`${x-s.w/2} ${y-s.h/2} ${s.w} ${s.h}`);zoomLabel.textContent=Math.round(zoom*100)+'%';}
 function change(factor:number,px?:number,py?:number){
  const old=size();const r=svg.getBoundingClientRect();
  const dx=px===undefined?0:px-r.left-r.width/2,dy=py===undefined?0:py-r.top-r.height/2;
  zoom=Math.max(.35,Math.min(3,zoom*factor));const next=size();x+=dx*(old.scale-next.scale);y+=dy*(old.scale-next.scale);draw();
 }
 svg.addEventListener('wheel',e=>{e.preventDefault();change(Math.exp(-e.deltaY*.0015),e.clientX,e.clientY);},{passive:false});
 svg.addEventListener('pointerdown',e=>{if(e.button!==0&&e.button!==1)return;suppressClick=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};});
 svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<4)return;drag.moved=true;svg.setPointerCapture(e.pointerId);const s=size();x-=dx*s.scale;y-=dy*s.scale;drag.x=e.clientX;drag.y=e.clientY;draw();});
 const end=(e:PointerEvent)=>{if(drag?.id!==e.pointerId)return;suppressClick=drag.moved;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);};
 svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('pointerleave',e=>{if(!svg.hasPointerCapture(e.pointerId))end(e);});
 new ResizeObserver(draw).observe(svg);draw();
 return {zoomIn:()=>change(1.25),zoomOut:()=>change(.8),reset:()=>{x=150;y=150;zoom=1;draw();},wasDrag:()=>{const v=suppressClick;suppressClick=false;return v;}};
}
