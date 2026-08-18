/* KT Companion — captura fiable de armas */
(function(){
  const frame=()=>document.getElementById('game');
  const doc=()=>frame()?.contentDocument||null;
  const win=()=>frame()?.contentWindow||null;
  const selectedChoices=id=>{const d=doc();return [...(d?.querySelectorAll('#'+id+' input:checked')||[])].map(x=>x.parentElement?.querySelector('span')?.textContent.trim()).filter(Boolean)};
  const getBasic=()=>{const d=doc();return{friend:d?.getElementById('friend')?.value||'',enemy:d?.getElementById('enemy')?.value||'',map:d?.querySelector('.mapchoice.selected')?.textContent.trim()||'',operation:(d?.querySelector('.opchoice.selected')?.textContent||'').replace(/^\d+\.\s*/,'').trim()}};
  const switchSide=side=>{try{return typeof win()?.switchSide==='function'?win().switchSide(side):null}catch(e){return null}};
  const switchTurnSide=side=>{try{return typeof win()?.switchTurnSide==='function'?win().switchTurnSide(side):null}catch(e){return null}};
  const switchTurn=t=>{try{return typeof win()?.switchTurn==='function'?win().switchTurn(t):null}catch(e){return null}};
  function collectCounts(side){switchSide(side);const d=doc(),out={};d?.querySelectorAll('#ops .op.has').forEach(x=>{const name=x.querySelector('.opname')?.childNodes[0]?.textContent.trim();const qty=Number(x.querySelector('.qty b')?.textContent||0);if(name&&qty)out[name]=qty});return out}
  function collectWeapons(side){
    switchSide(side);
    const d=doc(),state=win()?.__ktWeaponState?.[side]||{},out=[];
    d?.querySelectorAll('#ops .op.has .copy').forEach(copy=>{
      const name=(copy.querySelector('b')?.textContent||'').trim(),weapons=[];
      copy.querySelectorAll('.weapon').forEach(row=>{
        const weapon=(row.querySelector('.wname')?.textContent||'').trim(),key=side+'|'+name+'|'+weapon,b=row.querySelector('button');
        if(b?.classList.contains('on')||state[key]===true)weapons.push(weapon);
      });
      if(weapons.length)out.push({name,weapons});
    });
    return out;
  }
  function collectChapter(side){switchTurnSide(side);const d=doc();return[...(d?.querySelectorAll('#chapter input:checked')||[])].map(x=>x.parentElement?.querySelector('span')?.textContent.trim()).filter(Boolean)}
  function collectTurns(side){switchTurnSide(side);const out={};for(let t=1;t<=4;t++){switchTurn(t);out[t]={strategy:selectedChoices('strategy'),firefight:selectedChoices('firefight'),faction:selectedChoices('faction'),universal:selectedChoices('universal')}}return out}
  window.saveGame=function(){
    try{
      const d=doc(),b=getBasic();
      if(!d)return alert('La matriz todavía está cargando.');
      if(!b.friend||!b.map||!b.operation)return alert('Selecciona ejército amigo, mapa y operación antes de guardar.');
      win()?.__ktSyncWeapons?.();
      const s={id:Date.now(),date:new Date().toLocaleString('es-ES'),friend:b.friend,enemy:b.enemy,map:b.map,operation:b.operation,counts:{friend:collectCounts('friend'),enemy:{}},weapons:{friend:collectWeapons('friend'),enemy:[]},chapter:{friend:collectChapter('friend'),enemy:[]},turns:{friend:collectTurns('friend'),enemy:{}}};
      if(b.enemy){s.counts.enemy=collectCounts('enemy');s.weapons.enemy=collectWeapons('enemy');s.chapter.enemy=collectChapter('enemy');s.turns.enemy=collectTurns('enemy')}
      switchSide('friend');switchTurnSide('friend');switchTurn(1);
      const key='kt_companion_matrices_pdf2';let a=[];try{a=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}a.unshift(s);localStorage.setItem(key,JSON.stringify(a));
      alert('Matriz guardada correctamente.');window.showSaved?.();
    }catch(e){console.error(e);alert('No se pudo guardar la matriz: '+(e?.message||e))}
  };
})();