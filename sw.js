const CACHE_NAME = 'pdc-pompier-cache-v2'; // Incrémenté pour forcer la mise à jour
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Installe le service worker et met en cache les fichiers de base de l'application
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert et fichiers de base mis en cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting(); // Force le nouveau service worker à s'activer immédiatement
});

// Intercepte les requêtes réseau avec une stratégie "Network falling back to cache"
self.addEventListener('fetch', event => {
  // Ignorer les requêtes qui ne sont pas des GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // La requête réseau a réussi. On met la réponse en cache pour une utilisation hors ligne future.
        return caches.open(CACHE_NAME).then(cache => {
          // On clone la réponse car une réponse ne peut être consommée qu'une seule fois.
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // La requête réseau a échoué (mode hors ligne), on cherche dans le cache.
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || Response.error();
        });
      })
  );
});


// Supprime les anciens caches lors de l'activation d'un nouveau service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Prend le contrôle de la page immédiatement
  );
});