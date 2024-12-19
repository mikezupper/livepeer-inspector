importScripts('/js/dexie-4.0.10.min.js');

const CACHE_VERSION = 'v1.3'; // Increment this for each new version
const STATIC_CACHE = `orch-perf-cache-${CACHE_VERSION}`;
const DB_VERSION = 1.1; // Increment when upgrading the database schema
const CACHE_EXPIRATION_TTL_MILLIS = 5 * 60 * 1000; // Example TTL: 5 minutes

const db = new Dexie('orch-perf-cache-db');
db.version(DB_VERSION).stores({
    apiData: 'url, data, timestamp',
}).upgrade((trans) => {
    console.log(`[sw] Database upgraded to version`, DB_VERSION);
});

console.log(`[sw] Service Worker script loaded`);

self.addEventListener('install', (event) => {
    console.log(`[sw] installing...`);

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log(`[sw] Static assets cached`);
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',
                '/app.js',
            ]);
        })
    );

    // Activate immediately
    self.skipWaiting();
    console.log(`[sw] installed and waiting skipped`);
});

// Activate Event - Clean up old caches and claim clients
self.addEventListener('activate', (event) => {
    console.log(`[sw] activating...`);

    event.waitUntil(
        caches.keys().then((keys) => {
            console.log(`[sw] Service Worker deleting cache key `, keys);

            return Promise.all(
                keys.filter((key) => key !== STATIC_CACHE)
                    .map((key) => caches.delete(key))
            );
        })
    );

    // Notify clients about the new service worker
    event.waitUntil(
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => client.postMessage({ type: 'UPDATE_AVAILABLE' }));
        })
    );

    self.clients.claim();
   // schedulePeriodicUpdate(); // Start periodic updates
    console.log(`[sq] Service Worker activated`);
});

// Fetch Event - Intercept requests for static assets and API data
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle static assets
    if (event.request.destination === 'document' ||
        event.request.destination === 'script' ||
        event.request.destination === 'style') {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }

    // Handle API requests
    if (url.pathname.startsWith('/api')) {
        console.log(`[sw] fetch: Intercepting API request: ${url.href}`);

        event.respondWith(
            getCachedData(url.href).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log(`[sw] CACHE HIT:  URL:`, url.href);
                    return new Response(JSON.stringify(cachedResponse.data), {
                        headers: { 'Content-Type': 'application/json' },
                    });
                } else {
                    console.log(`[sw] CACHE MISS, fetching URL: `, event.request.url);
                    return fetchAndCacheData(event.request);
                }
            })
        );
    }
});

// Function to Fetch Data and Update IndexedDB Cache
async function fetchAndCacheData(request) {
    const url = request.url;
    console.log(`[sw] fetchAndCacheData URL: ${url}`);

    try {
        const response = await fetch(request);
        const contentType = response.headers.get("Content-Type");

        if (response.ok && contentType.includes("application/json")) {
            const data = await response.clone().json();
            await db.apiData.put({ url, data, timestamp: Date.now() });
            console.log(`[sw] fetchAndCacheData: local cache with new API data for URL: ${url}`);
            return response;
        }
        throw new Error("Invalid response");
    } catch (error) {
        console.error(`fetchAndCacheData: cache fetch failed`, error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Function to Get Cached Data from IndexedDB and Remove Stale Entries
async function getCachedData(url) {
    try {
        const cachedData = await db.apiData.get(url);
        if (cachedData) {
            const currentTime = Date.now();

            if (currentTime - cachedData.timestamp > CACHE_EXPIRATION_TTL_MILLIS) {
                console.log(`[sw] getCachedData: Cache expired for URL: ${url}. Removing stale entry.`);
                await db.apiData.delete(url);
                return null;
            }

            return cachedData;
        }
        return null;
    } catch (error) {
        console.error('getCachedData: error fetching from cache:', error);
        return null;
    }
}

// Function to Periodically Update IndexedDB Cache for Each Unique URL
// function schedulePeriodicUpdate() {
//     const updateInterval = 2 * 60 * 1000; // 2 minutes
//
//     const updateCache = async () => {
//         console.log(`[sw] Periodic update: Fetching new data for each cached URL`);
//
//         try {
//             const cachedEntries = await db.apiData.toArray();
//             for (const entry of cachedEntries) {
//                 // console.log(`[sw] Updating cache for URL: ${entry.url}`);
//                 try {
//                     const response = await fetch(entry.url);
//                     if (!response.ok) throw new Error(`Error: ${response.statusText}`);
//
//                     const data = await response.json();
//                     await db.apiData.put({ url: entry.url, data, timestamp: Date.now() });
//                     // console.log(`[sw] Cache updated for URL: ${entry.url}`);
//                 } catch (fetchError) {
//                     console.error(`Failed to update cache for URL: ${entry.url}`, fetchError);
//                 }
//             }
//         } catch (error) {
//             console.log(`[sw] Periodic update error:`, error);
//         }
//     };
//
//     // Initial update
//     updateCache();
//
//     // Schedule periodic updates
//     setInterval(updateCache, updateInterval);
// }
