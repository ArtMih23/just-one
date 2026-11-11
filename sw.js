// Just One service worker: shows push notifications and opens the app when one is tapped.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'Just One', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    // the app is open in front of the person: chats update by themselves, no need for a notification
    if (list.some(function (c) { return c.visibilityState === 'visible' && c.focused; })) return;
    return self.registration.showNotification(d.title || 'Just One', {
      body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag,
      icon: 'icon-192.png', badge: 'icon-192.png', data: { url: d.url || './' }
    });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].url.indexOf(self.registration.scope) === 0) { list[i].navigate(url).catch(function () {}); return list[i].focus(); }
    }
    return self.clients.openWindow(url);
  }));
});