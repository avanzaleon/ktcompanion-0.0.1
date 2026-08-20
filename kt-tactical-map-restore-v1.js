/* KT Companion — restauración robusta del fondo del mapa */
(function(){
  const frame=()=>document.getElementById('game');
  function restore(){
    const f=frame(),D=f?.contentDocument,W=f?.contentWindow;
    if(!D||!W)return;
    const field=D.getElementById('ktField');
    if(!field)return;
    const img=field.querySelector('#ktuiimg');
    if(!img)return;
    const selected=D.querySelector('.mapchoice.selected')?.textContent.trim()||'Mapa de pruebas';
    const src=W.__ktMapImages?.[selected]||localStorage.getItem('kt_map_'+selected)||W.__ktMapImages?.['Mapa de pruebas'];
    if(src && (!img.src || img.src==='about:blank' || img.src.endsWith('#'))) img.src=src;
    if(!img.src || img.src==='about:blank'){
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1100"><rect width="1500" height="1100" fill="#3d3d39"/><text x="750" y="550" text-anchor="middle" fill="white" font-family="sans-serif" font-size="44">MAPA DE PRUEBAS</text></svg>');
    }
  }
  window.addEventListener('load',()=>setTimeout(restore,500));
  const f=frame();f?.addEventListener('load',()=>setTimeout(restore,700));
  setInterval(restore,1000);
})();
