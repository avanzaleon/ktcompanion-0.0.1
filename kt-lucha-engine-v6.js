/* KT Companion · Lucha v6 · reglas de arma + resolución secuencial dado a dado */
(function(){'use strict';
const bin=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r};
function faceCat(face,hit,lethal){if(face===6||face>=lethal)return 'C';if(face>=hit)return 'N';return 'F'}
function baseDist(o){const hit=Math.max(2,Math.min(6,o.hit||4)), lethal=o.lethal?Math.max(2,Math.min(6,o.lethalThreshold||5)):99;let pc=0,pn=0,pf=0;for(let d=1;d<=6;d++){const c=faceCat(d,hit,lethal);if(c==='C')pc+=1/6;else if(c==='N')pn+=1/6;else pf+=1/6}return{pc,pn,pf,hit,lethal}}
function dieDist(o){let d=baseDist(o),pc=d.pc,pn=d.pn,pf=d.pf;
 if(o.relentless){pc=pc+pf*d.pc;pn=pn+pf*d.pn;pf=pf*pf}
 if(o.ceaseless&&o.ceaselessResult){const old=faceCat(+o.ceaselessResult,d.hit,d.lethal);const q=1/6;pc=(pc-(old==='C'?q:0))+q*d.pc;pn=(pn-(old==='N'?q:0))+q*d.pn;pf=(pf-(old==='F'?q:0))+q*d.pf}
 return{pc,pn,pf}
}
function rawRolls(o){const n=Math.max(0,o.attacks|0),accurate=Math.min(n,Math.max(0,o.accurate|0)),r=n-accurate,d=dieDist(o),out=[];for(let c=0;c<=r;c++)for(let m=0;m<=r-c;m++){let f=r-c-m,q=bin(r,c)*bin(r-c,m)*d.pc**c*d.pn**m*d.pf**f;if(q)out.push({c,m:m+accurate,f,q})}return out}
function rolls(o){const base=rawRolls(o);if(!o.balanced)return base;const d=dieDist({...o,balanced:false}),map=new Map();for(const x of base){if(x.f<=0){const k=`${x.c}|${x.m}|${x.f}`;map.set(k,(map.get(k)||0)+x.q);continue}
 // Balanced: reroll one failure. The engine chooses the useful default (a failure).
 for(let c=0;c<=1;c++)for(let m=0;m<=1-c;m++){const f=1-c-m,q=bin(1,c)*bin(1-c,m)*d.pc**c*d.pn**m*d.pf**f;const z={c:x.c+c,m:x.m-1+m,f:x.f-1+f,q:x.q*q};const k=`${z.c}|${z.m}|${z.f}`;map.set(k,(map.get(k)||0)+z.q)}}
 return [...map.entries()].map(([k,q])=>{const [c,m,f]=k.split('|').map(Number);return{c,m,f,q}})
}
function expand(r){return Array(r.c).fill('C').concat(Array(r.m).fill('N'))}
function preprocess(r,o){let c=r.c,m=r.m,f=r.f,severeCreated=false;
 if(o.severe&&c===0&&m>0){c++;m--;severeCreated=true}
 // 2025+ clarification: a Severe-created crit still triggers Devastating/Piercing Crits, but not Rending/Punishing.
 if(!severeCreated&&c>0){if(o.rending&&m>0){c++;m--}if(o.punishing&&f>0){m++;f--}}
 return{c,m,f,severeCreated}
}
function key(s){return JSON.stringify([s.a.join(''),s.b.join(''),s.wa,s.wb,s.turn,s.shockA,s.shockB])}
function canBlock(blocker,target,brutal){if(brutal&&blocker!=='C')return false;if(blocker==='C')return target==='C'||target==='N';return target==='N'}
function strike(s,who,dice){const o={...s,a:s.a.slice(),b:s.b.slice()};const mine=who==='A'?o.a:o.b,enemy=who==='A'?o.b:o.a;mine.splice(mine.indexOf(dice),1);const dmg=who==='A'?(dice==='C'?o.aCD:o.aND):(dice==='C'?o.bCD:o.bND);if(who==='A')o.wb-=dmg;else o.wa-=dmg;
 const shock=who==='A'?o.aShock:o.bShock,used=who==='A'?o.shockA:o.shockB;if(dice==='C'&&shock&&!used){if(who==='A')o.shockA=true;else o.shockB=true;const i=enemy.indexOf('N');enemy.splice(i>=0?i:enemy.indexOf('C'),1)}
 if(dice==='C'){const dev=who==='A'?o.aDev:o.bDev;if(dev){if(who==='A')o.wb-=dev;else o.wa-=dev}}
 return o}
function block(s,who,dice,target){const o={...s,a:s.a.slice(),b:s.b.slice()};const mine=who==='A'?o.a:o.b,enemy=who==='A'?o.b:o.a;mine.splice(mine.indexOf(dice),1);const i=enemy.indexOf(target);if(i>=0)enemy.splice(i,1);return o}
function solve(base){const memo=new Map();function rec(s){const k=key(s);if(memo.has(k))return memo.get(k);if(s.wa<=0)return{a:0,b:1,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};if(s.wb<=0)return{a:1,b:0,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};const mine=s.turn==='A'?s.a:s.b;if(!mine.length){const other=s.turn==='A'?s.b:s.a;if(!other.length){const r={a:s.wb>s.wa?1:0,b:s.wa>s.wb?1:0,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};memo.set(k,r);return r}const r=rec({...s,turn:s.turn==='A'?'B':'A'});memo.set(k,r);return r}
 const enemy=s.turn==='A'?s.b:s.a,brutal=s.turn==='A'?s.bBrutal:s.aBrutal,choices=[];for(const d of mine){choices.push({s:strike(s,s.turn,d),act:`${s.turn==='A'?'ATACANTE':'DEFENSOR'} → GOLPEA ${d==='C'?'CRÍTICO':'NORMAL'}`});if(enemy.length)for(const e of enemy)if(canBlock(d,e,brutal))choices.push({s:block(s,s.turn,d,e),act:`${s.turn==='A'?'ATACANTE':'DEFENSOR'} → BLOQUEA ${e==='C'?'CRÍTICO':'NORMAL'} con ${d==='C'?'CRÍTICO':'NORMAL'}`})}
 let best=null;for(const ch of choices){const r=rec({...ch.s,turn:s.turn==='A'?'B':'A'}),score=s.turn==='A'?r.a-r.b:r.b-r.a;if(!best||score>best.score)best={score,r:{...r,line:[ch.act,...r.line]}}}memo.set(k,best.r);return best.r}
 return rec({...base,a:base.a.slice(),b:base.b.slice(),aStart:base.wa,bStart:base.wb})}
function calculate(a,b){const A=rolls(a),B=rolls(b),sum={a:0,b:0,da:0,db:0,examples:[]};for(const x0 of A)for(const y0 of B){const x=preprocess(x0,a),y=preprocess(y0,b),p=x0.q*y0.q,r=solve({a:expand(x),b:expand(y),wa:a.wounds,wb:b.wounds,aND:a.normalDamage,aCD:a.critDamage,bND:b.normalDamage,bCD:b.critDamage,aBrutal:!!a.brutal,bBrutal:!!b.brutal,aShock:!!a.shock,bShock:!!b.shock,aDev:+a.devastating||0,bDev:+b.devastating||0,turn:'A',shockA:false,shockB:false});sum.a+=p*r.a;sum.b+=p*r.b;sum.da+=p*r.da;sum.db+=p*r.db;if(r.line.length&&sum.examples.length<8)sum.examples.push({p,line:r.line.slice(0,18),winner:r.a>r.b?'A':r.b>r.a?'B':'EMPATE'});}return sum}
window.KTLuchaEngineV6={calculate,rolls,preprocess};})();
