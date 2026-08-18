/* KT Companion — Campo táctico por turno + herramientas de mapa */
(function(){
  const frame=()=>document.getElementById('game');
  const doc=()=>frame()?.contentDocument||null;
  const win=()=>frame()?.contentWindow||null;
  const STORE='kt_tactical_field_v1';
  const fallbackMap=(name)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#3d3d39"/><path d="M0 140H1000M0 280H1000M0 420H1000M0 560H1000M125 0V700M250 0V700M375 0V700M500 0V700M625 0V700M750 0V700M875 0V700" stroke="#69675f" stroke-width="3"/><circle cx="500" cy="350" r="45" fill="#111" stroke="#aaa" stroke-width="3"/><text x="500" y="358" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif">R</text><text x="500" y="55" text-anchor="middle" fill="#ddd" font-size="22" font-family="sans-serif">${name||'MAPA DE PRUEBA'}</text></svg>`);
  const load=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return{}}};
  const save=s=>localStorage.setItem(STORE,JSON.stringify(s));
  let state=load();
  const currentSide=()=>doc()?.querySelector('#turnSideTabs .side.active')?.textContent.includes('RIVAL')?'enemy':'friend';
  const currentTurn=()=>win()?.__ktCurrentTurn||1;
  const mapName=()=>doc()?.querySelector('.mapchoice.selected')?.textContent.trim()||'Mapa';
  const key=(side,t)=>side+'_'+t;
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function abbreviate(name){
    const special={'Space Marine Captain':'CAP Ma','Assault Intercessor Sergeant':'AIS','Intercessor Sergeant':'IS','Assault Intercessor Grenadier':'AIG','Assault Intercessor Warrior':'AIW','Eliminator Sniper':'ELI','Heavy Intercessor Gunner':'HIG','Intercessor Gunner':'IG','Dire Avenger Exarch':'DAE','Dire Avenger Warrior':'DAW','Howling Banshee Exarch':'HBE','Howling Banshee Warrior':'HBW','Striking Scorpion Exarch':'SSE','Striking Scorpion Warrior':'SSW','Canoptek Circle Geomancer':'GEO','Canoptek Macrocyte Tomb Crawler':'TC','Canoptek Macrocyte Accelerator':'ACC'};
    if(special[name]) return special[name];
    const words=String(name).replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g,' ').trim().split(/\s+/).filter(Boolean);
    return (words.slice(0,3).map(w=>w[0]).join('')||'OP').toUpperCase();
  }
  function selectedAgents(side){
    const d=doc(); if(!d)return [];
    const oldSide=currentSide(); if(oldSide!==side) win()?.switchTurnSide?.(side);
    const out=[];
    d.querySelectorAll('#ops .op.has').forEach(op=>{
      const name=(op.querySelector('.opname')?.childNodes[0]?.textContent||'').trim();
      const qty=Number(op.querySelector('.qty b')?.textContent||0);
      if(!name||!qty)return;
      for(let i=1;i<=qty;i++)out.push({id:name+'__'+i,name,short:abbreviate(name)+(qty>1?' '+i:'')});
    });
    if(oldSide!==side) win()?.switchTurnSide?.(oldSide);
    return out;
  }
  function ensureTurn(side,t){
    const k=key(side,t); state[k] ||= {positions:{},dead:[],drawings:[],scale:null};
    const prev=state[key(side,t-1)];
    selectedAgents(side).forEach((a,i)=>{
      if(!state[k].positions[a.id]) state[k].positions[a.id]=prev?.positions?.[a.id]||{x:side==='friend'?12+i*6:88-i*6,y:18+i*7};
    });
    state[k].agents=selectedAgents(side);
    save(state); return state[k];
  }
  function css(){return `
    #ktField{margin-top:14px;background:#10161c;border:1px solid #303a45;border-radius:14px;padding:12px}
    #ktField h3{margin:0 0 5px}.ktmut{color:#9aa7b4;font-size:12px}
    .ktfbar{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.ktfbar button{padding:8px 10px}.ktfbar button.active{background:#263b55;border-color:#6d9dcc}
    .ktfbar input[type=color]{width:42px;height:34px;padding:2px}.ktfbar input[type=range]{width:90px}
    .ktboard{position:relative;width:100%;max-width:900px;margin:auto;overflow:hidden;border:1px solid #46515d;border-radius:10px;background:#30302d;touch-action:none;user-select:none}
    .ktboard img{display:block;width:100%;height:auto;pointer-events:none}.ktdraw{position:absolute;inset:0;width:100%;height:100%;z-index:2;touch-action:none}
    .ktmarker{position:absolute;z-index:5;width:31px;height:31px;border-radius:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;color:#fff;font-size:8px;font-weight:900;border:2px solid #fff;box-shadow:0 2px 8px #0009;touch-action:none;user-select:none;cursor:grab}
    .ktmarker.friend{background:#1976d2}.ktmarker.enemy{background:#d72d2d}.ktmarker.fixed{cursor:default}.ktmarker.deadmark{opacity:.45}
    .ktbench{margin-top:9px;border:1px solid #4b3033;border-radius:10px;padding:8px;background:linear-gradient(#211619,#110f12)}
    .ktdead{display:inline-flex;align-items:center;gap:4px;margin:4px}.ktdead .ktmarker{position:relative;transform:none;width:29px;height:29px;display:inline-flex}.ktdead button{padding:5px 7px;font-size:11px}
    .ktread{font-size:12px;color:#bfc9d3;margin-top:8px;min-height:18px}.ktcal{font-size:12px;color:#f1c66c;margin:5px 0}
  `}
  function injectStyle(d){if(d.getElementById('ktFieldStyle'))return;const s=d.createElement('style');s.id='ktFieldStyle';s.textContent=css();d.head.appendChild(s)}
  function render(){
    const d=doc(),w=win(); if(!d||!w||!d.getElementById('turntabs')||!d.getElementById('ops'))return;
    injectStyle(d);
    let host=d.getElementById('ktField');
    if(!host){host=d.createElement('div');host.id='ktField';d.getElementById('turntabs').parentElement.appendChild(host)}
    const side=currentSide(),t=currentTurn(),data=ensureTurn(side,t),agents=data.agents||[];
    host.innerHTML=`<h3>🗺️ Campo táctico · T${t}</h3><div class="ktmut">${esc(mapName())} · ${side==='friend'?'🟢 AMIGO':'🔴 RIVAL'} · Los agentes se cargan automáticamente desde la selección de operativos.</div>
      <div class="ktfbar"><button data-tool="select" class="active">🖱️ Mover</button><button data-tool="pen">🖊️ Rotulador</button><button data-tool="line">📏 Tiralíneas</button><button data-tool="ruler">📐 Regla</button><button data-tool="area">⭕ Área</button><label>🎨 <input id="ktColor" type="color" value="#ffcc33"></label><label>↕ <input id="ktWidth" type="range" min="1" max="12" value="4"></label><button id="ktUndo">↩️</button><button id="ktClear">🗑️</button><button id="ktFix">🔒 Fijar</button><button id="ktEdit">✏️ Editar</button><button id="ktReset">↺ Reiniciar</button></div>
      <div class="ktcal">🎯 Escala: ${data.scale?data.scale.toFixed(2)+' px/pulgada':'sin calibrar'} · Para calibrar: pulsa dos puntos separados por el radio conocido de 2" de la R.</div>
      <div class="ktboard"><img id="ktMapImg" alt="Mapa táctico"><canvas class="ktdraw"></canvas></div>
      <div class="ktread">Selecciona una herramienta para medir o dibujar.</div>
      <div class="ktbench"><b>🔥 Banquillo de bajas</b><div class="ktdeadlist"></div></div>`;
    const img=host.querySelector('#ktMapImg');
    const mapImages=w.__ktMapImages||{}; img.src=mapImages[mapName()]||localStorage.getItem('kt_map_'+mapName())||fallbackMap(mapName());
    img.onload=()=>setupCanvas(host,data);
    setupCanvas(host,data);
    renderMarkers(host,data,side,t);
    renderBench(host,data,side,t);
    host.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{host.dataset.tool=b.dataset.tool;host.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('active',x===b));});
    host.querySelector('#ktFix').onclick=()=>{data.fixed=true;save(state);renderMarkers(host,data,side,t);};
    host.querySelector('#ktEdit').onclick=()=>{data.fixed=false;save(state);renderMarkers(host,data,side,t);};
    host.querySelector('#ktReset').onclick=()=>{if(!confirm('¿Reiniciar posiciones y dibujos de este turno?'))return;data.positions={};data.drawings=[];data.dead=[];data.fixed=false;ensureTurn(side,t);save(state);render();};
    host.querySelector('#ktUndo').onclick=()=>{data.drawings.pop();save(state);setupCanvas(host,data);};
    host.querySelector('#ktClear').onclick=()=>{if(confirm('¿Borrar todos los dibujos de este turno?')){data.drawings=[];save(state);setupCanvas(host,data)}};
  }
  function setupCanvas(host,data){
    const board=host.querySelector('.ktboard'),c=host.querySelector('.ktdraw');if(!board||!c)return;
    const w=board.clientWidth,h=board.clientHeight;if(!w||!h)return;c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.clearRect(0,0,w,h);
    (data.drawings||[]).forEach(o=>drawObj(ctx,o));
    let drawing=false,start=null,last=null;const tool=()=>host.dataset.tool||'select';
    c.onpointerdown=e=>{if(tool()==='select'||data.fixed)return;drawing=true;start=last=pt(e,c);if(tool()==='pen'){data.drawings.push({type:'pen',pts:[start],color:host.querySelector('#ktColor').value,width:+host.querySelector('#ktWidth').value});}}
    c.onpointermove=e=>{if(!drawing)return;const p=pt(e,c);if(tool()==='pen'){data.drawings[data.drawings.length-1].pts.push(p);setupCanvas(host,data);return;}setupCanvas(host,data);const x=host.querySelector('.ktdraw').getContext('2d');x.save();x.setLineDash([6,5]);x.strokeStyle=host.querySelector('#ktColor').value;x.lineWidth=+host.querySelector('#ktWidth').value;x.beginPath();x.moveTo(start.x,start.y);if(tool()==='area'){x.arc(start.x,start.y,dist(start,p),0,Math.PI*2)}else{x.lineTo(p.x,p.y)}x.stroke();x.restore();last=p;}
    c.onpointerup=e=>{if(!drawing)return;drawing=false;const p=pt(e,c),q=tool();if(q==='line'||q==='ruler'||q==='area')data.drawings.push({type:q,a:start,b:p,color:host.querySelector('#ktColor').value,width:+host.querySelector('#ktWidth').value});save(state);setupCanvas(host,data);};
  }
  const pt=(e,c)=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function drawObj(ctx,o){ctx.save();ctx.lineWidth=o.width||3;ctx.strokeStyle=o.color||'#ffcc33';ctx.fillStyle=(o.color||'#ffcc33')+'22';if(o.type==='pen'){ctx.beginPath();o.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()}else if(o.type==='line'||o.type==='ruler'){ctx.beginPath();ctx.moveTo(o.a.x,o.a.y);ctx.lineTo(o.b.x,o.b.y);ctx.stroke();if(o.type==='ruler'&&stateScale())label(ctx,o.b,(dist(o.a,o.b)/stateScale()).toFixed(2)+'"')}else if(o.type==='area'){const r=dist(o.a,o.b);ctx.beginPath();ctx.arc(o.a.x,o.a.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();if(stateScale())label(ctx,{x:o.a.x,y:o.a.y-r},'R '+(r/stateScale()).toFixed(2)+'" · Ø '+(2*r/stateScale()).toFixed(2)+'"')}ctx.restore()}
  let activeData=null;function stateScale(){return activeData?.scale||null}function label(ctx,p,text){ctx.font='bold 12px system-ui';ctx.fillStyle='#090d12dd';ctx.fillRect(p.x+7,p.y-21,ctx.measureText(text).width+12,21);ctx.fillStyle='#fff';ctx.fillText(text,p.x+13,p.y-7)}
  function renderMarkers(host,data,side,t){
    host.querySelectorAll('.ktmarker.map').forEach(x=>x.remove());
    activeData=data;const board=host.querySelector('.ktboard');if(!board)return;
    (data.agents||[]).forEach(a=>{if((data.dead||[]).includes(a.id))return;const p=data.positions[a.id];const m=doc().createElement('div');m.className='ktmarker map '+side;m.textContent=a.short;m.title=a.name;m.style.left=p.x+'%';m.style.top=p.y+'%';m.onpointerdown=e=>{if(data.fixed)return;let move=true;m.setPointerCapture(e.pointerId);const moveFn=ev=>{if(!move)return;const r=board.getBoundingClientRect();p.x=Math.max(2,Math.min(98,(ev.clientX-r.left)/r.width*100));p.y=Math.max(2,Math.min(98,(ev.clientY-r.top)/r.height*100));m.style.left=p.x+'%';m.style.top=p.y+'%'};m.onpointermove=moveFn;m.onpointerup=ev=>{move=false;m.onpointermove=null;if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom){if(!data.dead.includes(a.id))data.dead.push(a.id);renderBench(host,data,side,t);m.remove()}save(state)};e.preventDefault()};board.appendChild(m)});
  }
  function renderBench(host,data,side,t){const box=host.querySelector('.ktdeadlist');if(!box)return;box.innerHTML='';(data.dead||[]).forEach(id=>{const a=(data.agents||[]).find(x=>x.id===id);if(!a)return;const wrap=doc().createElement('span');wrap.className='ktdead';wrap.innerHTML=`<span class="ktmarker ${side}">${esc(a.short)}</span><button>↩️</button>`;wrap.querySelector('button').onclick=()=>{data.dead=data.dead.filter(x=>x!==id);save(state);render()};box.appendChild(wrap)});if(!(data.dead||[]).length)box.innerHTML='<span class="ktmut">Ninguna baja.</span>'}
  function hook(){const w=win(),d=doc();if(!w||!d)return;if(w.__ktFieldInstalled)return;w.__ktFieldInstalled=true;const old=w.switchTurn;w.switchTurn=function(t){w.__ktCurrentTurn=t;const r=old.apply(this,arguments);setTimeout(render,0);return r};const oldSide=w.switchTurnSide;w.switchTurnSide=function(s){const r=oldSide.apply(this,arguments);setTimeout(render,0);return r};w.__ktCurrentTurn=w.__ktCurrentTurn||1;render();}
  const f=frame();if(f)f.addEventListener('load',()=>setTimeout(hook,100));setTimeout(hook,700);setTimeout(hook,1500);
  window.__ktFieldState=()=>state;
})();