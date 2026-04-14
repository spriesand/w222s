/**
 * V12 Pursuit — Service Worker v3
 * Minimal — only exists to support share target.
 * Never caches, never intercepts API calls.
 * Always skips waiting immediately.
 */

self.addEventListener('install', function() {
  self.skipWaiting(); // Never wait — always take over immediately
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Pass ALL requests straight to network — no interception
self.addEventListener('fetch', function() {
  return; // Do nothing — browser handles everything natively
});
