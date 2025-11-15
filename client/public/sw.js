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

// External domains to SKIP (do not intercept or cache)
const EXTERNAL_DOMAINS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'google.com',
  'gstatic.com',
  'googleapis.com',
  'firebaseio.com',
  'firebaseapp.com',
  'firebase.com',
  'vercel.com',
  'vercel.app',
  'googletagmanager.com',
  'google-analytics.com',
  'recaptcha.net'
];

// Helper function to check if URL is external
function isExternalDomain(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Check if hostname matches any external domain
    return EXTERNAL_DOMAINS.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

// Helper function to check if request is same-origin
function isSameOrigin(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.origin === self.location.origin;
  } catch (e) {
    return false;
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.warn('Failed to cache some assets during install:', error);
          // Continue anyway
        });
      })
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

// Fetch event - implement caching strategies with proper error handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL: Skip ALL external domains (Google Ads, Firebase, reCaptcha, etc.)
  if (isExternalDomain(request.url)) {
    // Let browser handle external requests directly - DO NOT INTERCEPT
    return;
  }

  // CRITICAL: Only handle same-origin requests
  if (!isSameOrigin(request.url)) {
    // Let browser handle cross-origin requests - DO NOT INTERCEPT
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) {
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
              cache.put(request, clonedResponse).catch(() => {
                // Silently fail cache write
              });
            });
          }
          return response;
        })
        .catch((error) => {
          // Fallback to cache if network fails
          return caches.open(API_CACHE).then((cache) => {
            return cache.match(request);
          });
        })
    );
    return;
  }

  // Font assets - long-term cache first (fonts rarely change)
  // Only cache same-origin fonts
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
                    cache.put(request, clonedResponse).catch(() => {
                      // Silently fail cache write
                    });
                  }
                  return response;
                })
                .catch((error) => {
                  // Return nothing if fetch fails
                  return new Response('Font load failed', { status: 404 });
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
                    cache.put(request, clonedResponse).catch(() => {
                      // Silently fail cache write
                    });
                  }
                  return response;
                })
                .catch((error) => {
                  // Return cached version if available, otherwise fail gracefully
                  return cachedResponse || new Response('Asset not available', { status: 404 });
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
              .then((cache) => cache.put(request, clonedResponse))
              .catch(() => {
                // Silently fail cache write
              });
          }
          return response;
        })
        .catch((error) => {
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
