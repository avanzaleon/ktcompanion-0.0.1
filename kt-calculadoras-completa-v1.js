/* KT Companion - Calculadoras independientes v1
 * Motor independiente de Matriz/Campo táctico/Guardados/PDF.
 * Interfaz propia; no carga ni referencia aplicaciones externas.
 * Esta primera base expone el motor de probabilidad y deja el módulo aislado.
 */
(function(){'use strict';
const NS='ktcCalc';
function bin(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r}
function distAttack(o){
 const n=Math.max(0,o.attacks|0), target=Math.max(2,Math.min(6,o.skill|0));
 let cp=o.lethal?Math.max(1/6,(7-o.lethal)/6):1/6;
 let np=Math.max(0,(7-target)/6-cp), mp=Math.max(0,1-cp-np);
 let out={};
 for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){
  let f=n-c-m,p=bin(n,c)*bin(n-c,m)*Math.pow(cp,c)*Math.pow(np,m)*Math.pow(mp,f); if(!p)continue;
  c=Math.min(n,c+(o.autoCrits||0));m=Math.min(n-c,m+(o.autoNormals||0));
  if(o.normalsToCrits){let x=Math.min(m,o.normalsToCrits);m-=x;c+=x}
  if(o.failsToNormals){let x=Math.min(f,o.failsToNormals);m+=x;f-=x}
  if(o.rending&&c>0&&m>0){c++;m--}
  const dmg=c*(o.critDamage||0)+m*(o.normalDamage||0)+c*(o.devastating||0);
  out[dmg]=(out[dmg]||0)+p;
 }
 return out
}
function applyDefence(raw,o){
 let out={};Object.entries(raw).forEach(([d,p])=>{d=+d;if(!d){out[0]=(out[0]||0)+p;return}
  const dice=Math.max(0,o.defenceDice|0), sv=Math.max(2,Math.min(6,o.save|0));
  for(let s=0;s<=dice;s++){
   const q=bin(dice,s)*Math.pow((7-sv)/6,s)*Math.pow(1-(7-sv)/6,dice-s);
   let blocked=Math.min(d,s+(o.cover||0)); if(o.piercing)blocked=Math.max(0,blocked-o.piercing);
   let dealt=Math.max(0,d-blocked);out[dealt]=(out[dealt]||0)+p*q;
  }
 });return out
}
function repeat(dist,r){let cur={0:1};for(let i=0;i<r;i++){let nx={};for(const[a,pa]of Object.entries(cur))for(const[b,pb]of Object.entries(dist)){const k=+a+ +b;nx[k]=(nx[k]||0)+pa*pb}cur=nx}return cur}
function shoot(o){let raw=distAttack(o),def=applyDefence(raw,o),r=repeat(def,Math.max(1,o.rounds||1)),mean=0,kill=0;for(const[d,p]of Object.entries(r)){mean+=+d*p;if(+d>=o.wounds)kill+=p}return{distribution:r,mean,kill}}
function fight(o){
 // Independent expected-value baseline; structured so exact strike/parry engine can be extended without touching UI.
 const hitA=(7-o.aSkill)/6,hitB=(7-o.bSkill)/6;
 const da=o.aAttacks*hitA*o.aDamage,db=o.bAttacks*hitB*o.bDamage;
 return{aDamage:da,bDamage:db,aKill:Math.min(1,da/Math.max(1,o.bWounds)),bKill:Math.min(1,db/Math.max(1,o.aWounds))}
}
window[NS]={shoot,fight};
})();
