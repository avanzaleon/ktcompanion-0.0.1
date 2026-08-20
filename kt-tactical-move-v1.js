/* KT Companion — mover dibujos y mediciones */
(function(){
  const STORE='kt_tactical_field_v2';
  const frame=()=>document.getElementById('game');
  const d=()=>frame()?.contentDocument;
  const w=()=>frame()?.contentWindow;
  const turn=()=>w()?.__ktCurrentTurn||1;
  const load=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return {}}};
  const save=s=>localStorage.setItem(STORE,JSON.stringify(s));
  let drag=null;

  function activeSelect(D){return !!D?.querySelector('#ktField [data-k="select"].active')}
  function pointDist(px,py,ax,ay){return Math.hypot(px-ax,py-ay)}
  function segDist(px,py,ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay;
    if(dx===0&&dy===0)return pointDist(px,py,ax,ay);
    const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));
    return pointDist(px,py,ax+t*dx,ay+t*dy);
  }
  function hit(o,x,y){
    if(o.type==='pen'){
      const pts=o.pts||[];
      for(let i=1;i<pts.length;i++)if(segDist(x,y,pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y)<=12)return true;
      return pts.some(p=>pointDist(x,y,p.x,p.y)<=14);
    }
    if(o.type==='area'){
      const r=pointDist(o.a.x,o.a.y,o.b.x,o.b.y),dist=pointDist(x,y,o.a.x,o.a.y);
      return Math.abs(dist-r)<=14 || dist<r+10;
    }
    return segDist(x,y,o.a.x,o.a.y,o.b.x,o.b.y)<=14;
  }
  function move(o,dx,dy){
    if(o.type==='pen')(o.pts||[]).forEach(p=>{p.x+=dx;p.y+=dy});
    else{o.a.x+=dx;o.a.y+=dy;o.b.x+=dx;o.b.y+=dy}
  }
  function boardPoint(e){
    const c=d()?.querySelector('#ktField .ktcanvas');
    if(!c)return null;
    const r=c.getBoundingClientRect();
    return {x:e.clientX-r.left,y:e.clientY-r.top};
  }
  function begin(e){
    const D=d(); if(!D||!activeSelect(D))return;
    const p=boardPoint(e); if(!p)return;
    const s=load(),t=turn();
    // Prefer the most recently drawn shape, searching both sides.
    for(const side of ['enemy','friend']){
      const k=side+'_'+t, arr=s[k]?.drawings||[];
      for(let i=arr.length-1;i>=0;i--){
        if(hit(arr[i],p.x,p.y)){
          drag={side,k,index:i,last:p,pointer:e.pointerId};
          e.preventDefault();e.stopImmediatePropagation();
          return;
        }
      }
    }
  }
  function moveDrag(e){
    if(!drag)return;
    const p=boardPoint(e);if(!p)return;
    const s=load(),o=s[drag.k]?.drawings?.[drag.index];if(!o)return;
    move(o,p.x-drag.last.x,p.y-drag.last.y);drag.last=p;save(s);
    // Re-render after each movement; document-level capture keeps the drag alive.
    w()?.ktTacReady?.();
    e.preventDefault();e.stopImmediatePropagation();
  }
  function end(e){
    if(!drag)return;
    e.preventDefault();e.stopImmediatePropagation();
    drag=null;
    w()?.ktTacReady?.();
  }
  function install(){
    const D=d();if(!D)return;
    if(D.documentElement.dataset.ktMoveInstalled==='1')return;
    D.documentElement.dataset.ktMoveInstalled='1';
    D.addEventListener('pointerdown',begin,true);
    D.addEventListener('pointermove',moveDrag,true);
    D.addEventListener('pointerup',end,true);
    D.addEventListener('pointercancel',end,true);
  }
  function hook(){install()}
  window.addEventListener('load',()=>setTimeout(install,500));
  const f=frame();f?.addEventListener('load',()=>setTimeout(install,500));
  setInterval(install,800);
})();
