// (A) CREATE/INSTALL CACHE
self.addEventListener("install", evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open("PHPPOS")
    .then(cache => cache.addAll([
      "4a-pos.html",
      "4b-pos.js",
      "4c-cart.js",
      "4d-pos.css",
      "5a-manifest.json",
      "assets/favicon.png",
      "assets/icon-512.png"
    ]))
    .catch(err => console.error(err))
  );
});

// (B) CLAIM CONTROL INSTANTLY
self.addEventListener("activate", evt => self.clients.claim());

// (C) LOAD FROM CACHE FIRST, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", evt => evt.respondWith(
  caches.match(evt.request).then(res => res || fetch(evt.request))
));