// Αϊ-Βασίλης – Η Αποστολή των Δώρων · Service Worker v1
// Με σύνδεση ανοίγει πάντα η νεότερη έκδοση του παιχνιδιού· χωρίς σύνδεση (ή με πολύ αργή σύνδεση) το αποθηκευμένο αντίγραφο.
// Αγγίζει ΜΟΝΟ τα δικά του αποθηκευμένα αρχεία: στην ίδια διεύθυνση φιλοξενούνται κι άλλα παιχνίδια,
// που κρατούν τα δικά τους αντίγραφα.
const PREFIX = 'aivasilis-';
const CACHE = PREFIX + 'v1';
const SCOPE = self.registration.scope;
const CORE = ['./', './manifest.json', './icon-192.png', './icon-512.png'];      // το «./index.html» φυλάσσεται ως «./» (βλ. παρακάτω), άρα δεν κατεβαίνει δεύτερη φορά
const WAIT = 4000;                                 // τόσο περιμένουμε το δίκτυο πριν δώσουμε το αποθηκευμένο αντίγραφο

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))                 // η σελίδα μόλις κατέβηκε: το αντίγραφό της παίρνεται από τη μνήμη του προγράμματος περιήγησης, χωρίς δεύτερο κατέβασμα
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // σβήνει μόνο παλιότερες εκδόσεις ΤΟΥ ΑΪ-ΒΑΣΙΛΗ, ποτέ τα αρχεία άλλων παιχνιδιών
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
  if (!url.href.startsWith(SCOPE)) return;         // ό,τι δεν ανήκει στο παιχνίδι το αφήνουμε ήσυχο

  let key = url.origin + url.pathname;             // χωρίς ?fbclid=… και παρόμοια
  if (key.endsWith('/index.html')) key = key.slice(0, -'index.html'.length);
  const cached = caches.open(CACHE).then(c => c.match(key));
  const net = fetch(req, { cache: 'no-cache' }).then(r => {
    if (r && r.ok && r.type === 'basic') {
      const copy = r.clone();
      e.waitUntil(caches.open(CACHE).then(c => c.put(key, copy)));
    }
    return r;
  });
  const timer = new Promise(resolve => setTimeout(resolve, WAIT, null));

  // Πρώτα το δίκτυο. Αν αποτύχει ή αργεί πάνω από 4 δευτερόλεπτα και υπάρχει αποθηκευμένο αντίγραφο, δίνεται εκείνο
  // (το δίκτυο συνεχίζει στο παρασκήνιο και ανανεώνει το αντίγραφο για την επόμενη φορά).
  e.respondWith(
    Promise.race([net.catch(() => null), timer]).then(first => {
      if (first && first.ok) return first;
      return cached.then(hit => hit || (first ? first : net));
    })
  );
});
