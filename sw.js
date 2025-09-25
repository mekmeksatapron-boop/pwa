
const CACHE = 'pwa-media-v1';
const ASSETS = [
  '/', '/index.html', '/styles.css', '/app.js',
  '/sets.html','/sets.js','/set.html','/set.js',
  '/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // Cache-first for same-origin GET
  if(e.request.method === 'GET' && url.origin === location.origin){
    e.respondWith((async ()=>{
      const cached = await caches.match(e.request);
      if(cached) return cached;
      try{
        const res = await fetch(e.request);
        const c = await caches.open(CACHE);
        c.put(e.request, res.clone());
        return res;
      }catch(err){
        return cached || Response.error();
      }
    })());
  }
});
