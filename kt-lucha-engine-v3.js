/* KT Companion · Lucha v3 · resolución secuencial dado a dado */
(function(){'use strict';
const memo=new Map();
function bin(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r}
function clone(x){return JSON.parse(JSON.stringify(x))}
function key(s){return JSON.stringify(s)}
function diceOutcomes(o){
 const n=Math.max(0,o.atk|0), hit=Math.max(2,Math.min(6,o.hit|0)), lethal=Math.max(0,o.lethal|0);
 const p={};
 for(let i=0;i<=n;i++)for(let j=0;j<=n-i;j++){
  const k=n-i-j; // i crit, j normal, k fail
  let pc=1/6, pn=Math.max(0,(7-hit)/6-pc), pf=Math.max(0,1-pc-pn);
  if(lethal>=2){
   const l=Math.max(2,Math.min(6,lethal));
   // results >= lethal are critical; 6 is already critical
   pc=Math.max(1/6,(7-l)/6); pn=Math.max(0,(7-hit)/6-pc); pf=Math.max(0,1-pc-pn);
  }
  const q=bin(n,i)*bin(n-i,j)*pc**i*pn**j*pf**k;
  if(q)p[i+'c'+j+'n']=(p[i+'c'+j+'n']||0)+q;
 }
 let arr=Object.entries(p).map(([k,q])=>{const m=k.match(/(\d+)c(\d+)n/);return{c:+m[1],n:+m[2],p:q}});
 // Accurate: retain up to x automatic normal successes. We model them as normals that cannot be rerolled.
 // Rending/Punishing/Severe are then applied once only; no die can be retained twice.
 const out=[];
 for(const r of arr){
  let c=r.c,nm=r.n,f=n-r.c-r.n;
  const acc=Math.min(Math.max(0,o.accurate|0),f);nm+=acc;f-=acc;
  if(o.severe&&!c&&nm){c++;nm--;}
  if(o.rending&&c&&nm){c++;nm--;}
  if(o.punishing&&c&&f){nm++;f--;}
  out.push({c,n:nm,f,p:r.p,locked:acc});
 }
 return out;
}
function applyRerolls(o,outs){
 // Exact enumeration for the common one-reroll case; for Relentless/Ceaseless we
 // evaluate each legal number of rerolled dice and retain the best result later.
 if(!o.balanced&&!o.relentless&&!o.ceaseless)return outs;
 const max=o.balanced?1:Math.max(1,o.atk|0);
 const expanded=[];
 for(const s of outs){
  for(let k=0;k<=Math.min(max,s.f);k++){
   // rerolled failures can become normal/critical; failures are the only rerolls
   // considered here because rerolling a retained success is never mandatory.
   const pCrit=1/6,pNorm=Math.max(0,(7-(o.hit|0))/6-pCrit),pFail=1-pCrit-pNorm;
   for(let c2=0;c2<=k;c2++)for(let n2=0;n2<=k-c2;n2++){
    const f2=k-c2-n2,q=bin(k,c2)*bin(k-c2,n2)*pCrit**c2*pNorm**n2*pFail**f2;
    if(q)expanded.push({c:s.c+c2,n:s.n+n2,f:s.f-k+f2,p:s.p*q,locked:s.locked});
   }
  }
 }
 return expanded.length?expanded:outs;
}
function normalise(a){const z=a.reduce((s,x)=>s+x.p,0)||1;return a.map(x=>({...x,p:x.p/z}))}
function initial(o){return normalise(applyRerolls(o,diceOutcomes(o)))}
function canBlock(blockDie, targetDie, brutal){if(brutal&&blockDie!=='c')return false;return blockDie==='c'||(blockDie==='n'&&targetDie==='n')}
function signature(s){return [s.a.hp,s.b.hp,s.a.d.join(''),s.b.d.join(''),s.turn,s.a.shock?1:0,s.b.shock?1:0].join('|')}
function terminalValue(s){if(s.a.hp<=0&&s.b.hp<=0)return 0;if(s.a.hp<=0)return -1;if(s.b.hp<=0)return 1;return null}
function solveState(s){
 const tv=terminalValue(s);if(tv!==null)return{v:tv,da:s.a.start-s.a.hp,db:s.b.start-s.b.hp};
 if(!s.a.d.length&&!s.b.d.length)return{v:0,da:s.a.start-s.a.hp,db:s.b.start-s.b.hp};
 const k=signature(s);if(memo.has(k))return memo.get(k);
 const me=s.turn===0?s.a:s.b,op=s.turn===0?s.b:s.a;
 if(!me.d.length){const nx=clone(s);nx.turn=1-nx.turn;const r=solveState(nx);memo.set(k,r);return r}
 let best=s.turn===0?-Infinity:Infinity,bestR=null;
 for(let i=0;i<me.d.length;i++){
  const die=me.d[i];
  // STRIKE
  {const nx=clone(s);const actor=nx.turn===0?nx.a:nx.b;const target=nx.turn===0?nx.b:nx.a;actor.d.splice(i,1);const dmg=die==='c'?actor.cd:actor.nd;target.hp-=dmg;
   if(die==='c'&&actor.shock&&!actor.shockUsed){const ni=target.d.indexOf('n');if(ni>=0)target.d.splice(ni,1);else {const ci=target.d.indexOf('c');if(ci>=0)target.d.splice(ci,1)}actor.shockUsed=true}
   if(die==='c'&&actor.dev)target.hp-=actor.dev;
   nx.turn=1-nx.turn;const r=solveState(nx);if((s.turn===0&&r.v>best)||(s.turn===1&&r.v<best)){best=r.v;bestR=r}}
  // BLOCK
  for(let j=0;j<op.d.length;j++)if(canBlock(die,op.d[j],me.brutal)){
   const nx=clone(s),actor=nx.turn===0?nx.a:nx.b,opp=nx.turn===0?nx.b:nx.a;actor.d.splice(i,1);opp.d.splice(j,1);nx.turn=1-nx.turn;const r=solveState(nx);if((s.turn===0&&r.v>best)||(s.turn===1&&r.v<best)){best=r.v;bestR=r}}
 }
 const res=bestR||{v:0,da:0,db:0};memo.set(k,res);return res;
}
function fight(cfg){
 memo.clear();const ao=initial(cfg.a||{}),bo=initial(cfg.b||{});let out={aWin:0,bWin:0,draw:0,damageToA:0,damageToB:0};
 for(const a of ao)for(const b of bo){const A={hp:+cfg.a.hp,start:+cfg.a.hp,nd:+cfg.a.nd,cd:+cfg.a.cd,dev:+cfg.a.dev||0,brutal:!!cfg.a.brutal,shock:!!cfg.a.shock,shockUsed:false,d:['n']};A.d=Array(a.n).fill('n').concat(Array(a.c).fill('c'));const B={hp:+cfg.b.hp,start:+cfg.b.hp,nd:+cfg.b.nd,cd:+cfg.b.cd,dev:+cfg.b.dev||0,brutal:!!cfg.b.brutal,shock:!!cfg.b.shock,shockUsed:false,d:Array(b.n).fill('n').concat(Array(b.c).fill('c'));const s={a:A,b:B,turn:0};const r=solveState(s),p=a.p*b.p;if(r.v>0)out.aWin+=p;else if(r.v<0)out.bWin+=p;else out.draw+=p;out.damageToA+=p*(A.start-Math.max(0,r.da?A.start-r.da:A.hp));out.damageToB+=p*(B.start-Math.max(0,r.db?B.start-r.db:B.hp));}
 return out;
}
window.KTLuchaEngineV3={fight,initial,diceOutcomes};
})();
