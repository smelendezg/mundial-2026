importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBStoBHt4PJLLTG7xTg8gD4DD7eMiKqJW4",
  authDomain: "mundial-2026-hub.firebaseapp.com",
  projectId: "mundial-2026-hub",
  storageBucket: "mundial-2026-hub.firebasestorage.app",
  messagingSenderId: "1067848808",
  appId: "1:1067848808:web:b591a53aae96e8cd5757dd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  self.registration.showNotification(title ?? "Mundial 2026", {
    body: body ?? "",
    icon: "/vite.svg",
  });
});