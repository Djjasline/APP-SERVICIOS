const CACHE_NAME = "app-servicios-v9";
const VAPID_CACHE_NAME = "app-servicios-vapid";
const VAPID_PUBLIC_KEY_REQUEST = "/__vapid_public_key__";

const STATIC_ASSETS = [
  "/manifest.json",
  "/favicon.ico",
];
let VAPID_PUBLIC_KEY = null;

async function persistVapidPublicKey(key) {
  if (!key) return;

  const cache = await caches.open(VAPID_CACHE_NAME);
  await cache.put(VAPID_PUBLIC_KEY_REQUEST, new Response(key));
}

async function getVapidPublicKey() {
  if (VAPID_PUBLIC_KEY) return VAPID_PUBLIC_KEY;

  const cached = await caches.match(VAPID_PUBLIC_KEY_REQUEST);
  const key = cached ? (await cached.text()).trim() : "";
  VAPID_PUBLIC_KEY = key || null;
  return VAPID_PUBLIC_KEY;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_VAPID_PUBLIC_KEY") {
    VAPID_PUBLIC_KEY = event.data.key || null;
    event.waitUntil?.(persistVapidPublicKey(VAPID_PUBLIC_KEY));
  }
});

function setBadgeCount(count) {
  const value = Number(count) || 0;

  if ("setAppBadge" in self.registration) {
    return value > 0
      ? self.registration.setAppBadge(value)
      : self.registration.clearAppBadge?.() || Promise.resolve();
  }

  if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
    return value > 0
      ? navigator.setAppBadge(value)
      : navigator.clearAppBadge?.() || Promise.resolve();
  }

  return Promise.resolve();
}


// ─── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// ─── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (![CACHE_NAME, VAPID_CACHE_NAME].includes(cache)) return caches.delete(cache);
        })
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH (cache estrategia network-first para API, cache-first para assets) ─
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Para llamadas a Supabase siempre ir a la red
  if (url.hostname.includes("supabase.co")) return;

  if (event.request.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/index.html", responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});

// ─── PUSH NOTIFICATION ──────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "App Servicios",
    body: "Tienes una nueva notificación.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "general",
    data: { url: "/" },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const badgeCount = Number(data.data?.badgeCount ?? data.badgeCount ?? 1) || 1;

  const badgePromise = setBadgeCount(badgeCount).catch(() => undefined);

  event.waitUntil(
    Promise.all([
      badgePromise,
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        data: data.data,
        vibrate: [200, 100, 200],
        requireInteraction: data.requireInteraction ?? false,
      }),
    ])
  );
});

// ─── CLICK EN NOTIFICACIÓN ──────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla y navegar
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Si no hay ventana, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ─── PUSH SUBSCRIPTION CHANGE (renovación automática) ───────────────────────
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const vapidPublicKey = await getVapidPublicKey();

      if (!vapidPublicKey) {
        console.warn("[Push] No se puede renovar suscripción: falta VAPID_PUBLIC_KEY.");
        return;
      }

      const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const clients = await self.clients.matchAll();
      clients.forEach((client) =>
        client.postMessage({
          type: "PUSH_SUBSCRIPTION_CHANGED",
          subscription: subscription.toJSON(),
        })
      );
    })()
  );
});
