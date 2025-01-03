var CACHE_VERSION = "24D";
var CACHE_NAME = "cache-v" + CACHE_VERSION;

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(["index.html", "style.css", "plugin.js"]);
    })
  );
});

// activate
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
//fetch
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
