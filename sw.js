// const cacheName = 'my-first-pwa';
// const appShellFiles = [
//   './index.html',
//   './script.js',
//   './words-db.js',
//   './style.css',
//   './images/favicon.ico',
//   './images/192@2x.png',
//   './images/512@2x.png',
//   './images/loading750x1334.png',
//   './images/loading1125x2343.png',
//   './sw.js',
//   './manifest.json',
//   'https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore-compat.js',
//   'https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js',
//   'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js',
//   'https://unpkg.com/onsenui/js/onsenui.min.js',
//   'https://unpkg.com/onsenui/css/onsen-css-components.min.css',
//   'https://unpkg.com/onsenui/css/onsenui.css'
// ];

// // installing Service worker
// self.addEventListener('install', (e) => {
//   e.waitUntil((async () => {
//     const cache = await caches.open(cacheName);
//     await cache.addAll(appShellFiles);
//   })());
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cache) => {
//           if (cache !== cacheName) {
//             return caches.delete(cache);
//           }
//         })
//       );
//     })
//   );
// });

// //Fetching content using Service Worker
// self.addEventListener('fetch', (e) => {
//   if (!(
//     e.request.url.startsWith('http:') || e.request.url.startsWith('https:')
//   )) {
//       return; 
//   }  
//   e.respondWith((async () => {
//     const r = await caches.match(e.request);
//     if (r) return r;
//     const response = await fetch(e.request);
//     const cache = await caches.open(cacheName);
//     cache.put(e.request, response.clone());
//     return response;
//   })());
// });