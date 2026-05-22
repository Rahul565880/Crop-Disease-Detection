const CACHE_NAME = 'crop-detect-v2';
const ASSETS_TO_CACHE = [
  '/', '/login', '/register', '/diseases', '/offline', '/calendar', '/disease-map', '/fertilizer'
];

const API_CACHE = 'crop-detect-api-v2';
const OFFLINE_QUEUE = 'scan-queue-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE_NAME && n !== API_CACHE && n !== OFFLINE_QUEUE).map((n) => caches.delete(n))
    ))
  );
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  let data = { title: 'Crop Disease Alert', body: 'Check your crops!', icon: '/icons/icon-192.svg', url: '/dashboard' };
  try { if (event.data) data = { ...data, ...event.data.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, { body: data.body, icon: data.icon, data: { url: data.url }, badge: '/icons/icon-192.svg', vibrate: [200, 100, 200] })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/dashboard'));
});

// Offline scan queue
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'QUEUE_SCAN') {
    openDB().then((db) => {
      const tx = db.transaction('scans', 'readwrite');
      tx.objectStore('scans').add({ ...event.data.payload, queuedAt: Date.now() });
      return tx.done;
    });
  }
  if (event.data && event.data.type === 'SYNC_SCANS') {
    processQueue();
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scans') processQueue();
  if (event.tag === 'sync-subscription') registerPush();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) { const cache = await caches.open(CACHE_NAME); cache.put(request, response.clone()); }
    return response;
  } catch { return cached || new Response('Offline', { status: 503 }); }
}

async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) { const cache = await caches.open(cacheName); cache.put(request, response.clone()); }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

async function networkFirstWithFallback(request, fallbackUrl = '/offline.html') {
  try {
    const response = await fetch(request);
    if (response.ok) { const cache = await caches.open(CACHE_NAME); cache.put(request, response.clone()); }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match(fallbackUrl);
    return fallback || new Response('Offline', { status: 503 });
  }
}

// IndexedDB for offline queue
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OFFLINE_QUEUE, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('scans', { keyPath: 'id', autoIncrement: true }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function processQueue() {
  const db = await openDB();
  const tx = db.transaction('scans', 'readonly');
  const items = await new Promise((res) => { const r = tx.objectStore('scans').getAll(); r.onsuccess = () => res(r.result); });
  for (const item of items) {
    try {
      await fetch(item.url, { method: item.method || 'POST', headers: item.headers || {}, body: item.body ? await blobFromBase64(item.body) : undefined });
      const tx2 = db.transaction('scans', 'readwrite');
      tx2.objectStore('scans').delete(item.id);
      await tx2.done;
    } catch {}
  }
}

function blobFromBase64(base64) {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  return new Blob([bytes], { type: 'application/octet-stream' });
}

async function registerPush() {
  try {
    const sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array('BEx6jJxfIalBv7KouZPN7bPmPJmJsLk8cTO-RhAn4VY3TqL-QIK-M7b6nBfPxn_7GsFYBQ-jwL4jSgVkKjqF2rA') });
    const token = await getToken();
    if (token) await fetch(`${getApiBase()}/notifications/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ subscription: sub.toJSON() }) });
  } catch {}
}

async function getToken() {
  const cache = await caches.open('auth-v1');
  const resp = await cache.match('/auth/token');
  return resp ? resp.text() : null;
}

function getApiBase() {
  return self.location.origin === 'http://localhost:5173' ? 'https://crop-disease-detection-98fp.onrender.com/api' : `${self.location.origin}/api`;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
