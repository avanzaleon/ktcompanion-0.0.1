/* KT Companion — parche de integración del campo táctico */
(function(){
  const frame=()=>document.getElementById('game');
  function refresh(){
    const f=frame(); if(!f) return;
    try{
      const d=f.contentDocument,w=f.contentWindow;
      if(!d||!w) return;
      const s4=d.getElementById('s4');
      if(s4 && (s4.classList.contains('active') || getComputedStyle(s4).display!=='none')){
        if(typeof w.ktTacReady==='function') w.ktTacReady();
      }
    }catch(e){}
  }
  function install(){
    const f=frame(); if(!f) return;
    f.addEventListener('load',()=>setTimeout(refresh,100));
    setTimeout(refresh,150); setTimeout(refresh,500); setTimeout(refresh,1200);
    try{
      const d=f.contentDocument;
      d.addEventListener('click',e=>{
        const b=e.target.closest('#turntabs .turntab, #s4 .actions button');
        if(b){ setTimeout(refresh,80); setTimeout(refresh,300); }
      },true);
      const mo=new MutationObserver(()=>setTimeout(refresh,30));
      const s4=d.getElementById('s4'); if(s4) mo.observe(s4,{attributes:true,childList:true,subtree:true});
    }catch(e){}
  }
  const f=frame();
  if(f) f.addEventListener('load',install);
  install();
  setTimeout(install,500);setTimeout(install,1500);
})();
