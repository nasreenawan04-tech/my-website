// Dynamic cache versioning based on build timestamp
const CACHE_VERSION = '2025.09.22.001';
const CACHE_NAME = `dapsiwow-v${CACHE_VERSION}`;
const STATIC_CACHE = `dapsiwow-static-v${CACHE_VERSION}`;
const API_CACHE = `dapsiwow-api-v${CACHE_VERSION}`;
const FONT_CACHE = `dapsiwow-fonts-v${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/logo.svg', 
  '/site.webmanifest',
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap-main.xml',
  '/sitemap-finance.xml',
  '/sitemap-health.xml',
  '/sitemap-text.xml'
];

// Cache strategies
const CACHE_STRATEGIES = {
  static: 'cache-first',
  api: 'network-first',
  images: 'cache-first'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE &&
                cacheName !== FONT_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before any use to prevent "body already used" error
          const clonedResponse = response.clone();
          // Only cache successful responses
          if (response.ok && response.status === 200) {
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.open(API_CACHE).then((cache) => {
            return cache.match(request);
          });
        })
    );
    return;
  }

  // Font assets - long-term cache first (fonts rarely change)
  if (url.pathname.match(/\.(woff2?|otf|ttf)$/)) {
    event.respondWith(
      caches.open(FONT_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return fetch(request)
                .then((response) => {
                  // Clone response before any use
                  const clonedResponse = response.clone();
                  if (response.ok && response.status === 200) {
                    cache.put(request, clonedResponse);
                  }
                  return response;
                });
            });
        })
    );
    return;
  }

  // Static assets - stale-while-revalidate for better performance
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              const fetchPromise = fetch(request)
                .then((response) => {
                  // Clone response before any use
                  const clonedResponse = response.clone();
                  if (response.ok && response.status === 200) {
                    cache.put(request, clonedResponse);
                  }
                  return response;
                });

              // Return cached version immediately, but update cache in background
              return cachedResponse || fetchPromise;
            });
        })
    );
    return;
  }

  // HTML pages - network first with cache fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response before any use to prevent "body already used" error
          const clonedResponse = response.clone();
          // Cache successful HTML responses
          if (response.ok && response.status === 200) {
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, clonedResponse));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache or offline page
          return caches.match(request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/');
            });
        })
    );
    return;
  }
});