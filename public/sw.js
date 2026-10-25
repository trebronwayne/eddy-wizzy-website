/* Eddy Wizzy service worker.
   - Pages: network first (always fresh), falling back to the saved copy when offline.
   - Site files (JS, CSS, photos, icons): saved on first use, served instantly afterwards.
   - Only this website's own files are saved. Videos, fonts and links elsewhere are left alone.
   Change VERSION to force every visitor to refresh the saved files. */
const VERSION = 'ew-v3';
const SCOPE = self.registration.scope;
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'favicon.svg', 'images/eddy-cutout.webp'].map((path) => new URL(path, SCOPE).href);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      // Add one by one so a single missing file never blocks the install.
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;
  // Audio streams in ranges, so let the browser handle it directly.
  if (request.headers.has('range') || /\.(mp3|m4a|ogg|wav)$/i.test(url.pathname)) return;

  // Page navigations: try the network, fall back to the saved home page (the app handles the route).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(new URL('index.html', SCOPE).href, copy)).catch(() => undefined);
          return response;
        })
        .catch(() => caches.match(new URL('index.html', SCOPE).href).then((saved) => saved || caches.match(new URL('./', SCOPE).href)))
    );
    return;
  }

  // Everything else from this site: serve the saved copy right away, refresh it in the background.
  event.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(request).then((saved) => {
        const refresh = fetch(request)
          .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => saved);
        return saved || refresh;
      })
    )
  );
});
