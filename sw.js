// sw.js - very simple offline cache for the prompt page

const CACHE_NAME = 'pbiss-prompt-v1';
const OFFLINE_URL = '/'; // the prompt page itself

const urlsToCache = [
  OFFLINE_URL,
  // You can add more static assets here if you have them:
  // '/style.css',
  // '/logo.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests from same origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit — return it
        if (response) return response;

        // Try network
        return fetch(event.request).catch(() => {
          // If network fails → return the cached prompt page
          return caches.match(OFFLINE_URL);
        });
      })
  );
});
