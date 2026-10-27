/* Offline support: everything is precached. Own files are network-first so edits show up as soon as you are online;
   fonts are cache-first. */
const VERSION="cw-v2";
const CORE=["./","index.html","styles.css","app.js","illustrations.js","generator.js","data/wardrobe-data.json","manifest.webmanifest",
  "icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  const fonts=url.host==="fonts.googleapis.com"||url.host==="fonts.gstatic.com";
  if(url.origin!==location.origin&&!fonts)return;
  const networkFirst=!fonts;
  const fromCache=()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==="navigate"?caches.match("index.html"):undefined));
  const fetchAndStore=()=>fetch(req).then(res=>{
    if(res.ok||res.type==="opaque"){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}
    return res;
  });
  e.respondWith(networkFirst?fetchAndStore().catch(fromCache):fromCache().then(r=>r||fetchAndStore()));
});
