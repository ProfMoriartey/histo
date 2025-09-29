self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("static-v1").then((c) => c.addAll(["/", "/offline"])));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).catch(() => caches.match("/offline")))
  );
});

// Optional background sync queue name for audio uploads
self.addEventListener("sync", (event) => {
  if (event.tag === "audio-upload") {
    event.waitUntil(handleQueuedUploads());
  }
});
async function handleQueuedUploads(){ /* implement IndexedDB queue drain */ }
