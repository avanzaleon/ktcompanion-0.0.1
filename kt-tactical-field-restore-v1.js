/* KT Companion — restauración robusta del campo táctico en T1-T4 */
(function(){
  const frame=()=>document.getElementById('game');
  function inside(){
    const f=frame(); if(!f) return null;
    const d=f.contentDocument,w=f.contentWindow;
    if(!d||!w) return null;
    return {f,d,w};
  }
  function refresh(){
    const x=inside(); if(!x) return;
    const {d,w}=x;
    const s4=d.getElementById('s4');
    const tabs=d.getElementById('turntabs');
    if(!s4||!tabs||!s4.classList.contains('active')) return;
    try{ if(typeof w.ktTacReady==='function') w.ktTacReady(); }catch(e){}
  }
  function install(){
    const x=inside(); if(!x) return;
    const {f,d,w}=x;
    if(d.__ktFieldRestoreInstalled) return;
    d.__ktFieldRestoreInstalled=true;
    const fire=()=>{setTimeout(refresh,0);setTimeout(refresh,100);setTimeout(refresh,350);setTimeout(refresh,800)};
    d.addEventListener('click',e=>{
      const b=e.target.closest('#turntabs .turntab, #s4 .actions button, #s4 .side');
      if(b) fire();
    },true);
    const s4=d.getElementById('s4');
    if(s4){
      const mo=new MutationObserver(()=>{ if(s4.classList.contains('active')) fire(); });
      mo.observe(s4,{attributes:true,childList:true,subtree:true});
    }
    fire();
  }
  const f=frame();
  if(f) f.addEventListener('load',()=>setTimeout(install,120));
  [100,500,1200,2200].forEach(ms=>setTimeout(install,ms));
})();
