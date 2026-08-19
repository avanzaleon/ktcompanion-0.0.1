/* KT Companion — integración robusta del campo táctico v3 */
(function(){
  'use strict';
  const frame=()=>document.getElementById('game');
  let timer=0, installed=false;
  function resize(){
    const f=frame(); if(!f) return;
    try{
      const d=f.contentDocument;
      if(!d||!d.body)return;
      const h=Math.max(d.body.scrollHeight,d.documentElement.scrollHeight,900);
      f.style.height=h+'px';
      f.style.minHeight='0';
    }catch(e){}
  }
  function placeAndShow(){
    const f=frame(); if(!f) return false;
    try{
      const d=f.contentDocument,w=f.contentWindow;
      if(!d||!w||!d.getElementById('s4')) return false;
      let mount=d.getElementById('ktFieldMount');
      const s4=d.getElementById('s4');
      if(!mount){
        mount=d.createElement('div');
        mount.id='ktFieldMount';
        mount.style.cssText='margin:14px 0 16px;display:block;min-height:20px;';
        s4.appendChild(mount);
      }
      const s4Visible=getComputedStyle(s4).display!=='none';
      if(s4Visible && typeof w.ktTacReady==='function'){
        w.ktTacReady();
        const field=d.getElementById('ktField');
        if(field && field.parentElement!==mount) mount.appendChild(field);
        if(field) field.style.display='block';
      }
      resize();
      return true;
    }catch(e){return false}
  }
  function install(){
    const f=frame(); if(!f)return;
    if(!installed){
      installed=true;
      try{
        const d=f.contentDocument;
        const mo=new MutationObserver(()=>{
          clearTimeout(timer);timer=setTimeout(placeAndShow,40);
        });
        mo.observe(d.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
      }catch(e){}
      f.addEventListener('load',()=>{installed=false;setTimeout(install,80)});
    }
    [0,100,300,700,1200,2000].forEach(ms=>setTimeout(placeAndShow,ms));
  }
  const f=frame();
  if(f) f.addEventListener('load',()=>setTimeout(install,50));
  install();
  setInterval(placeAndShow,1500);
})();
