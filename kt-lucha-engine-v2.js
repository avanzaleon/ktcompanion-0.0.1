/* KT Companion · Lucha v2.1 · motor secuencial independiente */
(function(){'use strict';
const C=(c,n)=>Array.from({length:n},()=>c);
const clone=x=>JSON.parse(JSON.stringify(x));
function bin(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r}
function outcomes(n,hit){let a=[];for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){let f=n-c-m,pc=1/6,pn=Math.max(0,(7-hit)/6-1/6),pf=Math.max(0,1-pc-pn),p=bin(n,c)*bin(n-c,m)*pc**c*pn**m*pf**f;if(p)a.push({c,m,f,p})}return a}
function key(s){return s.a.hp+'|'+s.b.hp+'|'+s.a.successes.join('')+'|'+s.b.successes.join('')+'|'+s.turn}
function blockable(def,atk){return def==='c'||atk==='n'}
/* Exact sequential resolution. Each active success is resolved individually. The active player chooses strike/block; the engine uses backward induction rather than randomising the choice. */
function simulate(A,B){const memo=new Map();function rec(s){if(s.a.hp<=0)return{aWin:0,bWin:1,draw:0,damageToA:A.hp-Math.max(0,s.a.hp),damageToB:B.hp-Math.max(0,s.b.hp)};if(s.b.hp<=0)return{aWin:1,bWin:0,draw:0,damageToA:A.hp-Math.max(0,s.a.hp),damageToB:B.hp-Math.max(0,s.b.hp)};if(!s.a.successes.length&&!s.b.successes.length)return{aWin:.5,bWin:.5,draw:1,damageToA:A.hp-Math.max(0,s.a.hp),damageToB:B.hp-Math.max(0,s.b.hp)};let k=key(s);if(memo.has(k))return memo.get(k);let me=s.turn===0?s.a:s.b,op=s.turn===0?s.b:s.a;if(!me.successes.length){let x=clone(s);x.turn=1-x.turn;return memo.set(k,rec(x)).get(k)}let vals=[];for(let i=0;i<me.successes.length;i++){let die=me.successes[i];let x=clone(s);let xm=x.turn===0?x.a:x.b,xo=x.turn===0?x.b:x.a;xm.successes.splice(i,1);xo.hp-=die==='c'?xm.cd:xm.nd;x.turn=1-x.turn;vals.push(rec(x));let y=clone(s);let ym=y.turn===0?y.a:y.b,yo=y.turn===0?y.b:y.a;ym.successes.splice(i,1);let idx=yo.successes.findIndex(z=>blockable(die,z));if(idx>=0){yo.successes.splice(idx,1);y.turn=1-y.turn;vals.push(rec(y))}}
/* A chooses the branch with the highest A win chance; B chooses the lowest. Damage is tie-broken in favour of survival. */
let best=vals[0];for(const v of vals.slice(1)){const score=v.aWin+(v.draw*.5);const bestScore=best.aWin+(best.draw*.5);if((s.turn===0&&score>bestScore)||(s.turn===1&&score<bestScore))best=v}memo.set(k,best);return best}
return rec({a:clone(A),b:clone(B),turn:0})}
function fight(cfg){let ao=outcomes(cfg.a.atk,cfg.a.hit),bo=outcomes(cfg.b.atk,cfg.b.hit),r={aWin:0,bWin:0,draw:0,damageToA:0,damageToB:0};for(const a of ao)for(const b of bo){let A={hp:cfg.a.hp,nd:cfg.a.nd,cd:cfg.a.cd,successes:C('n',a.m).concat(C('c',a.c))},B={hp:cfg.b.hp,nd:cfg.b.nd,cd:cfg.b.cd,successes:C('n',b.m).concat(C('c',b.c))},z=simulate(A,B),p=a.p*b.p;r.aWin+=z.aWin*p;r.bWin+=z.bWin*p;r.draw+=z.draw*p;r.damageToA+=z.damageToA*p;r.damageToB+=z.damageToB*p}return r}
window.KTLuchaEngine={fight,outcomes,simulate};})();
