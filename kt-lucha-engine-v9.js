/* KT Companion · Lucha v9 · alternancia correcta y trazas representativas */
(function(){'use strict';
const bin=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r};
function faceCat(face,hit,lethal){if(face===6||face>=lethal)return 'C';if(face>=hit)return 'N';return 'F'}
function baseDist(o){const hit=Math.max(2,Math.min(6,o.hit||4));const lethal=o.lethal?Math.max(2,Math.min(6,o.lethalThreshold||5)):99;let pc=0,pn=0,pf=0;for(let d=1;d<=6;d++){const c=faceCat(d,hit,lethal);if(c==='C')pc+=1/6;else if(c==='N')pn+=1/6;else pf+=1/6}return{pc,pn,pf,hit,lethal}}
function rawRolls(o){const n=Math.max(0,o.attacks|0),accurate=Math.min(n,Math.max(0,o.accurate|0)),r=n-accurate,d=baseDist(o),out=[];for(let c=0;c<=r;c++)for(let m=0;m<=r-c;m++){const f=r-c-m,q=bin(r,c)*bin(r-c,m)*d.pc**c*d.pn**m*d.pf**f;if(q)out.push({c,m:m+accurate,f,q})}return out}
function expand(r){return Array(r.c).fill('C').concat(Array(r.m).fill('N'))}
function preprocess(r,o){let c=r.c,m=r.m,f=r.f;if(o.severe&&c===0&&m>0){c++;m--}if(c>0&&o.rending&&m>0){c++;m--}if(c>0&&o.punishing&&f>0){m++;f--}return{c,m,f}}
function stateKey(s){return JSON.stringify({a:s.a,b:s.b,wa:s.wa,wb:s.wb,t:s.turn,forced:!!s.forced,sa:s.shockA,sb:s.shockB})}
function cloneState(s){return{...s,a:s.a.slice(),b:s.b.slice()}}
function canBlock(blocker,target,brutal){if(brutal&&blocker!=='C')return false;if(blocker==='C')return target==='C'||target==='N';return target==='N'}
function strike(s,who,dice){const o=cloneState(s),mine=who==='A'?o.a:o.b,enemy=who==='A'?o.b:o.a;const idx=mine.indexOf(dice);if(idx<0)return o;mine.splice(idx,1);const dmg=who==='A'?(dice==='C'?o.aCD:o.aND):(dice==='C'?o.bCD:o.bND);if(who==='A')o.wb-=dmg;else o.wa-=dmg;if(dice==='C'){const shock=who==='A'?o.aShock:o.bShock,used=who==='A'?o.shockA:o.shockB;if(shock&&!used){if(who==='A')o.shockA=true;else o.shockB=true;const i=enemy.indexOf('N');if(i>=0)enemy.splice(i,1);else if(enemy.length)enemy.splice(0,1)}}if(dice==='C'){const dev=who==='A'?o.aDev:o.bDev;if(dev){if(who==='A')o.wb-=dev;else o.wa-=dev}}return o}
function block(s,who,dice,target){const o=cloneState(s),mine=who==='A'?o.a:o.b,enemy=who==='A'?o.b:o.a;const mi=mine.indexOf(dice),ei=enemy.indexOf(target);if(mi<0||ei<0)return o;mine.splice(mi,1);enemy.splice(ei,1);return o}
function solve(base){const memo=new Map();function rec(s){
 if(s.wa<=0)return{a:0,b:1,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};
 if(s.wb<=0)return{a:1,b:0,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[]};
 const k=stateKey(s);if(memo.has(k))return memo.get(k);
 const mine=s.turn==='A'?s.a:s.b;
 const other=s.turn==='A'?s.b:s.a;
 if(!mine.length){
   if(!other.length){const r={a:s.wb>s.wa?1:0,b:s.wa>s.wb?1:0,da:s.aStart-s.wa,db:s.bStart-s.wb,line:[`${s.turn==='A'?'ATACANTE':'DEFENSOR'} → SIN ÉXITOS DISPONIBLES (combate resuelto)`]};memo.set(k,r);return r}
   // Si uno no tiene éxitos, el otro resuelve TODOS los que le queden consecutivamente.
   const who=s.turn==='A'?'ATACANTE':'DEFENSOR',next=s.turn==='A'?'B':'A';
   const r=rec({...s,turn:next,forced:true});
   const out={...r,line:[`${who} → SIN ÉXITOS DISPONIBLES (el ${next==='B'?'DEFENSOR':'ATACANTE'} continúa)`,...r.line]};memo.set(k,out);return out;
 }
 const enemyBrutal=s.turn==='A'?s.bBrutal:s.aBrutal;
 const choices=[];
 for(const d of mine){
   choices.push({s:strike(s,s.turn,d),act:`${s.turn==='A'?'ATACANTE':'DEFENSOR'} → GOLPEA ${d==='C'?'CRÍTICO':'NORMAL'}`});
   if(other.length)for(const e of other)if(canBlock(d,e,enemyBrutal))choices.push({s:block(s,s.turn,d,e),act:`${s.turn==='A'?'ATACANTE':'DEFENSOR'} → BLOQUEA ${e==='C'?'CRÍTICO':'NORMAL'} con ${d==='C'?'CRÍTICO':'NORMAL'}`});
 }
 let best=null;
 for(const ch of choices){
   // En modo forzado, quien conserva dados continúa resolviendo sin devolver el turno al rival vacío.
   const nextTurn=s.forced?s.turn:(s.turn==='A'?'B':'A');
   const r=rec({...ch.s,turn:nextTurn,forced:!!s.forced});
   const score=s.turn==='A'?r.a-r.b:r.b-r.a;
   if(!best||score>best.score)best={score,r:{...r,line:[ch.act,...r.line]}};
 }
 memo.set(k,best.r);return best.r;
 }
 return rec({...base,a:base.a.slice(),b:base.b.slice(),aStart:base.wa,bStart:base.wb,forced:false})}
function calculate(a,b){const A=rawRolls(a),B=rawRolls(b),sum={a:0,b:0,da:0,db:0,examples:[]},candidates=[];for(const x0 of A)for(const y0 of B){const x=preprocess(x0,a),y=preprocess(y0,b),p=x0.q*y0.q,r=solve({a:expand(x),b:expand(y),wa:a.wounds,wb:b.wounds,aND:a.normalDamage,aCD:a.critDamage,bND:b.normalDamage,bCD:b.critDamage,aBrutal:!!a.brutal,bBrutal:!!b.brutal,aShock:!!a.shock,bShock:!!b.shock,aDev:+a.devastating||0,bDev:+b.devastating||0,turn:'A',shockA:false,shockB:false});sum.a+=p*r.a;sum.b+=p*r.b;sum.da+=p*r.da;sum.db+=p*r.db;if(r.line.length){const line=r.line.slice(0,24),hasAttackerAction=line.some(x=>/^ATACANTE → (GOLPEA|BLOQUEA)/.test(x));candidates.push({p,line,winner:r.a>r.b?'A':r.b>r.a?'B':'EMPATE',hasAttackerAction});}}
 // Mostrar primero secuencias donde el atacante realmente tiene una acción; dejar como mucho una de “sin éxitos”.
 candidates.sort((u,v)=>Number(v.hasAttackerAction)-Number(u.hasAttackerAction)||v.p-u.p);const seen=new Set();for(const e of candidates){const sig=e.line.join('|');if(seen.has(sig))continue;seen.add(sig);if(!e.hasAttackerAction&&sum.examples.some(z=>!z.line.some(x=>/^ATACANTE → (GOLPEA|BLOQUEA)/.test(x))))continue;sum.examples.push(e);if(sum.examples.length>=8)break}return sum}
window.KTLuchaEngineV9={calculate,rawRolls,preprocess};window.KTLuchaEngineV8=window.KTLuchaEngineV9;window.KTLuchaEngineV7=window.KTLuchaEngineV9;
})();
