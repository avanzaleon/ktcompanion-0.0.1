// Deathwatch profiles for KT Companion. Reference: https://ktdash.app/killteams/IMP-DW
(function(){
  const dw=[
    ['Watch Sergeant',15,'6"','3+',[['Plasma Pistol — Standard',4,3,3,5,'Rng 8" · Prc1'],['Plasma Pistol — Supercharge',4,3,4,5,'Rng 8" · Hot · Lethal 5+ · Prc1'],['Power Weapon',5,3,4,6,'Lethal 5+']]],
    ['Aegis',15,'6"','2+',[['Bolt Pistol',4,3,3,4,'Rng 8"'],['Power Maul & Storm Shield',5,3,4,6,'Shock · Shield']]],
    ['Blademaster',15,'6"','3+',[['Special Issue Bolt Pistol',4,3,3,4,'Rng 8" · Prc1'],['Xenophase Blade — Duel',5,3,4,6,'Brutal · Lethal 5+'],['Xenophase Blade — Phase Sweep',4,3,4,6,'Brutal · Lethal 5+']]],
    ['Bombard',18,'5"','3+',[['Bolt Pistol',4,3,3,4,'Rng 8"'],['Frag Cannon — Shell',4,3,5,7,'Prc1'],['Frag Cannon — Shrapnel',5,3,4,5,'Torrent 2"'],['Fists',4,3,3,4,'']]],
    ['Breacher',18,'5"','3+',[['Auxiliary Grenade Launcher — Frag',4,3,2,4,'Blast 2"'],['Auxiliary Grenade Launcher — Krak',4,3,4,5,'Prc1'],['Hellstorm Bolt Rifle',4,3,4,5,'Torrent 1"'],['Melta Bomb',4,3,5,3,'Rng 3" · Devastating 3 · Heavy(Reposition) · Limited 1 · Prc2'],['Fists',4,3,3,4,'']]],
    ['Demolisher',15,'6"','3+',[['Bolt Pistol',4,3,3,4,'Rng 8"'],['Heavy Thunder Hammer',5,4,6,7,'Shock · Stun · Brutal · Ceaseless when charging']]],
    ['Disruptor',13,'7"','3+',[['Marksman Bolt Carbine',4,3,3,4,'Lethal 5+'],['Fists',4,3,3,4,'']]],
    ['Gunner',15,'6"','3+',[['Bolt Pistol',4,3,3,4,'Rng 8"'],['Heavy Plasma Incinerator — Standard',5,3,4,6,'Prc1'],['Heavy Plasma Incinerator — Supercharge',5,3,5,6,'Hot · Lethal 5+ · Prc1'],['Fists',4,3,3,4,'']]],
    ['Headtaker',13,'7"','3+',[['Special Issue Bolt Pistol',4,3,3,4,'Rng 8" · Prc1'],['Combat Knives',5,3,4,5,'']]],
    ['Horde-Slayer',18,'5"','3+',[['Bolt Pistol',4,3,3,4,'Rng 8"'],['Infernus Heavy Bolter — Flame',5,2,3,3,'Rng 8" · Saturate · Torrent 2"'],['Infernus Heavy Bolter — Focused Bolt',5,3,4,5,'PrcCrit1'],['Infernus Heavy Bolter — Sweeping Bolt',4,3,4,5,'PrcCrit1 · Torrent 1"'],['Fists',4,3,3,4,'']]],
    ['Marksman',15,'6"','3+',[['Stalker Bolt Rifle — Mobile',4,3,3,4,'Mobile'],['Stalker Bolt Rifle — Heavy',4,2,3,5,'Heavy(Dash) · Lethal 5+ · PrcCrit1'],['Fists',4,3,3,4,'']]]
  ];
  teams.dw=dw;
  const army=$('army');
  if(army && !Array.from(army.options).some(o=>o.value==='dw')){const o=document.createElement('option');o.value='dw';o.textContent='Deathwatch';army.appendChild(o);}
  function current(){return teams[$('army').value]||teams.aod}
  window.renderOps=function(){$('op').innerHTML=current().map((o,i)=>`<option value="${i}">${o[0]}</option>`).join('');window.renderOp();};
  window.renderOp=function(){const o=current()[+$('op').value];$('opcard').innerHTML=`<h2>${o[0]}</h2><div class="stats"><div class="stat"><small>HERIDAS</small><b>${o[1]}</b></div><div class="stat"><small>MOVIMIENTO</small><b>${o[2]}</b></div><div class="stat"><small>SALVACIÓN</small><b>${o[3]}</b></div><div class="stat"><small>ARMAS</small><b>${o[4].length}</b></div></div><div class="actions"><button class="primary" onclick="useDefender()">🛡️ Usar como defensor</button><button onclick="loadDefenderDice()">🎲 Simular como defensor</button></div><h3>Armas</h3>`+o[4].map((w,i)=>`<div class="weapon"><div class="weaponline"><b>${w[0]}</b><span class="tag">${w[1]} ataques · ${w[2]}+ · ${w[3]}/${w[4]}</span></div><div class="tag">${w[5]||''}</div><div class="actions"><button class="primary" onclick="useAttacker(${i})">⚔️ Usar como atacante</button><button onclick="loadWeaponDice(${i})">🎲 Simular ataque</button></div></div>`).join('');};
  window.useAttacker=function(i){const w=current()[+$('op').value][4][i];$('a').value=w[1];$('hit').value=w[2];$('dmg').value=w[3];$('cdmg').value=w[4];go('calc');calc();};
  window.useDefender=function(){const o=current()[+$('op').value];$('def').value=3;$('save').value=parseInt(o[3]);$('hp').value=o[1];$('pierce').value=0;go('calc');calc();};
  window.loadWeaponDice=function(i){const w=current()[+$('op').value][4][i];$('dtype').value='attack';$('dn').value=w[1];$('ds').value=w[2];$('dc').value='1';go('dice');};
  window.loadDefenderDice=function(){const o=current()[+$('op').value];$('dtype').value='defense';$('dn').value=3;$('ds').value=parseInt(o[3]);$('dc').value='1';go('dice');};
  renderOps();
})();
