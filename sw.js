const CACHE_NAME = 'mdfusion-v3';

const BASE = '/mdfusion/';

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'src/theme.css',
  BASE + 'src/app.js',
  BASE + 'src/utils/dom.js',
  BASE + 'src/utils/engine.js',
  BASE + 'src/utils/data.js',
  BASE + 'src/utils/icons.js',
  BASE + 'src/utils/download.js',
  BASE + 'src/components/ui.js',
  BASE + 'src/components/dropzone.js',
  BASE + 'src/components/filelist.js',
  BASE + 'src/components/preview.js',
  BASE + 'src/components/toast.js',
  BASE + 'src/views/convert.js',
  BASE + 'src/views/merge.js',
  BASE + 'src/views/editor.js',
  BASE + 'src/converters/index.js',
  BASE + 'src/converters/text.js',
  BASE + 'src/converters/json.js',
  BASE + 'src/converters/image.js',
  BASE + 'src/converters/csv.js',
  BASE + 'src/converters/html.js',
  BASE + 'src/converters/xml.js',
  BASE + 'src/converters/docx.js',
  BASE + 'src/converters/xlsx.js',
  BASE + 'src/converters/pdf.js',
  BASE + 'src/converters/epub.js',
  BASE + 'icons/icon-192.svg',
  BASE + 'icons/icon-512.svg',
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

  // CDN libs (esm.sh): cache-first for offline support
  if (url.hostname === 'esm.sh') {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return res;
      }))
    );
    return;
  }

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
