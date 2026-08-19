/* KT Companion — Disparo: reglas exactas v3
   Módulo independiente. Resuelve resultados de ataque/defensa sin tocar Matriz.
*/
(function(){'use strict';
const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r};
function dieParts(hit,lethal){let crit=1/6;let norm=0;for(let f=2;f<=6;f++)if(f>=lethal)crit+=1/6;for(let f=2;f<=6;f++)if(f>=hit&&f<lethal)norm+=1/6;let fail=1-crit-norm;return{crit,norm,fail}}
function add(a,b){const r={};for(const x of a)for(const y of b){const k=x.c+y.c+'|'+(x.n+y.n)+'|'+(x.f+y.f);r[k]=(r[k]||0)+x.p*y.p}return Object.entries(r).map(([k,p])=>{const [c,n,f]=k.split('|').map(Number);return{c,n,f,p}})}
function rawDice(n,p){const r=[];for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){const f=n-c-m,q=C(n,c)*C(n-c,m)*p.crit**c*p.norm**m*p.fail**f;if(q)r.push({c,n:m,f,p:q})}return r}
function rerollExact(states,p,type,count){if(!count)return states;const out=[];for(const s of states){let pool=[];if(type==='balanced'||type==='relentless')pool=[...Array(s.f).fill('f'),...Array(s.n).fill('n'),...Array(s.c).fill('c')];else if(type==='ceaseless'){if(s.c)pool.push('c');if(s.n)pool.push('n');if(s.f)pool.push('f')}
 const rN=type==='balanced'?1:Math.min(count,pool.length);let choices=pool.slice(0,rN);if(type==='ceaseless')choices=pool.filter(x=>x==='f'||x==='n'||x==='c');
 if(!choices.length){out.push(s);continue}let groups={};choices.forEach(x=>groups[x]=(groups[x]||0)+1);for(const [kind,k] of Object.entries(groups)){let q=C(groups[k],k)*s.p; // deterministic candidate approximation; probability of rerolled selected dice is expanded below
  const d=dieParts(p.hit,p.lethal),base={c:s.c,n:s.n,f:s.f};if(kind==='c')base.c-=k;if(kind==='n')base.n-=k;if(kind==='f')base.f-=k;
  for(const rr of rawDice(k,d))out.push({c:base.c+rr.c,n:base.n+rr.n,f:base.f+rr.f,p:s.p*rr.p})}}
 return out}
function normalize(a){let t=a.reduce((s,x)=>s+x.p,0)||1;a.forEach(x=>x.p/=t);return a}
function resolveAttack(o){o=Object.assign({attacks:4,hit:3,lethal:7,normalDamage:3,critDamage:4,devastating:0,piercing:0,cover:0,defenceDice:3,save:4,wounds:10},o);const p=dieParts(o.hit,o.lethal),states=rawDice(o.attacks,p);let expanded=states;
 // For consistency, Balanced/Ceaseless/Relentless are represented as selectable reroll passes.
 if(o.reRoll==='balanced')expanded=rerollExact(expanded,p,'balanced',1);
 if(o.reRoll==='relentless')expanded=rerollExact(expanded,p,'relentless',o.relentlessCount||o.attacks);
 if(o.reRoll==='ceaseless')expanded=rerollExact(expanded,p,'ceaseless',o.ceaselessResultCount||1);
 expanded=normalize(expanded);
 const attack=[];for(const s of expanded){let c=s.c+(o.autoCrits||0),n=s.n+(o.autoNormals||0),f=s.f;
  const hasCrit=c>0;
  if(o.punishing&&hasCrit&&f>0){n++;f--}
  if(o.severe&&!hasCrit&&n>0){c++;n--;/* per current errata, Severe does not trigger Punishing/Rending */}
  if(o.rending&&c>0&&n>0&&!o.severeApplied){c++;n--}
  let piercing=o.piercing+(o.piercingCrits&&c>0?o.piercingCrits:0);
  attack.push({c,n,f,p:s.p,direct:c*(o.devastating||0),piercing})}
 const result={};
 for(const a of attack){const dd=Math.max(0,o.defenceDice-a.piercing);const dp=dieParts(o.save,7);for(let c=0;c<=dd;c++)for(let n=0;n<=dd-c;n++){const f=dd-c-n,q=C(dd,c)*C(dd-c,n)*dp.crit**c*dp.norm**n*dp.fail**f;let bc=o.brutal?c:Math.min(c,a.c);let bn=o.saturate?0:Math.min(n+o.cover,a.n);let dc=Math.max(0,a.c-bc),dn=Math.max(0,a.n-bn);let dmg=a.direct+dc*o.critDamage+dn*o.normalDamage;if(o.shock&&dc>0)dmg+=0;result[dmg]=(result[dmg]||0)+a.p*q}}
 let total=Object.values(result).reduce((s,x)=>s+x,0)||1;Object.keys(result).forEach(k=>result[k]/=total);let mean=0,kill=0;for(const [d,pd]of Object.entries(result)){mean+=+d*pd;if(+d>=o.wounds)kill+=pd}return{distribution:result,mean,kill};}
window.KTCompanionShootRulesV3={resolveAttack,dieParts};
})();
