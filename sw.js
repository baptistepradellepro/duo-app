// Garde l'app disponible hors ligne sur l'iPhone.
// Les fichiers sont pris sur le réseau quand il est là, sinon dans le cache.
const CACHE = "duo-v10";
const SHELL = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "data/ingredients.js",
  "data/aliases.js",
  "data/prices.js",
  "data/recipes.js",
  "data/recipes-plus.js",
  "vendor/zxing.min.js",
  "manifest.webmanifest",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Réseau d'abord pour recevoir les mises à jour, cache si hors ligne.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
        return res.clone();
      })
      .catch(async () => (await caches.match(e.request, { ignoreSearch: true })) || fetch(e.request)),
  );
});
