/* KT Companion — Medidas persistentes v2 */
(function(){'use strict';
const FRAME=()=>document.getElementById('game'), D=()=>FRAME()?.contentDocument, W=()=>FRAME()?.contentWindow;
const STORE='kt_tactical_field_v2';
function read(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){return{}}}
function write(x){localStorage.setItem(STORE,JSON.stringify(x))}
function currentTurn(){return W()?.__ktCurrentTurn||1}
function inchPerPx(board){return 30/(board.clientWidth||900)}
function dist(a,b,board){return Math.hypot(a.x-b.x,a.y-b.y)*inchPerPx(board)}
function fmt(n){return (Math.round(n*10)/10).toFixed(1).replace('.0','')+'"'}
function labelLayer(D,board){let l=board.querySelector('.kt-measure-labels');if(!l){l=D.createElement('div');l.className='kt-measure-labels';l.style.cssText='position:absolute;inset:0;z-index:7;pointer-events:none';board.appendChild(l)}return l}
function paintLabels(){const d=D();if(!d)return;const board=d.querySelector('.ktboard'),canvas=d.querySelector('.ktcanvas');if(!board||!canvas)return;const layer=labelLayer(d,board);layer.innerHTML='';const S=read();const t=currentTurn();['friend','enemy'].forEach(side=>{const X=S[side+'_'+t];if(!X)return;(X.drawings||[]).forEach(o=>{if(!o.a||!o.b)return;const n=dist(o.a,o.b,board);let text='',x=0,y=0;if(o.type==='area'){const r=n/30*board.clientWidth; text='R '+fmt(n)+' · Ø '+fmt(n*2);x=o.a.x;y=o.a.y-r-6}else if(o.type==='line'||o.type==='ruler'){text=fmt(n);x=(o.a.x+o.b.x)/2;y=(o.a.y+o.b.y)/2-9}else return;const z=d.createElement('span');z.textContent=text;z.style.cssText=`position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);padding:2px 5px;border-radius:5px;background:#0b0f14dd;border:1px solid #ffcc33;color:#fff;font:900 10px system-ui,sans-serif;white-space:nowrap;text-shadow:0 1px 2px #000`;layer.appendChild(z)})})}
function addPreset(inches){const d=D(),b=d?.querySelector('.ktboard');if(!d||!b)return;const S=read(),t=currentTurn(),k='friend_'+t;S[k] ||= {agents:[],positions:{},dead:[],drawings:[]};const cx=b.clientWidth/2,cy=b.clientHeight/2,r=inches* b.clientWidth/30;S[k].drawings.push({type:'area',a:{x:cx,y:cy},b:{x:cx+r,y:cy},color:'#ffcc33',width:3,preset:true,radiusInches:inches});write(S);paintLabels();
// Force the tactical module's canvas to redraw if available
try{W()?.ktTacReady?.()}catch(e){}
setTimeout(paintLabels,80)}
function enhance(){const d=D();if(!d)return;const bar=d.querySelector('#ktField .ktbar');if(!bar)return;if(bar.querySelector('.ktpreset')){paintLabels();return}const wrap=d.createElement('span');wrap.className='ktpreset';wrap.style.cssText='display:inline-flex;gap:5px;align-items:center;flex-wrap:wrap;margin-left:4px';const title=d.createElement('small');title.textContent='Áreas rápidas:';title.style.cssText='color:#9aa7b4;font-size:11px';wrap.appendChild(title);[.5,1,2].forEach(n=>{const b=d.createElement('button');b.textContent=n+'"';b.title='Colocar área de radio '+n+' pulgadas';b.onclick=()=>addPreset(n);wrap.appendChild(b)});bar.appendChild(wrap);paintLabels()}
function hook(){enhance();paintLabels();const d=D();if(!d)return;let n=0;const mo=new MutationObserver(()=>{clearTimeout(n);n=setTimeout(()=>{enhance();paintLabels()},30)});mo.observe(d.body,{childList:true,subtree:true});window.addEventListener('resize',paintLabels)}
const f=FRAME();f?.addEventListener('load',()=>setTimeout(hook,250));setInterval(()=>{const d=D();if(d?.querySelector('#ktField'))enhance()},500);})();