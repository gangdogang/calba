// Receives an image shared to the installed app (Android share sheet) and parks it
// for the page to pick up. Nothing else is intercepted or cached, so the app
// itself always loads fresh from the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'POST' || !url.pathname.endsWith('/share')) return;
  e.respondWith((async () => {
    try {
      const file = (await e.request.formData()).get('image');
      if (file) {
        const cache = await caches.open('shiftcal-shared');
        await cache.put('shared-image', new Response(file, { headers: { 'content-type': file.type || 'image/png' } }));
      }
    } catch (_) { /* open the app anyway */ }
    return Response.redirect('./?shared=1', 303);
  })());
});
