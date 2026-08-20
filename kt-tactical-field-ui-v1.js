/* KT Companion — Herramienta de dibujo táctico UI v1 */
(function(){
const frame=()=>document.getElementById('game'), d=()=>frame()?.contentDocument, w=()=>frame()?.contentWindow;
const STORE='kt_tactical_field_v2';
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function run(){
 const D=d(); if(!D||!D.getElementById('ktField')) return setTimeout(run,250);
 const h=D.getElementById('ktField'), oldImg=h.querySelector('#ktimg');
 const oldSrc=oldImg?.src||''; let S={}; try{S=JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){}
 const t=w()?.__ktCurrentTurn||1, key=(s)=>s+'_'+t;
 const get=s=>S[key(s)]||(S[key(s)]={agents:[],positions:{},dead:[],drawings:[],fixed:false});
 const F=get('friend'),E=get('enemy'); const save=()=>localStorage.setItem(STORE,JSON.stringify(S));
 const mapName=D.querySelector('.mapchoice.selected')?.textContent.trim()||'Mapa de pruebas';
 h.innerHTML=`
 <style>
 #ktField{background:#0d1218!important;border:1px solid #303a45!important;padding:0!important;overflow:hidden}
 .ktui{font-family:system-ui,sans-serif;color:#edf2f6}.ktui *{box-sizing:border-box}
 .kt-top{display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid #303a45;background:#0b1015}.kt-top b{font-size:18px}.kt-select{background:#151a20;color:#fff;border:1px solid #303a45;border-radius:8px;padding:7px}
 .kt-toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:7px;border-bottom:1px solid #303a45;background:#10161c}.kt-toolbar button{background:#151a20;color:#edf2f6;border:1px solid #303a45;border-radius:8px;padding:8px 9px;font-size:12px}.kt-toolbar button.on{background:#263b55;border-color:#6d9dcc}.kt-sep{width:1px;background:#303a45;margin:0 2px}
 .kt-body{display:grid;grid-template-columns:155px minmax(0,1fr) 170px;gap:8px;padding:8px}.kt-panel{background:#10161c;border:1px solid #303a45;border-radius:9px;padding:9px;font-size:12px}.kt-panel h4{margin:0 0 8px;font-size:12px}.kt-panel label{display:block;margin:7px 0}.kt-panel small{color:#9aa7b4}
 .kt-boardwrap{position:relative;min-width:0;background:#30302d;border:1px solid #46515d;border-radius:8px;overflow:hidden;touch-action:none}.kt-board{position:relative;width:100%}.kt-board img{display:block;width:100%;height:auto;user-select:none;pointer-events:none}.kt-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:3;touch-action:none}
 .kt-mark{position:absolute;z-index:5;width:32px;height:32px;border-radius:50%;transform:translate(-50%,-50%);display:grid;place-items:center;color:#fff;font-size:8px;font-weight:900;border:2px solid #fff;box-shadow:0 2px 8px #0009}.kt-mark.friend{background:#1976d2}.kt-mark.enemy{background:#d72d2d}
 .kt-bottom{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px;border-top:1px solid #303a45;background:#10161c;font-size:11px;color:#aeb8c2}.kt-bottom button{background:#151a20;color:#fff;border:1px solid #303a45;border-radius:7px;padding:7px}.kt-danger{background:#8f211b!important;border-color:#c45546!important}.kt-chip{display:inline-block;border:1px solid #46515d;border-radius:999px;padding:3px 7px;margin:2px;color:#cbd5df}
 @media(max-width:800px){.kt-body{grid-template-columns:1fr}.kt-panel{display:none}.kt-toolbar button{padding:8px 7px}}
 </style>
 <div class="ktui">
  <div class="kt-top"><b>🗺️ CAMPO TÁCTICO</b><select class="kt-select"><option>TURNO ${t}</option></select><span style="margin-left:auto;color:#9aa7b4">${esc(mapName)}</span></div>
  <div class="kt-toolbar">
   <button data-tool="select" class="on">↖ Seleccionar</button><button data-tool="move">✋ Mover</button><button data-tool="pen">🖊️ Dibujo libre</button><button data-tool="ruler">📐 Regla</button><button data-tool="line">📏 Tiralíneas</button><button data-tool="freearea">◯ Área libre</button>
   <span class="kt-sep"></span><button data-area="0.5">⭕ 0,5\"</button><button data-area="1">⭕ 1\"</button><button data-area="2">⭕ 2\"</button><span class="kt-sep"></span><button id="ktUndo">↩️ Deshacer</button><button id="ktRedo">↪️ Rehacer</button><button id="ktClear" class="kt-danger">🗑️ LIMPIAR TODO</button>
  </div>
  <div class="kt-body">
   <aside class="kt-panel"><h4>CAPAS</h4><label>☑️ Operativos amigo</label><label>☑️ Operativos rival</label><label>☑️ Mediciones</label><label>☑️ Áreas</label><label>☑️ Terreno</label><h4 style="margin-top:14px">LEYENDA</h4><div class="kt-chip">🔵 Amigo</div><div class="kt-chip">🔴 Rival</div><div class="kt-chip">❌ Baja</div><h4 style="margin-top:14px">MEDIDAS RÁPIDAS</h4><small>Tablero = 30\" × 22\"<br>Peana = 32 mm (≈1,26\")<br>1 cuadrado = 1\"</small></aside>
   <main class="kt-boardwrap"><div class="kt-board"><img id="ktuiimg" src="${esc(oldSrc)}"><canvas class="kt-canvas"></canvas></div></main>
   <aside class="kt-panel"><h4>MEDICIONES ACTIVAS</h4><div id="ktMeasures"><small>Las distancias se muestran en pulgadas (\").</small></div><h4 style="margin-top:16px">ÁREAS ACTIVAS</h4><div id="ktAreas"><small>Radio y diámetro visibles.</small></div><h4 style="margin-top:16px">CONSEJOS</h4><small>Usa Regla o Tiralíneas para medir. Las áreas predefinidas se colocan directamente.</small></aside>
  </div>
  <div class="kt-bottom"><button id="ktFit">⛶ VISTA AJUSTADA</button><span>ℹ️ Consejo: 1 cuadrado = 1 pulgada. Las medidas quedan permanentes.</span><button id="ktClear2" class="kt-danger">🗑️ LIMPIAR TODO</button></div>
 </div>`;
 const board=h.querySelector('.kt-board'),c=h.querySelector('.kt-canvas'),ctx=c.getContext('2d'),measures=h.querySelector('#ktMeasures'),areas=h.querySelector('#ktAreas');
 let tool='select',start=null,drawing=false,history=[],future=[];
 const mm=x=>Math.round(x/board.getBoundingClientRect().width*30*10)/10;
 const draw=()=>{const r=board.getBoundingClientRect();c.width=r.width;c.height=r.height;ctx.clearRect(0,0,c.width,c.height);const all=[...(F.drawings||[]),...(E.drawings||[])];measures.innerHTML='';areas.innerHTML='';
  all.forEach(o=>{ctx.save();ctx.lineWidth=o.width||3;ctx.strokeStyle=o.color||'#ffcc33';ctx.setLineDash([]);if(o.type==='area'){ctx.beginPath();ctx.arc(o.a.x,o.a.y,Math.hypot(o.a.x-o.b.x,o.a.y-o.b.y),0,Math.PI*2);ctx.stroke();const r=mm(Math.hypot(o.a.x-o.b.x,o.a.y-o.b.y));const tag=document.createElement('span');tag.className='kt-chip';tag.textContent=`R ${r}\" · Ø ${r*2}\"`;areas.appendChild(tag)}else if(o.type==='pen'){ctx.beginPath();(o.pts||[]).forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()}else{ctx.beginPath();ctx.moveTo(o.a.x,o.a.y);ctx.lineTo(o.b.x,o.b.y);ctx.stroke();const q=mm(Math.hypot(o.a.x-o.b.x,o.a.y-o.b.y));ctx.font='bold 13px system-ui';ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=4;ctx.strokeText(q+'\"',(o.a.x+o.b.x)/2+5,(o.a.y+o.b.y)/2-5);ctx.fillStyle='#fff';ctx.fillText(q+'\"',(o.a.x+o.b.x)/2+5,(o.a.y+o.b.y)/2-5);const tag=document.createElement('span');tag.className='kt-chip';tag.textContent=q+'\"';measures.appendChild(tag)}ctx.restore()});
  h.querySelectorAll('.kt-mark').forEach(x=>x.remove());[['friend',F],['enemy',E]].forEach(([side,X])=>(X.agents||[]).forEach(a=>{if((X.dead||[]).includes(a.id))return;const p=X.positions[a.id];if(!p)return;const m=D.createElement('div');m.className='kt-mark '+side;m.textContent=a.short;m.style.left=p.x+'%';m.style.top=p.y+'%';board.appendChild(m)}));
 };
 const snap=()=>{history.push(JSON.stringify(S));if(history.length>30)history.shift();future=[]}; const add=o=>{snap();F.drawings.push(o);save();draw()};
 h.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;h.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('on',x===b))});
 h.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{const r=board.getBoundingClientRect(),x=r.width/2,y=r.height/2,px=+b.dataset.area/30*r.width;add({type:'area',a:{x,y},b:{x:x+px,y},color:'#33aaff',width:3,predefined:true})});
 const pointer=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
 c.onpointerdown=e=>{if(tool==='select'||tool==='move')return;drawing=true;start=pointer(e);if(tool==='pen'){snap();F.drawings.push({type:'pen',pts:[start],color:'#ffcc33',width:3)};c.setPointerCapture(e.pointerId)};
 c.onpointermove=e=>{if(!drawing)return;const p=pointer(e);if(tool==='pen'){F.drawings.at(-1).pts.push(p);draw()}else{draw();ctx.save();ctx.strokeStyle='#ffcc33';ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();ctx.font='bold 13px system-ui';ctx.fillStyle='#fff';ctx.fillText(mm(Math.hypot(p.x-start.x,p.y-start.y))+'\"',p.x+6,p.y-6)}};
 c.onpointerup=e=>{if(!drawing)return;drawing=false;const p=pointer(e);if(['line','ruler','freearea'].includes(tool)){if(tool==='freearea')add({type:'area',a:start,b:p,color:'#33aaff',width:3});else add({type:tool,a:start,b:p,color:'#ffcc33',width:3})}else if(tool==='pen'){save();draw()}};
 const undo=()=>{if(!history.length)return;future.push(JSON.stringify(S));S=JSON.parse(history.pop());save();draw()},redo=()=>{if(!future.length)return;history.push(JSON.stringify(S));S=JSON.parse(future.pop());save();draw()};
 h.querySelector('#ktUndo').onclick=undo;h.querySelector('#ktRedo').onclick=redo;h.querySelector('#ktClear').onclick=h.querySelector('#ktClear2').onclick=()=>{snap();F.drawings=[];E.drawings=[];save();draw()};h.querySelector('#ktFit').onclick=()=>board.scrollIntoView({block:'center',behavior:'smooth'});draw();
}
run();setInterval(()=>{const f=frame();if(f?.contentDocument?.getElementById('ktField')&&!f.contentDocument.getElementById('ktField').querySelector('.ktui'))run()},1000);
})();