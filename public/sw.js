// OzVFY Service Worker — v2

const CACHE_NAME = 'ozvfy-v2';
const API_CACHE_NAME = 'ozvfy-api-v2';
const IMG_CACHE_NAME = 'ozvfy-img-v2';
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Install: pre-cache shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/', '/manifest.json'])
    ).catch(() => {})
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => ![CACHE_NAME, API_CACHE_NAME, IMG_CACHE_NAME].includes(k)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache /api/v1/deals?page=1 for 5 minutes
  if (url.pathname === '/api/v1/deals' && url.searchParams.get('page') === '1') {
    event.respondWith(apiCacheStrategy(event.request));
    return;
  }

  // Stale-while-revalidate for images
  if (event.request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(event.request, IMG_CACHE_NAME));
    return;
  }
});

async function apiCacheStrategy(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    const dateHeader = cached.headers.get('sw-cached-at');
    if (dateHeader && Date.now() - Number(dateHeader) < API_CACHE_TTL) {
      return cached;
    }
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cloned = response.clone();
      const body = await cloned.arrayBuffer();
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', String(Date.now()));
      const cached = new Response(body, { status: response.status, statusText: response.statusText, headers });
      await cache.put(request, cached);
    }
    return response;
  } catch {
    return cached || new Response(JSON.stringify({ products: [], metadata: {} }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || networkPromise;
}

// Push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'OzVFY Deal Alert';
  const options = {
    body: data.body || 'A new deal is available!',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || 'https://www.ozvfy.com' },
    actions: [
      { action: 'view', title: 'View Deal' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || 'https://www.ozvfy.com';
  event.waitUntil(clients.openWindow(url));
});
