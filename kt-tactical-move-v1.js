/* KT Companion — mover dibujos/mediciones + asegurar fondo de mapa + estabilidad UI */
(function(){
  const STORE='kt_tactical_field_v2';
  const frame=()=>document.getElementById('game');
  const d=()=>frame()?.contentDocument;
  const w=()=>frame()?.contentWindow;
  const turn=()=>w()?.__ktCurrentTurn||1;
  const load=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return {}}};
  const save=s=>localStorage.setItem(STORE,JSON.stringify(s));
  let drag=null;
  function restoreMap(){const D=d(),W=w();if(!D||!W)return;const field=D.getElementById('ktField');if(!field)return;const img=field.querySelector('#ktuiimg');if(!img)return;const name=D.querySelector('.mapchoice.selected')?.textContent.trim()||'Mapa de pruebas';const src=W.__ktMapImages?.[name]||localStorage.getItem('kt_map_'+name)||W.__ktMapImages?.['Mapa de pruebas'];if(src&&img.getAttribute('src')!==src)img.setAttribute('src',src)}
  function activeSelect(D){return !!D?.querySelector('#ktField [data-tool="select"].on')}
  function pointDist(px,py,ax,ay){return Math.hypot(px-ax,py-ay)}
  function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay;if(dx===0&&dy===0)return pointDist(px,py,ax,ay);const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));return pointDist(px,py,ax+t*dx,ay+t*dy)}
  function hit(o,x,y){if(o.type==='pen'){const pts=o.pts||[];for(let i=1;i<pts.length;i++)if(segDist(x,y,pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y)<=14)return true;return pts.some(p=>pointDist(x,y,p.x,p.y)<=16)}if(o.type==='area'){const r=pointDist(o.a.x,o.a.y,o.b.x,o.b.y),dist=pointDist(x,y,o.a.x,o.a.y);return Math.abs(dist-r)<=16||dist<r+10}return segDist(x,y,o.a.x,o.a.y,o.b.x,o.b.y)<=16}
  function move(o,dx,dy){if(o.type==='pen')(o.pts||[]).forEach(p=>{p.x+=dx;p.y+=dy});else{o.a.x+=dx;o.a.y+=dy;o.b.x+=dx;o.b.y+=dy}}
  function boardPoint(e){const c=d()?.querySelector('#ktField .kt-canvas');if(!c)return null;const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
  function begin(e){const D=d();if(!D||!activeSelect(D)||e.target?.closest?.('.kt-mark'))return;const p=boardPoint(e);if(!p)return;const s=load(),t=turn();for(const side of ['enemy','friend']){const k=side+'_'+t,arr=s[k]?.drawings||[];for(let i=arr.length-1;i>=0;i--)if(hit(arr[i],p.x,p.y)){drag={k,index:i,last:p,pointer:e.pointerId};e.preventDefault();e.stopImmediatePropagation();return}}}
  function moveDrag(e){if(!drag)return;const p=boardPoint(e);if(!p)return;const s=load(),o=s[drag.k]?.drawings?.[drag.index];if(!o)return;move(o,p.x-drag.last.x,p.y-drag.last.y);drag.last=p;save(s);w()?.ktTacReady?.();e.preventDefault();e.stopImmediatePropagation()}
  function end(e){if(!drag)return;e.preventDefault();e.stopImmediatePropagation();drag=null;w()?.ktTacReady?.()}
  function install(){const D=d();if(!D)return;if(D.documentElement.dataset.ktMoveInstalled!=='1'){D.documentElement.dataset.ktMoveInstalled='1';D.addEventListener('pointerdown',begin,true);D.addEventListener('pointermove',moveDrag,true);D.addEventListener('pointerup',end,true);D.addEventListener('pointercancel',end,true)}restoreMap()}
  window.addEventListener('load',()=>setTimeout(install,500));frame()?.addEventListener('load',()=>setTimeout(install,700));setInterval(install,800);
  function installStableNavigation(){const f=frame(),mb=document.getElementById('btnMatrix'),sb=document.getElementById('btnSaved');if(!f||!mb||!sb||mb.dataset.ktNavFix==='1')return;mb.dataset.ktNavFix='1';sb.dataset.ktNavFix='1';mb.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.getElementById('ktCalcApp')?.remove();document.getElementById('saved').style.display='none';f.style.display='block';f.src='./ktcompanion-v17-ejercitos2.html?fresh='+Date.now()},true);sb.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();document.getElementById('ktCalcApp')?.remove();f.style.display='none';document.getElementById('saved').style.display='block';window.showSaved?.()},true);const list=document.getElementById('savedList');list?.addEventListener('click',e=>{const b=e.target.closest?.('.saved-delete');if(!b)return;const m=(b.getAttribute('onclick')||'').match(/ktDeleteSaved\((\d+)\)/);if(m){e.preventDefault();e.stopImmediatePropagation();window.ktDeleteSaved?.(Number(m[1]))}},true)}
  setTimeout(installStableNavigation,100);setTimeout(installStableNavigation,1000);setInterval(installStableNavigation,2000);
})();