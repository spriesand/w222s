/**
 * V12 Pursuit — Service Worker
 * Handles: PWA share target, offline shell caching
 */

const CACHE_NAME = 'v12-pursuit-v1';
const SHELL_URLS = [
  '/w222s/',
  '/w222s/index.html',
];

// ── Install: cache app shell ─────────────────────────────────────
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_URLS);
    }).catch(function(err) {
      console.log('[SW] Cache install error (non-fatal):', err);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────────
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for shell ──────────
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Always network for Supabase and external APIs
  if (url.includes('supabase.co') || url.includes('api.') || url.includes('cdn.')) {
    return; // let browser handle
  }

  // Share target — intercept GET requests with share params
  var reqUrl = new URL(event.request.url);
  if (reqUrl.searchParams.has('share_url') || reqUrl.searchParams.has('share_text')) {
    // Let the app handle share params on load — just serve the shell
    event.respondWith(
      caches.match('/w222s/index.html').then(function(cached) {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // Network-first for HTML (always get fresh app)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/w222s/index.html');
      })
    );
    return;
  }
});

// ── Message: force update ────────────────────────────────────────
self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
