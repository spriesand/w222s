/**
 * V12 Pursuit — Service Worker v2
 * Network-first for everything except offline fallback.
 * Never intercepts Supabase or CDN requests.
 */

const CACHE_NAME = 'v12-pursuit-v2';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // NEVER intercept: Supabase, CDN, external APIs
  if (url.indexOf('supabase.co') > -1 ||
      url.indexOf('jsdelivr') > -1 ||
      url.indexOf('googleapis') > -1 ||
      url.indexOf('fonts.') > -1) {
    return; // pass through to network, no SW involvement
  }

  // For share target — just pass through to network
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(function() {
      return new Response('<h2>Offline</h2>', {headers:{'Content-Type':'text/html'}});
    }));
    return;
  }
  // All other requests: network only
});

self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
