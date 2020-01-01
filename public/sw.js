self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "PRNI";
  const options = {
    body: data.body || "",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: data.tag || "prni-notification",
    data: { url: data.url || "/members" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/members";
  event.waitUntil(clients.openWindow(url));
});
