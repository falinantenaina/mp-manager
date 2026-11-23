// Service Worker — FB MP Manager
const CACHE = 'fb-mp-v1'
const PRECACHE = ['/', '/admin', '/employee', '/login']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (e.request.url.includes('/api/')) return // Pas de cache pour l'API
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})

// Push notification
self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    vibrate: data.urgency === 'URGENT' ? [200, 100, 200, 100, 200] : [200],
    data: { url: data.url || '/admin' },
    requireInteraction: data.urgency === 'URGENT',
    tag: 'fb-mp-' + Date.now(),
  }
  e.waitUntil(self.registration.showNotification(data.title, options))
})

// Clic sur notification → ouvrir l'app
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/admin'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
