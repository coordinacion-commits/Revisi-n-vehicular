// ─── SERVICE WORKER · Revisión vehicular Fucesa ────────────────────────────
// Guarda la app en el teléfono para que abra sin señal.
// Al publicar una versión nueva, cambia VERSION: la app avisa y se actualiza
// sin tocar borradores ni pendientes (esos viven en IndexedDB, no aquí).
const VERSION = 'v4.0.0';
const CACHE_APP = 'app-' + VERSION;
const CACHE_LIB = 'libs-v1';

const ARCHIVOS_APP = [
  './',
  './index.html',
  './app.js',
  './config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];
// Lector de QR desde foto (se usa dentro de la app). Si no descarga, la app sigue funcionando.
const LIBS = ['https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const c = await caches.open(CACHE_APP);
    await c.addAll(ARCHIVOS_APP.map(u => new Request(u, { cache: 'reload' })));
    try { const l = await caches.open(CACHE_LIB); await l.addAll(LIBS); } catch (e) { /* opcional */ }
  })());
  // No se activa solo: la app pregunta antes de cambiar de versión.
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres.filter(n => n.startsWith('app-') && n !== CACHE_APP).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'ACTUALIZAR') self.skipWaiting();
  if (event.data && event.data.tipo === 'VERSION') event.source && event.source.postMessage({ tipo: 'VERSION', version: VERSION });
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // El servidor de Google nunca se guarda aquí: la app guarda los catálogos en IndexedDB.
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleusercontent.com')) return;

  if (LIBS.includes(req.url)) {
    event.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copia = res.clone(); caches.open(CACHE_LIB).then(c => c.put(req, copia)); return res;
    })));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Abrir la app (con o sin ?t=…&u=…) siempre usa la copia guardada.
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('./index.html', { ignoreSearch: true }).then(r => r || fetch(req)));
    return;
  }
  event.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
