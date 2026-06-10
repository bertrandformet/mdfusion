const CACHE_NAME = 'mdfusion-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/theme.css',
  '/src/app.js',
  '/src/utils/dom.js',
  '/src/utils/engine.js',
  '/src/utils/data.js',
  '/src/utils/icons.js',
  '/src/utils/download.js',
  '/src/components/ui.js',
  '/src/components/dropzone.js',
  '/src/components/filelist.js',
  '/src/components/preview.js',
  '/src/components/toast.js',
  '/src/views/convert.js',
  '/src/views/merge.js',
  '/src/views/editor.js',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Google Fonts: cache-first (immutable once fetched)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

  // App assets: cache-first, fallback to network
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  }
});
