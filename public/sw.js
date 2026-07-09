// In development, this service worker self-destructs.
// In production, it provides caching and offline support.

const IS_PRODUCTION = false; // Set to true for production builds

if (!IS_PRODUCTION) {
  // Immediately unregister and clear all caches
  self.addEventListener("install", () => {
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.clients.claim())
        .then(() => self.registration.unregister())
        .then(() => {
          // Reload all open tabs so they stop using this SW
          self.clients.matchAll({ type: "window" }).then((clients) => {
            clients.forEach((client) => client.navigate(client.url));
          });
        })
    );
  });
} else {
  const CACHE_NAME = "taskflow-v2";

  const PRECACHE_ASSETS = [
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];

  self.addEventListener("install", (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(PRECACHE_ASSETS))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key !== CACHE_NAME)
              .map((key) => caches.delete(key))
          )
        )
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") return;
    if (url.hostname.includes("clerk")) return;
    if (url.pathname.startsWith("/_next/")) return;

    // API requests: network only
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(JSON.stringify({ error: "Offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        })
      );
      return;
    }

    // Static assets only (icons, images): cache-first
    if (url.pathname.startsWith("/icons/") || url.pathname.match(/\.(png|jpg|svg|woff2?)$/)) {
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) =>
          cache.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            });
          })
        )
      );
      return;
    }

    // Everything else: network only (don't cache HTML pages)
  });

  self.addEventListener("push", (event) => {
    if (event.data) {
      const data = event.data.json();
      event.waitUntil(
        self.registration.showNotification(data.title || "TaskFlow", {
          body: data.body,
          icon: data.icon || "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          vibrate: [100, 50, 100],
          data: { url: data.url || "/dashboard" },
        })
      );
    }
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/dashboard";
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clients) => {
          for (const client of clients) {
            if (client.url.includes("/dashboard") && "focus" in client) {
              return client.focus();
            }
          }
          return self.clients.openWindow(url);
        })
    );
  });
}
