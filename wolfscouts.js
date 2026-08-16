// Wolf Scouts profiles for KT Companion. Reference: https://ktdash.app/killteams/IMP-WS
(function(){
  const ws=[
    ['Pack Leader',13,'7"','3+',[['Plasma Pistol — Standard',4,3,3,5,'Rng 8" · Prc1'],['Plasma Pistol — Supercharge',4,3,4,5,'Rng 8" · Hot · Lethal 5+ · Prc1'],['Power Weapon',5,3,4,6,'Lethal 5+']]],
    ['Fangbearer',13,'7"','3+',[['Absolver Bolt Pistol',4,3,4,5,'Rng 9" · PrcCrit1'],['Combat Blade',5,3,4,5,'']]],
    ['Frosteye',13,'7"','3+',[['Instigator Bolt Carbine',4,3,3,4,'PrcCrit1 · Silent'],['Combat Blade',4,3,4,5,'']]],
    ['Gunner',13,'7"','3+',[['Plasma Gun — Standard',4,3,4,6,'Prc1'],['Plasma Gun — Supercharge',4,3,5,6,'Hot · Lethal 5+ · Prc1'],['Combat Blade',4,3,4,5,'']]],
    ['Hunter',13,'7"','3+',[['Plasma Pistol — Standard',4,3,3,5,'Rng 8" · Prc1'],['Plasma Pistol — Supercharge',4,3,4,5,'Rng 8" · Hot · Lethal 5+ · Prc1'],['Combat Blade',5,3,4,5,'']]],
    ['Rune Priest Skjald',13,'7"','3+',[['Bolt Pistol',4,3,3,4,'Rng 8"'],['Jaws of the World Wolf',5,3,3,5,'PSYCHIC · Blast 2" · Severe'],['Thunderclap',5,2,2,2,'PSYCHIC · Rng 6" · Saturate · Seek Light · Stun · Torrent 2"'],['Runic Stave',5,3,4,6,'PSYCHIC · Shock']]],
    ['Trapmaster',13,'7"','3+',[['Plasma Pistol — Standard',4,3,3,5,'Rng 8" · Prc1'],['Plasma Pistol — Supercharge',4,3,4,5,'Rng 8" · Hot · Lethal 5+ · Prc1'],['Combat Blade',5,3,4,5,'']]],
    ['Fenrisian Wolf',9,'8"','5+',[['Fangs',5,3,4,5,'Rending']]]
  ];
  teams.ws=ws;
  const army=$('army');
  if(army && !Array.from(army.options).some(o=>o.value==='ws')){ const o=document.createElement('option');o.value='ws';o.textContent='Wolf Scouts';army.appendChild(o); }
  function current(){return teams[$('army').value]||teams.aod}
  window.renderOps=function(){ $('op').innerHTML=current().map((o,i)=>`<option value="${i}">${o[0]}</option>`).join(''); window.renderOp(); };
  window.renderOp=function(){
    const o=current()[+$('op').value];
    $('opcard').innerHTML=`<h2>${o[0]}</h2><div class="stats"><div class="stat"><small>HERIDAS</small><b>${o[1]}</b></div><div class="stat"><small>MOVIMIENTO</small><b>${o[2]}</b></div><div class="stat"><small>SALVACIÓN</small><b>${o[3]}</b></div><div class="stat"><small>ARMAS</small><b>${o[4].length}</b></div></div><div class="actions"><button class="primary" onclick="useDefender()">🛡️ Usar como defensor</button><button onclick="loadDefenderDice()">🎲 Simular como defensor</button></div><h3>Armas</h3>`+o[4].map((w,i)=>`<div class="weapon"><div class="weaponline"><b>${w[0]}</b><span class="tag">${w[1]} ataques · ${w[2]}+ · ${w[3]}/${w[4]}</span></div><div class="tag">${w[5]||''}</div><div class="actions"><button class="primary" onclick="useAttacker(${i})">⚔️ Usar como atacante</button><button onclick="loadWeaponDice(${i})">🎲 Simular ataque</button></div></div>`).join('');
  };
  window.useAttacker=function(i){const w=current()[+$('op').value][4][i];$('a').value=w[1];$('hit').value=w[2];$('dmg').value=w[3];$('cdmg').value=w[4];go('calc');calc()};
  window.useDefender=function(){const o=current()[+$('op').value];$('def').value=3;$('save').value=parseInt(o[3]);$('hp').value=o[1];$('pierce').value=0;go('calc');calc()};
  window.loadWeaponDice=function(i){const w=current()[+$('op').value][4][i];$('dtype').value='attack';$('dn').value=w[1];$('ds').value=w[2];$('dc').value='1';go('dice')};
  window.loadDefenderDice=function(){const o=current()[+$('op').value];$('dtype').value='defense';$('dn').value=3;$('ds').value=parseInt(o[3]);$('dc').value='1';go('dice')};
  renderOps();
})();
