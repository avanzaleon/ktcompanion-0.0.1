/* KT Companion — Campo táctico visible + iframe autoaltura */
(function(){'use strict';
const frame=document.getElementById('game');
if(!frame)return;
let lastHeight=0,raf=0;
function fix(){
  const d=frame.contentDocument;
  if(!d)return;
  const field=d.getElementById('ktField');
  const tabs=d.getElementById('turntabs');
  if(field&&tabs){
    const host=tabs.parentElement;
    const firstCard=host?.querySelector(':scope > .card');
    if(firstCard && field.parentElement===host) host.insertBefore(field,firstCard);
    else if(host && field.parentElement!==host) host.insertBefore(field,firstCard||null);
    field.style.display='block';
    field.style.visibility='visible';
  }
  const h=Math.max(850,d.documentElement.scrollHeight,d.body?.scrollHeight||0)+24;
  if(Math.abs(h-lastHeight)>4){lastHeight=h;frame.style.height=h+'px';}
}
function boot(){
  const d=frame.contentDocument;
  if(!d)return;
  const run=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(fix)};
  run();
  new MutationObserver(run).observe(d.body,{childList:true,subtree:true,attributes:true});
  setInterval(run,700);
}
frame.addEventListener('load',()=>setTimeout(boot,100));
if(frame.contentDocument?.readyState==='complete')setTimeout(boot,100);
})();