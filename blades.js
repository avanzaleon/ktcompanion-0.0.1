// Kill Team profile data for KT Companion.
// Blades of Khaine and Canoptek Circle profiles verified against KTDash references.
(function(){
  const bok=[
    ['Dire Avenger Exarch',9,'7"','3+',[['Shuriken Catapult',4,3,3,4,'Rnd'],['Shuriken Pistol',4,3,3,4,'Rng 8" · Rnd'],['Twin Shuriken Catapult',4,3,3,4,'Ceaseless · Rnd'],['Diresword',5,3,4,5,'Lethal 5+ · Rnd'],['Fists',4,3,2,4,''],['Gun Butts',3,4,2,3,''],['Power Weapon',5,3,4,6,'Lethal 5+']]],
    ['Howling Banshee Exarch',9,'7"','3+',[['Shuriken Pistol',4,3,3,4,'Rng 8" · Rnd'],['Triskele — Shoot',4,3,2,3,'Rng 8" · Torrent 2" · Rnd'],['Executioner',5,3,3,7,'Lethal 5+'],['Mirrorswords',5,3,4,6,'Lethal 5+ · Ceaseless'],['Power Weapon',5,3,4,6,'Lethal 5+'],['Triskele — Fight',5,3,4,5,'Rnd']]],
    ['Striking Scorpion Exarch',9,'7"','3+',[['Shuriken Pistol',4,3,3,4,'Rng 8" · Rnd'],['Twin Shuriken Pistols',4,4,3,4,'Rng 8" · Ceaseless · Rnd'],['Biting Blade',5,3,5,6,'Rnd'],['Twin Chainswords',5,3,4,5,'Ceaseless · Rnd'],["Scorpion's Claw and Chainsword",5,3,4,6,'Brutal · Lethal 5+']]],
    ['Dire Avenger Warrior',8,'7"','4+',[['Shuriken Catapult',4,3,3,4,'Rnd'],['Fists',4,3,2,4,'']]],
    ['Howling Banshee Warrior',8,'7"','4+',[['Shuriken Pistol',4,3,3,4,'Rng 8" · Rnd'],['Power Weapon',4,3,4,6,'Lethal 5+']]],
    ['Striking Scorpion Warrior',8,'7"','3+',[['Shuriken Pistol',4,3,3,4,'Rng 8" · Rnd'],['Chainsword',4,3,4,5,'Rnd']]]
  ];
  const can=[
    ['Canoptek Geomancer',14,'6"','3+',[['Tremorglaive — Part Matter',4,3,4,5,'Prc1 · PrcCrit2'],['Tremorglaive — Quake',5,3,1,2,'Blast 2" · Seek Light · Stun'],['Tremorglaive — Melee',4,4,4,5,'Sev · Shock · Stun']]],
    ['Canoptek Macrocyte Accelerator',7,'7"','4+',[['Spark',4,4,2,3,'Rng 4" · Prc1'],['Claws & Spark',3,4,3,4,'Lethal 5+ · Stun']]],
    ['Canoptek Macrocyte Reanimator',7,'7"','4+',[['Atomiser Beam',4,4,3,4,'Rng 6" · Lethal 5+'],['Claws & Tail',4,4,3,4,'']]],
    ['Canoptek Macrocyte Warrior — Gauss',7,'7"','4+',[['Gauss Scalpel',4,4,2,3,'Prc1'],['Claws & Tail',3,4,3,4,'']]],
    ['Canoptek Macrocyte Warrior — Tesla',7,'7"','4+',[['Tesla Caster — Focused',4,4,2,3,''],['Tesla Caster — Living Lightning',4,4,2,3,'Blast 2"'],['Claws & Tail',3,4,3,4,'']]],
    ['Canoptek Tomb Crawler — Twin Gauss Reapers',18,'5"','3+',[['Twin Gauss Reapers — Focused',5,4,4,5,'Prc1 · Sev'],['Twin Gauss Reapers — Sweeping',4,4,4,5,'Prc1 · Sev · Torrent 1"'],['Claws',4,4,4,4,'']]],
    ['Canoptek Tomb Crawler — Transdimensional Isolator',18,'5"','3+',[['Transdimensional Isolator',5,4,5,6,'Dimensional Banishment'],['Claws',4,4,4,4,'']]]
  ];
  teams.bok=bok; teams.can=can;
  const army=$('army');
  function addArmy(value,label){if(army&&!Array.from(army.options).some(o=>o.value===value)){const o=document.createElement('option');o.value=value;o.textContent=label;army.appendChild(o);}}
  addArmy('bok','Blades of Khaine'); addArmy('can','Canoptek Circle');
  function current(){return teams[$('army').value]||teams.aod}
  window.renderOps=function(){$('op').innerHTML=current().map((o,i)=>`<option value="${i}">${o[0]}</option>`).join('');window.renderOp();};
  window.renderOp=function(){const o=current()[+$('op').value];$('opcard').innerHTML=`<h2>${o[0]}</h2><div class="stats"><div class="stat"><small>HERIDAS</small><b>${o[1]}</b></div><div class="stat"><small>MOVIMIENTO</small><b>${o[2]}</b></div><div class="stat"><small>SALVACIÓN</small><b>${o[3]}</b></div><div class="stat"><small>ARMAS</small><b>${o[4].length}</b></div></div><div class="actions"><button class="primary" onclick="useDefender()">🛡️ Usar como defensor</button><button onclick="loadDefenderDice()">🎲 Simular como defensor</button></div><h3>Armas</h3>`+o[4].map((w,i)=>`<div class="weapon"><div class="weaponline"><b>${w[0]}</b><span class="tag">${w[1]} ataques · ${w[2]}+ · ${w[3]}/${w[4]}</span></div><div class="tag">${w[5]||''}</div><div class="actions"><button class="primary" onclick="useAttacker(${i})">⚔️ Usar como atacante</button><button onclick="loadWeaponDice(${i})">🎲 Simular ataque</button></div></div>`).join('');};
  window.useAttacker=function(i){const w=current()[+$('op').value][4][i];$('a').value=w[1];$('hit').value=w[2];$('dmg').value=w[3];$('cdmg').value=w[4];go('calc');calc()};
  window.useDefender=function(){const o=current()[+$('op').value];$('def').value=3;$('save').value=parseInt(o[3]);$('hp').value=o[1];$('pierce').value=0;go('calc');calc()};
  window.loadWeaponDice=function(i){const w=current()[+$('op').value][4][i];$('dtype').value='attack';$('dn').value=w[1];$('ds').value=w[2];$('dc').value='1';go('dice')};
  window.loadDefenderDice=function(){const o=current()[+$('op').value];$('dtype').value='defense';$('dn').value=3;$('ds').value=parseInt(o[3]);$('dc').value='1';go('dice')};
  renderOps();
})();

// Weapon type UI is included here so it works even without the service worker.
(function(){
  const css=document.createElement('style');css.textContent='.kt-w-melee{border-left:4px solid #c96b45!important;background:linear-gradient(90deg,#241815,#14171c)!important}.kt-w-ranged{border-left:4px solid #6f9bd6!important;background:linear-gradient(90deg,#151d29,#14171c)!important}.kt-w-type{display:inline-flex;align-items:center;gap:6px;margin:7px 0 2px;padding:4px 9px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.6px}.kt-w-melee .kt-w-type{background:#3a211b;color:#ffb08e}.kt-w-ranged .kt-w-type{background:#1c2b40;color:#a9c8f2}.kt-w-icon{width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:5px}.kt-w-icon svg{width:100%;height:100%}';document.head.appendChild(css);
  const sword='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 8l21 21M34 34l21 21M55 8L34 29M30 34L9 55" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg>';
  const sight='<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="32" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 4v15M32 45v15M4 32h15M45 32h15" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>';
  function isMelee(w){const n=(w[0]||'').toLowerCase();if(/pistol|rifle|bolter|carbine|gun|launcher|grenade|cannon|incinerator|melta|sniper|flamer|shotgun|plasma|caster|reaper|gauss|tesla|shuriken|spinner|deathspinner|webber|spray|sprayer|beam/.test(n))return false;return /blade|sword|fist|hammer|maul|claw|fang|knife|stave|weapon|chainsword|combat|shield|staff|axe|spear|talon|gauntlet|scythe|klaw|glaive|flail|whip|choppa|sickle|mace|hook|butt|melee|mirrorswords|executioner/.test(n);}
  function decorate(){const armyEl=$('army'),opEl=$('op'),card=$('opcard');if(!armyEl||!opEl||!card||!window.teams)return;const list=window.teams[armyEl.value];const op=list&&list[+opEl.value];if(!op)return;card.querySelectorAll('.weapon').forEach((el,i)=>{const w=op[4][i];if(!w)return;const m=isMelee(w);el.classList.remove('kt-w-melee','kt-w-ranged');el.classList.add(m?'kt-w-melee':'kt-w-ranged');let line=el.querySelector('.weaponline'),title=line&&line.querySelector('b');if(title&&!title.dataset.ktTyped){const label=title.textContent.trim();title.dataset.ktTyped='1';title.innerHTML=`<span class="kt-w-icon">${m?sword:sight}</span>${label}`;}if(line&&!el.querySelector('.kt-w-type')){const t=document.createElement('div');t.className='kt-w-type';t.innerHTML=`<span class="kt-w-icon">${m?sword:sight}</span>${m?'CUERPO A CUERPO':'A DISTANCIA'}`;line.insertAdjacentElement('afterend',t);}if(m){const box=el.querySelector('.actions');if(box&&!box.querySelector('.kt-fight-a')){const b=document.createElement('button');b.className='kt-fight-a';b.textContent='⚔️ Añadir a lucha';b.onclick=()=>window.fightSetSide?window.fightSetSide('a',op[0],w):window.setFightSide&&window.setFightSide('a',op[0],w);box.appendChild(b);}if(box&&!box.querySelector('.kt-fight-d')){const b=document.createElement('button');b.className='kt-fight-d';b.textContent='🛡️ Añadir como defensor';b.onclick=()=>window.fightSetSide?window.fightSetSide('d',op[0],w):window.setFightSide&&window.setFightSide('d',op[0],w);box.appendChild(b);}}});}
  let last='';function tick(){const key=($('army')?.value||'')+'|'+($('op')?.value||'');if(key!==last){last=key;setTimeout(decorate,0);}else decorate();}
  setInterval(tick,300);setTimeout(decorate,100);
})();