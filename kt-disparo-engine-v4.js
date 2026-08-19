/* KT Companion · Disparo v6 — motor probabilístico independiente.
   Mantiene el módulo aislado de Matriz/Mapa/Guardados/PDF. */
(function(){'use strict';
const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r*=((n-i+1)/i);return r};
function dieParts(hit,lethal){hit=Math.max(2,Math.min(6,hit||4));lethal=Math.max(2,Math.min(7,lethal||7));let c=0,n=0;for(let f=1;f<=6;f++){if(f===6||f>=lethal)c+=1/6;else if(f>=hit)n+=1/6}return{c,n,f:Math.max(0,1-c-n)}}
function rollDist(n,p){const out=[];for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){const f=n-c-m,q=C(n,c)*C(n-c,m)*p.c**c*p.n**m*p.f**f;if(q)out.push({c,m,f,q})}return out}
function rerollState(s,p,rc,rn,rf){const total=rc+rn+rf;if(!total)return[{...s}];const base={c:s.c-rc,m:s.m-rn,f:s.f-rf},r=rollDist(total,p);return r.map(x=>({c:base.c+x.c,m:base.m+x.m,f:base.f+x.f,q:s.q*x.q}))}
function merge(a){const z={};for(const s of a){const k=s.c+'|'+s.m+'|'+s.f;z[k]=(z[k]||0)+s.q}return Object.entries(z).map(([k,q])=>{const [c,m,f]=k.split('|').map(Number);return{c,m,f,q}})}
function postAttack(s,o){let c=s.c,m=s.m,f=s.f,severeUsed=false;
 const ac=Math.min(f,Math.max(0,o.accurate|0));m+=ac;f-=ac;
 c+=Math.max(0,o.autoCrits|0);m+=Math.max(0,o.autoNormals|0);
 if(o.severe&&!c&&m){m--;c++;severeUsed=true}
 if(o.punishing&&!severeUsed&&c&&f){f--;m++}
 if(o.rending&&!severeUsed&&c&&m){m--;c++}
 return{c,m,f}
}
function rawScore(s,o){const x=postAttack(s,o);return x.m*(o.normalDamage||0)+x.c*((o.critDamage||0)+(o.devastating||0))}
function applyRerolls(states,p,o){
 if(o.ceaseless){const face=Math.max(1,Math.min(6,o.ceaselessFace||1));return merge(states.flatMap(s=>{let rc=0,rn=0,rf=0;if(face===6||face>=o.lethal)rc=s.c;else if(face>=o.bs)rn=s.m;else rf=s.f;return rerollState(s,p,rc,rn,rf)}))}
 if(o.balanced||o.relentless){let out=[];for(const s of states){let best=null,bestScore=-Infinity;const maxC=o.relentless?s.c:Math.min(1,s.c),maxM=o.relentless?s.m:Math.min(1,s.m),maxF=o.relentless?s.f:Math.min(1,s.f);for(let rc=0;rc<=maxC;rc++)for(let rn=0;rn<=maxM;rn++)for(let rf=0;rf<=maxF;rf++){if(!o.relentless&&rc+rn+rf>1)continue;const cand=rerollState(s,p,rc,rn,rf),sc=cand.reduce((a,x)=>a+rawScore(x,o)*x.q,0);if(sc>bestScore){bestScore=sc;best=cand}}out.push(...(best||[s]))}return merge(out)}
 return states}
function attack(o){o=Object.assign({attacks:4,bs:4,lethal:7,accurate:0,normalDamage:3,critDamage:4,devastating:0},o);const p=dieParts(o.bs,o.lethal);let states=applyRerolls(rollDist(Math.max(0,o.attacks|0),p),p,o),out=[];for(const s of states){const x=postAttack(s,o);out.push({...x,p:s.q})}return out}
function defenceDist(n,save){return rollDist(Math.max(0,n),dieParts(save,7))}
function blockDamage(a,d,o){let ac=a.c,an=a.m,dc=d.c,dn=d.m;
 // Cover is one automatically retained normal save unless Saturate prevents it.
 if(o.cover&&!o.saturate)dn++;
 // Shock: the first critical strike discards one unresolved defensive success.
 // We model the optimal sequence: a critical is struck first whenever available.
 if(o.shock&&ac>0){if(dn>0)dn--;else if(dc>0)dc--}
 let best=Infinity;
 for(let bc=0;bc<=Math.min(dc,ac);bc++)for(let bn=0;bn<=Math.min(dn,an);bn++){
   let cLeft=ac-bc,nLeft=an-bn,remCrit=dc-bc,remNorm=dn-bn;
   if(o.brutal){cLeft-=Math.min(remCrit,cLeft)}
   else{
     // A normal defence success blocks a normal attack success; a critical
     // defence success can block either a critical or normal success.
     const pair=Math.min(remNorm,nLeft);nLeft-=pair;remNorm-=pair;
     const cc=Math.min(remCrit,cLeft);cLeft-=cc;remCrit-=cc;
     const cn=Math.min(remCrit,nLeft);nLeft-=cn;
   }
   cLeft=Math.max(0,cLeft);nLeft=Math.max(0,nLeft);
   const dmg=cLeft*(o.critDamage||0)+nLeft*(o.normalDamage||0)+cLeft*(o.devastating||0);
   if(dmg<best)best=dmg;
 }
 return best===Infinity?0:best
}
function one(o){const at=attack(o),baseDef=Math.max(0,Math.floor(o.defenceDice||3)),dist={};for(const a of at){
 const pc=Math.max(0,(o.piercing||0)+(a.c>0?(o.piercingCrits||0):0)),n=Math.max(0,baseDef-pc),ds=defenceDist(n,o.save||4);
 for(const d of ds){const dmg=blockDamage(a,d,o),p=a.p*d.q;
  if(o.fnp&&dmg){let cur={0:1};for(let i=0;i<dmg;i++){const nx={};for(const[k,v]of Object.entries(cur)){nx[k]=(nx[k]||0)+v*(1-o.fnp);nx[+k+1]=(nx[+k+1]||0)+v*o.fnp}cur=nx}for(const[k,v]of Object.entries(cur))dist[k]=(dist[k]||0)+p*v}
  else dist[dmg]=(dist[dmg]||0)+p;
 }
 }let z=Object.values(dist).reduce((a,b)=>a+b,0)||1;Object.keys(dist).forEach(k=>dist[k]/=z);return dist}
function convolve(a,b){const r={};for(const[x,px]of Object.entries(a))for(const[y,py]of Object.entries(b)){const k=+x+ +y;r[k]=(r[k]||0)+px*py}return r}
function resolve(o){let d=one(o),r=Math.max(1,o.rounds||1);for(let i=1;i<r;i++)d=convolve(d,one(o));let mean=0,kill=0,w=Math.max(1,o.wounds||1);for(const[k,p]of Object.entries(d)){mean+=+k*p;if(+k>=w)kill+=p}return{distribution:d,mean,kill}}
window.KTCompanionShootEngineV4={dieParts,attack,one,resolve};})();
