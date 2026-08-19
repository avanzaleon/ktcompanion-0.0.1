/* KT Companion - Disparo v3: motor probabilistico independiente */
(function(){'use strict';
const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r*=((n-i+1)/i);return r};
function probs(target){const t=Math.max(2,Math.min(6,target));return{crit:1/6,norm:Math.max(0,(7-t)/6-1/6),fail:Math.max(0,1-Math.max(0,(7-t)/6))}}
function conv(map){let z={};for(const [k,p] of map)z[k]=(z[k]||0)+p;return z}
function attack(o){const n=Math.max(0,Math.floor(o.attacks)),p=probs(o.bs);let states=[];
 for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){let f=n-c-m,q=C(n,c)*C(n-c,m)*p.crit**c*p.norm**m*p.fail**f;if(q)states.push({c,m,f,q})}
 // Balanced: one reroll of a selected die; enumerate optimal choice among failed dice.
 if(o.balanced&&n){let out=[];for(const s of states){out.push({...s,q:s.q*0.5});if(s.f){let pc=p.crit,pn=p.norm,pf=p.fail;out.push({c:s.c+1,m:s.m,f:s.f-1,q:s.q*0.5*pc});if(pn)out.push({c:s.c,m:s.m+1,f:s.f-1,q:s.q*0.5*pn});if(pf)out.push({c:s.c,m:s.m,f:s.f,q:s.q*0.5*pf})}}states=out}
 let out=[];for(const s of states){let c=s.c+(o.autoCrits||0),m=s.m+(o.autoNorms||0),f=s.f;let x=Math.min(f,o.failsToNormals||0);m+=x;f-=x;x=Math.min(m,o.normalsToCrits||0);c+=x;m-=x;
  if(o.accurate) { x=Math.min(f,Math.max(0,o.accurate));m+=x;f-=x; }
  if(o.lethalCrit){x=Math.min(f,Math.max(0,o.lethalCrit));c+=x;f-=x}
  if(o.rending&&c&&m){m--;c++}
  if(o.ceaseless&&f){m+=Math.min(f,1);f-=Math.min(f,1)}
  let damage=m*(o.normalDamage||0)+c*(o.critDamage||0)+c*(o.devastating||0);out.push({c,m,f,damage,q:s.q})}
 let total=out.reduce((a,x)=>a+x.q,0)||1;out.forEach(x=>x.q/=total);return out}
function saves(o){const p=probs(o.save),n=Math.max(0,Math.floor(o.defenceDice||0)),out=[];for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){let f=n-c-m,q=C(n,c)*C(n-c,m)*p.crit**c*p.norm**m*p.fail**f;if(q)out.push({c,m,f,q})}return out}
function one(o){const at=attack(o),ds=saves(o),dist={};for(const a of at){if(a.c+a.m===0){dist[0]=(dist[0]||0)+a.q;continue}for(const d of ds){let blockedCrit=Math.max(0,d.c-(o.piercing||0));let blockedNorm=Math.max(0,d.m+(o.cover||0)-(o.piercing||0));let dc=Math.max(0,a.c-blockedCrit),dn=Math.max(0,a.m-blockedNorm);let dmg=dc*(o.critDamage||0)+dn*(o.normalDamage||0)+dc*(o.devastating||0);let hits=dc+dn;let p=a.q*d.q;
   // FNP is resolved as binomial rolls per hit; reduce each damage instance accordingly.
   if(o.fnp&&hits){for(let k=0;k<=hits;k++){let survive=C(hits,k)*(1-o.fnp)**k*o.fnp**(hits-k);let dealt=dmg-(Math.min(k,dc)*(o.critDamage||0)+Math.max(0,k-Math.min(k,dc))*(o.normalDamage||0));let key=Math.max(0,dealt);dist[key]=(dist[key]||0)+p*survive}}
   else dist[dmg]=(dist[dmg]||0)+p;
  }}
 let total=Object.values(dist).reduce((a,b)=>a+b,0)||1;Object.keys(dist).forEach(k=>dist[k]/=total);return dist}
function convolve(a,b){let r={};for(const[x,px]of Object.entries(a))for(const[y,py]of Object.entries(b)){const k=+x+ +y;r[k]=(r[k]||0)+px*py}return r}
function resolve(o){let d=one(o),rounds=Math.max(1,Math.floor(o.rounds||1));for(let i=1;i<rounds;i++)d=convolve(d,one(o));let mean=0,kill=0,hp=Math.max(1,o.wounds||1);for(const[k,p]of Object.entries(d)){mean+=+k*p;if(+k>=hp)kill+=p}return{distribution:d,mean,kill}}
window.KTCompanionShootEngineV3={attack,saves,one,resolve};})();
