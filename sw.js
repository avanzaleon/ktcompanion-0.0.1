const CACHE="kt-companion-v17-fix";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./blades.js","./deathwatch.js","./wolfscouts.js","./fight.js"];
const PATCH=`<script>
(function(){
  function patchArmyData(){
    if(!window.ARMIES_DATA) return;
    if(window.AOD_OPS && !window.ARMIES_DATA["Angels of Death"]){
      window.ARMIES_DATA["Angels of Death"]={
        leaderMax:1,
        otherMax:5,
        total:6,
        ops:window.AOD_OPS,
        strategy:[],
        firefight:[],
        faction:[]
      };
    }
  }
  patchArmyData();
  setTimeout(patchArmyData,50);
  setTimeout(patchArmyData,250);
})();
</script>`;
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(async r=>{const text=await r.text();const injected=text.replace(/<\/body>/i,'<script src="./blades.js?v=10"></script><script src="./deathwatch.js?v=10"></script><script src="./wolfscouts.js?v=10"></script><script src="./fight.js?v=10"></script>'+PATCH+'</body>');return new Response(injected,{status:r.status,statusText:r.statusText,headers:r.headers});}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));}else{e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));}});