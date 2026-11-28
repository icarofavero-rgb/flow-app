// Service worker: deixa o site funcionando offline depois do primeiro acesso.
// Modelo: o build (vite.config.ts) troca __ASSETS__ pela lista de arquivos gerados
// e __VERSION__ por um código que muda a cada build (o cache antigo é descartado).
const CACHE = 'flow-0d716472fe';
const ASSETS = ["./","./icon.svg","./icons/icon-192.png","./icons/icon-512.png","./manifest.webmanifest"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (pega atualizações), cache como reserva offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
