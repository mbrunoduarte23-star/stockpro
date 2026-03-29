const CACHE_NAME = 'stockpro-v2.1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - network first for API, cache first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API calls: always go to network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({}), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // Static assets: network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
