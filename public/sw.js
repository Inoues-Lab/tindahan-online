// public/sw.js
const CACHE_NAME = 'tindahan-rider-v1'
const urlsToCache = ['/', '/rider', '/manifest.json']

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Fetch cached resources when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    })
  )
})

// Activate new service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || 'New order available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view', title: 'View Order' },
      { action: 'close', title: 'Close' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'New Order!', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/rider')
    )
  }
})