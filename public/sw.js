// Increment CACHE_NAME (e.g. v2, v3) whenever cached static assets change
// so the new service worker activates and users receive updated files.
const CACHE_NAME = 'garden-manager-v1';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/css/style.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json',
  '/offline.html'
];

// Pre-cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Clean up old cache versions on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache-first strategy for static assets on this origin
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/css/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json')
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first strategy for navigation (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then(cached => cached || caches.match('/offline.html'))
        )
    );
  }
});
