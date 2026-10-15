const CACHE='gym-app-v2';
const FILES=['./','./index.html','./styles.css','./src/app.js','./src/plan.js','./src/dates.js','./src/storage.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
const urls=FILES.map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(urls)))});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('gym-app-')&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})())});
self.addEventListener('message',event=>{
 if(event.data!=='CHECK_READY')return;
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);const complete=(await Promise.all(urls.map(url=>cache.match(url)))).every(Boolean);if(complete)event.source?.postMessage('READY')})());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||!urls.includes(event.request.url))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);return await cache.match(event.request)||fetch(event.request)})());
});
