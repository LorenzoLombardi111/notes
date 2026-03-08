const CACHE_NAME = 'freenotepad-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/online-notepad.html',
  '/memo-app.html',
  '/note-taking-tips.html',
  '/privacy-notes-app.html',
  '/offline-notepad.html',
  '/vs-google-keep.html',
  '/vs-notion.html',
  '/vs-simplenote.html',
  '/vs-apple-notes.html',
  '/vs-evernote.html',
  '/vs-obsidian.html',
  '/og-image.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network-first for HTML, cache-first for fonts/assets
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
