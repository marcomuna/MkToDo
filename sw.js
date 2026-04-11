const CACHE_NAME = "muna-todo-v1";

// Files to cache (IMPORTANT)
const ASSETS = [
  "/",
  "/index.html",
  "/task.html",
  "/style.css",
  "/script.js",
  "/icons/icon.ico",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
];

// ==========================
// INSTALL (Cache all files)
// ==========================
self.addEventListener("install", (event) => {
  console.log("Service Worker Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching App Shell...");
      return cache.addAll(ASSETS);
    }),
  );

  self.skipWaiting(); // activate immediately
});

// ==========================
// ACTIVATE (Clean old cache)
// ==========================
self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        }),
      ),
    ),
  );

  self.clients.claim();
});

// ==========================
// FETCH (Offline logic)
// ==========================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (!req.url.startsWith("http")) return;

  event.respondWith(
    caches.match(req).then((cachedRes) => {
      return (
        cachedRes ||
        fetch(req)
          .then((networkRes) => {
            return caches.open("muna-cache-v1").then((cache) => {
              cache.put(req, networkRes.clone());
              return networkRes;
            });
          })
          .catch(() => {
            // Optional fallback (offline page)
            return caches.match("/index.html");
          })
      );
    }),
  );
});
