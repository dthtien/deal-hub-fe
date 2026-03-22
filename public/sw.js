self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'OzVFY Deal Alert';
  const options = {
    body: data.body || 'A new deal is available!',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || 'https://www.ozvfy.com' },
    actions: [
      { action: 'view', title: 'View Deal' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || 'https://www.ozvfy.com';
  event.waitUntil(clients.openWindow(url));
});
