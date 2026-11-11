/* Ο Δαίδαλος και ο Ίκαρος — παιχνίδι χωρίς σύνδεση.
   Πρώτα δοκιμάζει το δίκτυο (ώστε να έρχονται οι νέες εκδόσεις) και,
   αν δεν υπάρχει ή αργεί, δίνει το αποθηκευμένο αντίγραφο. */
const VERSION = 'v1';
const PREFIX = 'ikaros-';
const SCOPE = self.registration.scope;
const CACHE = PREFIX + VERSION + '::' + SCOPE;
const ASSETS = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
const TIMEOUT_MS = 4000;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  // σβήνει μόνο παλιότερες εκδόσεις ΑΥΤΟΥ του αντιγράφου του παιχνιδιού
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k.endsWith('::' + SCOPE) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.href.startsWith(SCOPE)) return;            // ό,τι δεν ανήκει στο παιχνίδι το αφήνουμε ήσυχο
  const key = url.origin + url.pathname;              // χωρίς ?fbclid=… και παρόμοια
  const net = fetch(req);
  const stored = net.then(res => {
    if (!res || !res.ok || res.type !== 'basic') return null;
    const copy = res.clone();
    return caches.open(CACHE).then(cache => cache.put(key, copy));
  }).catch(() => null);
  event.waitUntil(stored);
  event.respondWith((async () => {
    const cached = await caches.match(key);
    if (!cached) return net;
    try {
      return await Promise.race([net, new Promise((resolve, reject) => setTimeout(reject, TIMEOUT_MS))]);
    } catch (err) {
      return cached;
    }
  })());
});
