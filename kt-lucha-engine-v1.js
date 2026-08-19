/* KT Companion · Calculadora de Lucha v1 — módulo independiente */
(function(){'use strict';
function bin(n,k){if(k<0||k>n)return 0;let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return r}
function rolls(n,hit){const h=Math.max(2,Math.min(6,hit)),pc=1/6,pn=Math.max(0,(7-h)/6-pc),pf=1-pc-pn,out=[];for(let c=0;c<=n;c++)for(let m=0;m<=n-c;m++){const f=n-c-m,p=bin(n,c)*bin(n-c,m)*pc**c*pn**m*pf**f;if(p)out.push({c,m,f,p})}return out}
function choose(me,opp,side,o){if(me.c){if(opp.c)return {block:'c'};return {strike:1,crit:1}}if(me.m){if(opp.c>=2)return {block:'c'};if(opp.m&&o[side+'BlockNormal'])return {block:'m'};return {strike:1,crit:0}}return null}
function remove(x,k){if(k==='c'&&x.c)x.c--;else if(k==='m'&&x.m)x.m--;else if(x.c)x.c--}
function resolve(a,d,o){let A={c:a.c,m:a.m},D={c:d.c,m:d.m},aw=o.aW||10,dw=o.dW||10,ad=0,dd=0,first='A',safety=100;while(safety--&&(A.c+A.m+D.c+D.m)){let side=first,me=side==='A'?A:D,opp=side==='A'?D:A,r=choose(me,opp,side,o);if(!r){first=side==='A'?'D':'A';continue}if(r.strike){const dmg=r.crit?(side==='A'?o.aCD:o.dCD):(side==='A'?o.aND:o.dND);if(side==='A'){ad+=dmg;dw-=dmg}else{dd+=dmg;aw-=dmg}}else remove(opp,r.block);if(dw<=0||aw<=0)break;first=side==='A'?'D':'A'}return{ad,dd,killA:dw<=0?1:0,killD:aw<=0?1:0}}
function fight(o={}){const A=rolls(o.aAtk||4,o.aHit||3),D=rolls(o.dAtk||4,o.dHit||3);let ad=dd=ka=kd=0,total=0;for(const a of A)for(const d of D){const q=a.p*d.p,r=resolve(a,d,o);total+=q;ad+=q*r.ad;dd+=q*r.dd;ka+=q*r.killA;kd+=q*r.killD}return{attackerDamage:ad/total,defenderDamage:dd/total,attackerKills:ka/total,defenderKills:kd/total}}
window.KTLuchaEngine={fight,rolls};})();
