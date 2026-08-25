/* KT Companion · Lucha v11 · repeticiones optimizadas */
(function(){'use strict';
const bin=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r};
function faceCat(f,h,l){if(f===6||f>=l)return'C';if(f>=h)return'N';return'F'}
function baseDist(o){const h=Math.max(2,Math.min(6,o.hit||4)),l=o.lethal?Math.max(2,Math.min(6,o.lethalThreshold||5)):99;let pc=0,pn=0,pf=0;for(let f=1;f<=6;f++){const x=faceCat(f,h,l);if(x==='C')pc+=1/6;else if(x==='N')pn+=1/6;else pf+=1/6}return{C:pc,N:pn,F:pf}}
function rawRolls(o){const n=Math.max(0,o.attacks|0),ac=Math.min(n,Math.max(0,o.accurate|0)),r=n-ac,d=baseDist(o),out=[];for(let c=0;c<=r;c++)for(let m=0;m<=r-c;m++){const f=r-c-m,q=bin(r,c)*bin(r-c,m)*d.C**c*d.N**m*d.F**f;if(q)out.push({c,m:m+ac,f,q})}return out}
function expand(r){return Array(r.c).fill('C').concat(Array(r.m).fill('N'),Array(r.f).fill('F'))}
function counts(a){return{c:a.filter(x=>x==='C').length,m:a.filter(x=>x==='N').length,f:a.filter(x=>x==='F').length}}
function prep(r,o){let c=r.c,m=r.m,f=r.f;if(o.severe&&c===0&&m>0){c++;m--}if(c>0&&o.rending&&m>0){c++;m--}if(c>0&&o.punishing&&f>0){m++;f--}return{c,m,f}}
function clone(s){return{...s,a:s.a.slice(),b:s.b.slice()}}
function canBlock(d,t,br){if(br&&d!=='C')return false;return d==='C'?t==='C'||t==='N':t==='N'}
function strike(s,w,d){const o=clone(s),m=w==='A'?o.a:o.b,e=w==='A'?o.b:o.a,i=m.indexOf(d);if(i<0)return o;m.splice(i,1);const dmg=w==='A'?(d==='C'?o.aCD:o.aND):(d==='C'?o.bCD:o.bND);if(w==='A')o.wb-=dmg;else o.wa-=dmg;if(d==='C'){const sh=w==='A'?o.aShock:o.bShock,used=w==='A'?o.shockA:o.shockB;if(sh&&!used){if(w==='A')o.shockA=true;else o.shockB=true;const j=e.indexOf('N');if(j>=0)e.splice(j,1);else if(e.length)e.splice(0,1)}const dev=w==='A'?o.aDev:o.bDev;if(dev){if(w==='A')o.wb-=dev;else o.wa-=dev}}return o}
function block(s,w,d,t){const o=clone(s),m=w==='A'?o.a:o.b,e=w==='A'?o.b:o.a,i=m.indexOf(d),j=e.indexOf(t);if(i<0||j<0)return o;m.splice(i,1);e.splice(j,1);return o}
function solve(base){const memo=new Map();function rec(s){if(s.wa<=0)return{a:0,b:1,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};if(s.wb<=0)return{a:1,b:0,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};const k=JSON.stringify({a:s.a,b:s.b,wa:s.wa,wb:s.wb,t:s.turn,sa:s.shockA,sb:s.shockB});if(memo.has(k))return memo.get(k);const mine=s.turn==='A'?s.a:s.b,other=s.turn==='A'?s.b:s.a;if(!mine.length){const next=s.turn==='A'?'B':'A';if(!other.length){const r={a:s.wb>s.wa?1:0,b:s.wa>s.wb?1:0,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};memo.set(k,r);return r}const who=s.turn==='A'?'ATACANTE':'DEFENSOR',r=rec({...s,turn:next});const out={...r,line:[`${who} → SIN ÉXITOS DISPONIBLES (pasa el turno)`,...r.line]};memo.set(k,out);return out}
const brutal=s.turn==='A'?s.aBrutal:s.bBrutal,choices=[];for(const d of mine){choices.push({s:strike(s,s.turn,d),act:`${s.turn==='A'?'ATACANTE':'DEFENSOR'} → GOLPEA ${d==='C'?'CRÍTICO':'NORMAL'}`});for(const e of other)if(canBlock(d,e,brutal))choices.push({s:block(s,s.turn,d,e),act:`${s.turn==='A'?'ATACANTE':'DEFENSOR'} → BLOQUEA ${e==='C'?'CRÍTICO':'NORMAL'} con ${d==='C'?'CRÍTICO':'NORMAL'}`})}let best=null;for(const ch of choices){const nt=s.turn==='A'?'B':'A',r=rec({...ch.s,turn:nt}),score=s.turn==='A'?r.a-r.b:r.b-r.a;if(!best||score>best.score)best={score,r:{...r,line:[ch.act,...r.line]}}}memo.set(k,best.r);return best.r}return rec({...base,a:base.a.slice(),b:base.b.slice(),aStart:base.wa,bStart:base.wb})}
function choosePlan(arr,o,opp){const n=arr.length;if(!(o.balanced||o.relentless||o.ceaseless))return[];const h=Math.max(2,Math.min(6,o.hit||4)),l=o.lethal?Math.max(2,Math.min(6,o.lethalThreshold||5)):99;const catResult=faceCat(Math.max(1,Math.min(6,+o.ceaselessResult||1)),h,l);let eligible=[];if(o.relentless)eligible=Array.from({length:n},(_,i)=>i);else if(o.balanced)eligible=Array.from({length:n},(_,i)=>i);if(o.ceaseless){const ce=arr.map((x,i)=>x===catResult?i:-1).filter(i=>i>=0);eligible=[...new Set(eligible.concat(ce))]}
if(o.ceaseless&&!o.relentless&&!o.balanced)return arr.map((x,i)=>x===catResult?i:-1).filter(i=>i>=0);
const fails=eligible.filter(i=>arr[i]==='F'),normals=eligible.filter(i=>arr[i]==='N');const critValue=(o.critDamage||0)+(o.rending?1.5:0)+(o.punishing?1:0)+(o.shock?1:0)+(o.devastating||0),normalValue=o.normalDamage||0;if(o.relentless){if(fails.length)return fails;if(normals.length&&critValue>normalValue*1.25)return normals;return[]}if(o.balanced){if(fails.length)return[fails[0]];if(normals.length&&critValue>normalValue*1.5)return[normals[0]];return[]}return[]}
function rerollOutcomes(arr,o,opp){const plan=choosePlan(arr,o,opp),d=baseDist(o);if(!plan.length)return[{a:arr.slice(),q:1,plan:[]}];let states=[{a:arr.slice(),q:1,plan}];for(const i of plan){const ns=[];for(const st of states)for(const c of ['C','N','F']){const p=d[c];if(!p)continue;const a=st.a.slice();a[i]=c;ns.push({a,q:st.q*p,plan})}states=ns}return states}
function calculate(a,b){const A=rawRolls(a),B=rawRolls(b),sum={a:0,b:0,da:0,db:0,examples:[],strategyA:new Set(),strategyB:new Set()},cand=[];for(const x0 of A)for(const y0 of B){const p=x0.q*y0.q,xa=expand(x0),yb=expand(y0),av=rerollOutcomes(xa,a,b),bv=rerollOutcomes(yb,b,a);for(const x of av)for(const y of bv){const q=p*x.q*y.q,xx=prep(counts(x.a),a),yy=prep(counts(y.a),b),r=solve({a:expand(xx),b:expand(yy),wa:a.wounds,wb:b.wounds,aND:a.normalDamage,aCD:a.critDamage,bND:b.normalDamage,bCD:b.critDamage,aBrutal:!!a.brutal,bBrutal:!!b.brutal,aShock:!!a.shock,bShock:!!b.shock,aDev:+a.devastating||0,bDev:+b.devastating||0,turn:'A'});sum.a+=q*r.a;sum.b+=q*r.b;sum.da+=q*r.da;sum.db+=q*r.db;if(x.plan.length)sum.strategyA.add(x.plan.map(i=>xa[i]).join(','));if(y.plan.length)sum.strategyB.add(y.plan.map(i=>yb[i]).join(','));cand.push({p:q,line:r.line.slice(0,24),winner:r.a>r.b?'A':r.b>r.a?'B':'EMPATE'})}}
cand.sort((x,y)=>y.p-x.p);const real=cand.filter(e=>e.line.some(x=>/^ATACANTE → (GOLPEA|BLOQUEA)/.test(x))),pool=real.length?real:cand,seen=new Set();for(const e of pool){const sig=e.line.join('|');if(seen.has(sig))continue;seen.add(sig);sum.examples.push(e);if(sum.examples.length>=8)break}sum.strategyA=[...sum.strategyA].slice(0,4);sum.strategyB=[...sum.strategyB].slice(0,4);return sum}
window.KTLuchaEngineV11={calculate,rawRolls,preprocess:prep};window.KTLuchaEngineV10=window.KTLuchaEngineV11;window.KTLuchaEngineV9=window.KTLuchaEngineV11;window.KTLuchaEngineV8=window.KTLuchaEngineV11;window.KTLuchaEngineV7=window.KTLuchaEngineV11;
})();

/* Board responsive scale patch: 30 x 22 inches, 40 px/inch logical reference. */
window.addEventListener('DOMContentLoaded',function(){
  const BW=1200,BH=880,PPIN=40,MM=25.4;
  const originalCanvasBind=canvasBind;
  canvasBind=function(){
    originalCanvasBind();
    if(!canvas)return;
    const c=canvas;
    const bindPoint=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*BW/r.width,y:(e.clientY-r.top)*BH/r.height}};
    c.onpointerdown=e=>{const p=bindPoint(e);drag={s:p,o:tool==='select'?hit(p):null,last:p};c.setPointerCapture?.(e.pointerId)};
    c.onpointermove=e=>{if(!drag)return;const p=bindPoint(e);if(tool==='select'&&drag.o){drag.o.x=p.x;drag.o.y=p.y}else if(tool==='pen'){objs.push({t:'line',x1:drag.last.x,y1:drag.last.y,x2:p.x,y2:p.y,color,opa});drag.last=p}else if(['line','arrow','rect','circle','temp','ruler'].includes(tool))drag.e=p;draw()};
    c.onpointerup=e=>{if(!drag)return;const p=bindPoint(e);if(['line','arrow','rect','circle','temp','ruler'].includes(tool))objs.push({t:tool,x1:drag.s.x,y1:drag.s.y,x2:p.x,y2:p.y,color,opa});if(tool==='text'){let t=prompt('Texto');if(t)objs.push({t:'text',x:p.x,y:p.y,text:t,color,opa})}history.push(cp(objs));future=[];drag=null;draw();c.releasePointerCapture?.(e.pointerId)};
  };
  const oldDraw=draw;
  draw=function(){
    if(!ctx||!canvas)return;
    const d=devicePixelRatio||1,r=canvas.getBoundingClientRect(),sx=r.width/BW,sy=r.height/BH;
    ctx.setTransform(d*sx,0,0,d*sy,0,0);ctx.clearRect(0,0,BW,BH);drawMapBackground(ctx,BW,BH);
    objs.forEach(o=>{ctx.globalAlpha=o.opa??1;ctx.strokeStyle=o.color||color;ctx.fillStyle=o.color||color;ctx.lineWidth=window.lineWidth||3;
      if(['line','pen'].includes(o.t)){ctx.beginPath();ctx.moveTo(o.x1,o.y1);ctx.lineTo(o.x2,o.y2);ctx.stroke()}
      else if(o.t==='rect')ctx.strokeRect(o.x1,o.y1,o.x2-o.x1,o.y2-o.y1);
      else if(o.t==='circle'){ctx.beginPath();ctx.arc(o.x1,o.y1,Math.hypot(o.x2-o.x1,o.y2-o.y1),0,Math.PI*2);ctx.stroke()}
      else if(o.t==='arrow'){ctx.beginPath();ctx.moveTo(o.x1,o.y1);ctx.lineTo(o.x2,o.y2);ctx.stroke()}
      else if(o.t==='text'){ctx.font='16px Arial';ctx.fillText(o.text,o.x,o.y)}
      else if(o.t==='token'){const px=o.size*PPIN/MM;ctx.beginPath();ctx.arc(o.x,o.y,px/2,0,Math.PI*2);ctx.stroke();ctx.font='9px Arial';ctx.textAlign='center';ctx.fillText(o.size+'mm',o.x,o.y+3)}
      else if(o.t==='icon'){ctx.font=o.size+'px Arial';ctx.textAlign='center';ctx.fillText(o.icon,o.x,o.y)}
      else if(['temp','ruler'].includes(o.t)){ctx.beginPath();ctx.moveTo(o.x1,o.y1);ctx.lineTo(o.x2,o.y2);ctx.stroke();ctx.font='12px Arial';ctx.fillText((Math.hypot(o.x2-o.x1,o.y2-o.y1)/PPIN).toFixed(2)+'"',o.x2+5,o.y2-5)}
      ctx.globalAlpha=1;ctx.textAlign='start';
    });
  };
  window.addEventListener('resize',function(){if(document.getElementById('cv'))canvasBind()});
});
