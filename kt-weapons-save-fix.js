/* KT Companion — robust weapon capture on save
   Keeps the existing save/PDF system intact and reads both the live DOM
   and the weapon persistence state installed by index-guardado-v2.html. */
(function(){
  const frame=()=>document.getElementById('game');
  const doc=()=>frame()?.contentDocument||null;
  const win=()=>frame()?.contentWindow||null;
  const arr=x=>Array.isArray(x)?x:[];
  const selectedChoices=id=>{const d=doc();return [...(d?.querySelectorAll('#'+id+' input:checked')||[])].map(x=>x.parentElement?.querySelector('span')?.textContent.trim()).filter(Boolean)};
  const getBasic=()=>{const d=doc();return{friend:d?.getElementById('friend')?.value||'',enemy:d?.getElementById('enemy')?.value||'',map:d?.querySelector('.mapchoice.selected')?.textContent.trim()||'',operation:(d?.querySelector('.opchoice.selected')?.textContent||'').replace(/^\d+\.\s*/,'').trim()}};
  function switchSide(side){try{return typeof win()?.switchSide==='function'?win().switchSide(side):null}catch(e){console.warn(e);return null}}
  function switchTurnSide(side){try{return typeof win()?.switchTurnSide==='function'?win().switchTurnSide(side):null}catch(e){console.warn(e);return null}}
  function switchTurn(t){try{return typeof win()?.switchTurn==='function'?win().switchTurn(t):null}catch(e){console.warn(e);return null}}
  function collectCounts(side){switchSide(side);const d=doc(),out={};d?.querySelectorAll('#ops .op.has').forEach(x=>{const name=x.querySelector('.opname')?.childNodes[0]?.textContent.trim();const qty=Number(x.querySelector('.qty b')?.textContent||0);if(name&&qty)out[name]=qty});return out}
  function collectWeapons(side){
    switchSide(side);
    const d=doc(),w=win(),persist=w?.__ktWeaponState?.[side]||{};
    const out=[];
    d?.querySelectorAll('#ops .op.has .copy').forEach(copy=>{
      const name=(copy.querySelector('b')?.textContent||'').trim();
      const weapons=[];
      copy.querySelectorAll('.weapon').forEach(row=>{
        const weapon=(row.querySelector('.wname')?.textContent||'').trim();
        if(!weapon)return;
        const key=side+'|'+name+'|'+weapon;
        const button=row.querySelector('button');
        if(button?.classList.contains('on')||persist[key]===true)weapons.push(weapon);
      });
      if(weapons.length)out.push({name,weapons});
    });
    /* Fallback: if the DOM has just been rebuilt, recover entries directly
       from the persistence map. */
    if(!out.length){
      const grouped={};
      Object.entries(persist).forEach(([key,on])=>{
        if(!on)return;
        const prefix=side+'|';
        if(!key.startsWith(prefix))return;
        const rest=key.slice(prefix.length),p=rest.indexOf('|');
        if(p<1)return;
        const name=rest.slice(0,p),weapon=rest.slice(p+1);
        (grouped[name]??=[]).push(weapon);
      });
      Object.entries(grouped).forEach(([name,weapons])=>out.push({name,weapons}));
    }
    return out;
  }
  function collectChapter(side){switchTurnSide(side);const d=doc();return[...(d?.querySelectorAll('#chapter input:checked')||[])].map(x=>x.parentElement?.querySelector('span')?.textContent.trim()).filter(Boolean)}
  function collectTurns(side){
    switchTurnSide(side);const out={};
    for(let t=1;t<=4;t++){
      switchTurn(t);
      out[t]={strategy:selectedChoices('strategy'),firefight:selectedChoices('firefight'),faction:selectedChoices('faction'),universal:selectedChoices('universal')};
    }
    return out;
  }
  window.saveGame=function(){
    try{
      const d=doc();
      if(!d){alert('La matriz todavía está cargando. Espera un segundo e inténtalo de nuevo.');return}
      const b=getBasic();
      if(!b.friend||!b.map||!b.operation){alert('Selecciona ejército amigo, mapa y operación antes de guardar.');return}
      /* Make sure the persistence layer has applied the last weapon click
         before collecting anything. */
      win()?.__ktRestoreWeapons?.();
      const s={id:Date.now(),date:new Date().toLocaleString('es-ES'),friend:b.friend,enemy:b.enemy,map:b.map,operation:b.operation,counts:{friend:{},enemy:{}},weapons:{friend:[],enemy:[]},chapter:{friend:[],enemy:[]},turns:{friend:{},enemy:{}}};
      s.counts.friend=collectCounts('friend');
      s.weapons.friend=collectWeapons('friend');
      s.chapter.friend=collectChapter('friend');
      s.turns.friend=collectTurns('friend');
      if(b.enemy){
        s.counts.enemy=collectCounts('enemy');
        s.weapons.enemy=collectWeapons('enemy');
        s.chapter.enemy=collectChapter('enemy');
        s.turns.enemy=collectTurns('enemy');
      }
      switchSide('friend');switchTurnSide('friend');switchTurn(1);win()?.__ktRestoreWeapons?.();
      const key='kt_companion_matrices_pdf2';
      let a=[];try{a=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){a=[]}
      a.unshift(s);localStorage.setItem(key,JSON.stringify(a));
      alert('Matriz guardada correctamente.');
      window.showSaved?.();
    }catch(e){console.error(e);alert('No se pudo guardar la matriz: '+(e?.message||e))}
  };
})();
