// Firebase Cloud Messaging Service Worker
// Dedicated to Customer order-status notifications only

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener for background order-status push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notificationTitle = payload.notification?.title || 'Medix Order Update';
    const notificationOptions = {
      body: payload.notification?.body || 'Your order status has changed.',
      icon: '/pwa-192x192.png',
      badge: '/favicon.ico',
      data: {
        url: payload.data?.url || '/orders',
      },
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (err) {
    // Fallback for plain text
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Medix Order Update', {
        body: text,
        icon: '/pwa-192x192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/orders';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
