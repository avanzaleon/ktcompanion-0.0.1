/* KT Companion - motor independiente de disparo v2
 * Distribución exacta de dados. Sin dependencias externas.
 */
(function(){'use strict';
 const C=(n,k)=>{if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r};
 const dieDist=(bs)=>{let s=Math.max(2,Math.min(6,bs));let crit=1/6,norm=Math.max(0,(7-s)/6-crit),fail=Math.max(0,1-crit-norm);return{crit,norm,fail}};
 function base(n,p){const a=[];for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){let f=n-c-m,q=C(n,c)*C(n-c,m)*Math.pow(p.crit,c)*Math.pow(p.norm,m)*Math.pow(p.fail,f);if(q)a.push({c,m,f,q})}return a}
 function rerollBalanced(n,p,count){let out=[];for(const r of base(n,p)){let keep=r;let best={c:r.c,m:r.m,f:r.f,q:r.q};for(let rc=0;rc<=Math.min(count,r.f);rc++)for(let rm=0;rm<=Math.min(count-rc,r.f-rc);rm++){let rf=count-rc-rm;if(rf>r.f)continue;let bc=r.c+rc,bm=r.m+rm,bf=r.f-rf;let q=r.q*C(count,rc)*C(count-rc,rm)*Math.pow(p.crit,rc)*Math.pow(p.norm,rm)*Math.pow(p.fail,rf);if(q)out.push({c:bc,m:bm,f:bf,q})}}return out}
 function aggregate(a){const d={};for(const x of a){const k=x.c+'|'+x.m;d[k]=(d[k]||0)+x.q}return Object.entries(d).map(([k,q])=>{let [c,m]=k.split('|').map(Number);return{c,m,q}})}
 function attackDist(o){o=o||{};const n=Math.max(0,Math.floor(o.attacks||0)),p=dieDist(o.bs||4);let rolls=base(n,p);
  if(o.balanced) {let b=rerollBalanced(n,p,1);rolls=rolls.concat(b)}
  let agg=aggregate(rolls);const out=[];
  for(const x of agg){let c=x.c+(o.autoCrits||0),m=x.m+(o.autoNorms||0),f=x.f;
   let nm=Math.min(f,o.failsToNormals||0);m+=nm;f-=nm;let nc=Math.min(m,o.normalsToCrits||0);c+=nc;m-=nc;
   if(o.lethalCrits) c+=Math.min(f,o.lethalCrits);
   if(o.rending&&c>0&&m>0){c++;m--}
   out.push({crits:c,norms:m,fails:f,prob:x.q})
  }
  const total=out.reduce((s,x)=>s+x.prob,0)||1;out.forEach(x=>x.prob/=total);return out;
 }
 function resolve(o){const dist=attackDist(o),save=dieDist(o.save||4),def=Math.max(0,Math.floor(o.defenceDice||0)),cover=Math.max(0,Math.floor(o.cover||0)),pierce=Math.max(0,Math.floor(o.piercing||0)),normal=Math.max(0,o.normalDamage||0),crit=Math.max(0,o.critDamage||0),mortal=Math.max(0,o.mortal||0);let result={};
  for(const a of dist){for(let sc=0;sc<=def;sc++)for(let sn=0;sn<=def-sc;sn++){let sf=def-sc-sn,sp=C(def,sc)*C(def-sc,sn)*Math.pow(save.crit,sc)*Math.pow(save.norm,sn)*Math.pow(save.fail,sf);let blockedCrit=Math.max(0,sc-pierce),blockedNorm=Math.max(0,sn+cover-pierce);let dc=Math.max(0,a.crits-blockedCrit),dn=Math.max(0,a.norms-blockedNorm);let dmg=dc*(crit+mortal)+dn*normal;let k=dmg;result[k]=(result[k]||0)+a.prob*sp}}
  let mean=0,total=0;Object.entries(result).forEach(([d,p])=>{mean+=+d*p;total+=p});let hp=Math.max(1,o.wounds||1),kill=Object.entries(result).filter(([d])=>+d>=hp).reduce((s,[,p])=>s+p,0);return{distribution:result,mean,kill,total};
 }
 window.KTCompanionShootEngine={dieDist,attackDist,resolve};
})();
