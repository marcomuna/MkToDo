// Cache name (version control)
const CACHE_NAME = "muna-todo-v1";

// Files to cache (App Shell)
const urlsToCache = [
  "/",
  "/index.html",
  "/task.html",
  "/style.css",
  "/script.js",
  "layout.js",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-32x32.png",
];

// ==============================
// 1. Install Event (Caching)
// ==============================
self.addEventListener("install", (event) => {
  console.log("Service Worker Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching files...");
      return cache.addAll(urlsToCache);
    }),
  );
});

// ==============================
// 2. Activate Event (Cleanup)
// ==============================
self.addEventListener("activate", (event) => {
  console.log("Service Worker Activated");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

// ==============================
// 3. Fetch Event (Offline)
// ==============================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
