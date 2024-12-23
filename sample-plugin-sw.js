/**
 * [MOHD AHSHAN DANISH][23 December 2024]
 * Service Worker for Sample Plugin
 * This service worker caches the index.html and excessReturnMain.js files.
 * It also caches the fetch requests and responses.
 * It also deletes the old caches on activation.
 * It does not cache the POST requests.
 * It does not cache the fetch requests with status >= 400.
 * It does not cache the fetch requests with URL containing "/activities/".
 * @version 0.1.0
 * @since 0.1.0
 * @param {string} CACHE_VERSION - The version of the cache
 * @param {string} CURRENT_CACHES - The name of the cache
 * @param {string} cacheName - The name of the cache
 * @returns {void}
 * @throws {Error} - If there is an error
 */
var CACHE_VERSION = "24D";
var CURRENT_CACHES = "sample_plugin_v" + CACHE_VERSION;

// Install
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches
      .open(CURRENT_CACHES)
      .then(function (cache) {
        return cache.addAll(["index.html", "plugin.js"]);
      })
      .then(function () {
        console.log("Service Worker is installed");
      })
  );
});

self.addEventListener("activate", function (event) {
  var currentCacheName = CURRENT_CACHES;
  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (!currentCacheName.includes(cacheName)) {
              console.log("Service Worker Deleting out of date cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function (resp) {
        console.log("Service Worker Activated");
      })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(CURRENT_CACHES).then(function (cache) {
      return cache
        .match(event.request)
        .then(function (response) {
          if (response) {
            console.log(" Service Worker- Found response in cache on fetch:", response);

            return response;
          }

          return fetch(event.request.clone()).then(function (response) {
            if (
              event.request.method != "POST" &&
              response.status < 400 &&
              !event.request.url.includes("/activities/")
            ) {
              console.log("Service Worker- Caching the response after fetch to", event.request.url);
              cache.put(event.request, response.clone());
            } else {
              console.log("Service Worker- Not caching the response to", event.request.url);
            }

            return response;
          });
        })
        .catch(function (error) {
          console.error("Service Worker- Error in fetch listener:", error);

          throw error;
        });
    })
  );
});
