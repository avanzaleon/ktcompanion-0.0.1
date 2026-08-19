/* KT Companion · Disparo v4 — core resolver independiente. */
(function(){'use strict';
const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r};
const P=(n,k)=>C(n,k);
function dieParts(hit,lethal){hit=Math.max(2,Math.min(6,hit||4));lethal=Math.max(2,Math.min(7,lethal||7));let c=0,n=0;for(let f=1;f<=6;f++){if(f===6||f>=lethal)c+=1/6;else if(f>=hit)n+=1/6}return{c,n,f:Math.max(0,1-c-n)}}
function rollDist(n,p){const out=[];for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){const f=n-c-m,q=C(n,c)*C(n-c,m)*p.c**c*p.n**m*p.f**f;if(q)out.push({c,m,f,q})}return out}
function rerollState(s,p,rc,rn,rf){let base={c:s.c-rc,m:s.m-rn,f:s.f-rf},r=rollDist(rc+rn+rf,p),out=[];for(const x of r)out.push({c:base.c+x.c,m:base.m+x.m,f:base.f+x.f,q:s.q*x.q});return out}
function merge(a){const z={};for(const s of a){const k=s.c+'|'+s.m+'|'+s.f;z[k]=(z[k]||0)+s.q}return Object.entries(z).map(([k,q])=>{const [c,m,f]=k.split('|').map(Number);return{c,m,f,q}})}
function applyRerolls(states,p,o){if(o.ceaseless){/* UI supplies the numerical result to reroll. */const face=Math.max(1,Math.min(6,o.ceaselessFace||1));let out=[];for(const s of states){/* category mapping: a face is either crit, normal or fail; rerolling all matching dice */let kind=face===6||face>=o.lethal?'c':face>=o.bs?'m':'f';let k=kind==='c'?s.c:kind==='m'?s.m:s.f;out.push(...rerollState(s,p,kind==='c'?k:0,kind==='m'?k:0,kind==='f'?k:0))}return merge(out)}
 if(o.relentless){let out=[];for(const s of states){for(let rc=0;rc<=s.c;rc++)for(let rn=0;rn<=s.m;rn++)for(let rf=0;rf<=s.f;rf++)out.push(...rerollState(s,p,rc,rn,rf))}return merge(out)}
 if(o.balanced){let out=[];for(const s of states){out.push(...rerollState(s,p,1,0,0),...rerollState(s,p,0,1,0),...rerollState(s,p,0,0,1));}return merge(out)}
 return states}
function attack(o){o=Object.assign({attacks:4,bs:4,lethal:7,accurate:0,normalDamage:3,critDamage:4,devastating:0},o);const p=dieParts(o.bs,o.lethal);let states=rollDist(o.attacks,p);states=applyRerolls(states,p,o);let out=[];for(const s of states){let c=s.c,m=s.m,f=s.f;
  /* Accurate retains up to x unrolled dice as normal successes. */ const ac=Math.min(f,Math.max(0,o.accurate|0));m+=ac;f-=ac;
  /* Lethal is represented in the initial distribution; these are retained criticals. */
  if(o.autoCrits)c+=o.autoCrits;if(o.autoNormals)m+=o.autoNormals;
  /* Punishing and Rending are applied to retained results. Severe takes precedence over both. */
  let severeUsed=false;if(o.severe&&!c&&m){m--;c++;severeUsed=true}
  if(o.punishing&&c&&f){f--;m++}
  if(o.rending&&c&&m&&!severeUsed){m--;c++}
  const piercing=(o.piercing||0)+(o.piercingCrits&&c?o.piercingCrits:0);
  out.push({c,m,f,p:s.q,piercing,severeUsed});
 }return out}
function defenceDist(n,save){return rollDist(n,dieParts(save,7))}
function blockDamage(a,d,o){let ac=a.c,an=a.m,dc=d.c,dn=d.m;
  /* Shock: first critical strike discards one unresolved defence success. */
  if(o.shock&&ac>0){if(dn>0)dn--;else if(dc>0)dc--}
  /* Cover save is an automatic normal success, unless Saturate. */
  if(o.cover&&!o.saturate)dn++;
  /* Brutal: only critical defence dice may block. Otherwise, optimise blocks by damage value. */
  let best=Infinity;
  for(let bc=0;bc<=Math.min(dc,ac);bc++){
    let rc=ac-bc, remdc=dc-bc;
    for(let bn=0;bn<=Math.min(dn,an);bn++){
      let rrn=an-bn, remn=dn-bn;
      let pair=Math.min(Math.floor(remn/2),rc); let cLeft=rc-pair; let nLeft=rrn;
      if(o.brutal){pair=0;cLeft=rc;nLeft=rrn}
      /* Any remaining critical defence can block one remaining attack success. */
      let extra=Math.min(remdc,cLeft);cLeft-=extra;
      if(!o.brutal){let extraN=Math.min(remdc-extra,nLeft);nLeft-=extraN}
      const dmg=cLeft*(o.critDamage||0)+nLeft*(o.normalDamage||0)+cLeft*(o.devastating||0);
      if(dmg<best)best=dmg;
    }
  }
  return best===Infinity?ac*(o.critDamage||0)+an*(o.normalDamage||0):best;
}
function one(o){const at=attack(o),n=Math.max(0,Math.floor((o.defenceDice||3)-(o.piercing||0)));const ds=defenceDist(n,o.save||4),dist={};for(const a of at)for(const d of ds){const dmg=blockDamage(a,d,o);let p=a.p*d.q;if(o.fnp){/* FNP is modelled per point of inflicted damage. */let cur={0:1};for(let i=0;i<dmg;i++){const nx={};for(const[k,v]of Object.entries(cur)){nx[k]=(nx[k]||0)+v*(1-o.fnp);nx[+k+1]=(nx[+k+1]||0)+v*o.fnp}cur=nx}for(const[k,v]of Object.entries(cur))dist[k]=(dist[k]||0)+p*v}else dist[dmg]=(dist[dmg]||0)+p}let z=Object.values(dist).reduce((a,b)=>a+b,0)||1;Object.keys(dist).forEach(k=>dist[k]/=z);return dist}
function convolve(a,b){const r={};for(const[x,px]of Object.entries(a))for(const[y,py]of Object.entries(b)){const k=+x+ +y;r[k]=(r[k]||0)+px*py}return r}
function resolve(o){let d=one(o),r=Math.max(1,o.rounds||1);for(let i=1;i<r;i++)d=convolve(d,one(o));let mean=0,kill=0,w=Math.max(1,o.wounds||1);for(const[k,p]of Object.entries(d)){mean+=+k*p;if(+k>=w)kill+=p}return{distribution:d,mean,kill}}
window.KTCompanionShootEngineV4={dieParts,attack,one,resolve};
})();
