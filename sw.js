/* Service worker da Nova Brawl
   - Necessário para o site poder ser instalado como app (PWA).
   - Rede primeiro: o usuário sempre recebe a versão mais nova do site.
     Só se estiver sem internet é que usa a última cópia guardada.
   - Não mexe em vídeo, música, Firebase nem em nada de outro domínio. */
const CACHE = 'nova-brawl-shell-v1';
const SHELL_KEY = self.registration.scope;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Já guarda uma cópia da página para o caso de abrir sem internet
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.add(new Request(SHELL_KEY, { cache: 'reload' })))
      .catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(SHELL_KEY, copy));
        }
        return res;
      })
      .catch(() => caches.match(SHELL_KEY).then((cached) => cached || Response.error()))
  );
});
