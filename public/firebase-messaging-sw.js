// Firebase Cloud Messaging background handler. Must live at this exact
// path (public/firebase-messaging-sw.js -> served at /firebase-messaging-sw.js)
// for the FCM SDK to find and register it automatically. Plain JS, not
// TypeScript/ESM — service workers load via importScripts, not bundled by
// Vite, same reasoning as the old public/udd/*.js layer this project used
// to have before it was retired.
//
// Config values here are the same public web config already in
// src/lib/firebase.ts — not secrets, safe to duplicate in a plain script.

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA8xCB8bNYCEemHUtwnJqZP_5YmzxZ518M",
  authDomain: "uni-doordash.firebaseapp.com",
  projectId: "uni-doordash",
  storageBucket: "uni-doordash.firebasestorage.app",
  messagingSenderId: "672556611631",
  appId: "1:672556611631:web:46541c2df8bac2965faeda",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "Uni Door Dash";
  const body = payload.notification?.body ?? "";
  self.registration.showNotification(title, {
    body,
    icon: "/favicon.png",
  });
});
