// Οδυσσέας – Service Worker v2
// Το παιχνίδι ανοίγει και χωρίς σύνδεση.
// Αγγίζει ΜΟΝΟ τα δικά του αποθηκευμένα αρχεία: στην ίδια διεύθυνση φιλοξενούνται
// κι άλλα παιχνίδια (Λαβύρινθος, Ίκαρος, Προμηθέας), που κρατούν τα δικά τους αντίγραφα.
const PREFIX = 'odysseas-';
const CACHE = PREFIX + 'v1';
const SCOPE = self.registration.scope;
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // σβήνει μόνο παλιότερες εκδόσεις ΤΟΥ ΟΔΥΣΣΕΑ, ποτέ τα αρχεία άλλων παιχνιδιών
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Γραμματοσειρές Google: το αποθηκευμένο αντίγραφο αν υπάρχει, αλλιώς το δίκτυο
  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com') {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(req).then(cached => {
          const net = fetch(req).then(r => {
            if (r && (r.ok || r.type === 'opaque')) cache.put(req, r.clone());
            return r;
          });
          if (cached) { net.catch(() => {}); return cached; }
          return net;
        })
      )
    );
    return;
  }

  if (!url.href.startsWith(SCOPE)) return;        // ό,τι δεν ανήκει στο παιχνίδι το αφήνουμε ήσυχο

  // Αρχεία του παιχνιδιού: αμέσως το αποθηκευμένο αντίγραφο (άρα και χωρίς σύνδεση) και,
  // στο παρασκήνιο, ανανέωση από το δίκτυο, ώστε την επόμενη φορά να ανοίξει η νεότερη έκδοση.
  const key = url.origin + url.pathname;          // χωρίς ?fbclid=… και παρόμοια
  const net = fetch(req);
  const stored = net.then(r => {
    if (!r || !r.ok || r.type !== 'basic') return null;
    const copy = r.clone();
    return caches.open(CACHE).then(c => c.put(key, copy));
  }).catch(() => null);
  e.waitUntil(stored);
  e.respondWith(
    caches.open(CACHE).then(c => c.match(key)).then(cached => cached || net)
  );
});
