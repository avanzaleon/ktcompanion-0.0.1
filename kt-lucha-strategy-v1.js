/* KT Companion · Lucha · capa estratégica de repeticiones v1
   Evalúa qué resultado conviene repetir según el perfil del arma y el estado del rival.
   El motor secuencial sigue siendo el responsable de Golpear/Bloquear. */
(function(){'use strict';
function dist(o){const h=Math.max(2,Math.min(6,o.hit||4)),l=o.lethal?Math.max(2,Math.min(6,o.lethalThreshold||5)):99;let C=0,N=0,F=0;for(let d=1;d<=6;d++){const c=(d===6||d>=l)?'C':d>=h?'N':'F';if(c==='C')C++;else if(c==='N')N++;else F++}return{C:C/6,N:N/6,F:F/6}}
function value(o,opp){const d=dist(o),nd=o.normalDamage||0,cd=o.critDamage||0;const critWeight=(cd||nd)+((o.shock?1:0)+(o.rending?1:0)+(o.punishing?0.5:0))*(opp?.wounds<6?1.5:1);return d.C*critWeight+d.N*nd+d.F*0}
function recommend(o,opp){const d=dist(o);let best={kind:'ninguno',gain:0};const score=(cat)=>{const p=d[cat],q=1/6;const rC=d.C,rN=d.N,rF=d.F;let C=rC,N=rN,F=rF;C-=cat==='C'?q:0;N-=cat==='N'?q:0;F-=cat==='F'?q:0;C+=q*rC;N+=q*rN;F+=q*rF;return(C*rC+N*rN+F*0)-(rC*rC+rN*rN)};
 if(o.balanced){for(const c of ['F','N','C'])if(d[c]>0){const g=score(c);if(g>best.gain)best={kind:'Balanced',reroll:c,gain:g}}}
 if(o.relentless){for(const c of ['F','N','C'])if(d[c]>0){const g=score(c)*Math.max(1,Math.round(o.attacks||1));if(g>best.gain)best={kind:'Relentless',reroll:c,gain:g}}}
 if(o.ceaseless){const c=(+o.ceaselessResult>=2&&+o.ceaselessResult<=(o.lethal?o.lethalThreshold-1:5)&&+o.ceaselessResult<6)?'N':((+o.ceaselessResult===6||(+o.lethal&&+o.ceaselessResult>=o.lethalThreshold))?'C':'F');best={kind:'Ceaseless',reroll:c,gain:Math.max(best.gain,0)}}
 return best.gain>0||best.kind==='Ceaseless'?best:{kind:'no repetir',reroll:'ninguno',gain:0}}
window.KTLuchaStrategy={recommend,dist};})();
