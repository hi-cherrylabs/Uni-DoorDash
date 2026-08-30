import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import {
  getMessaging,
  isSupported as isMessagingSupported,
  type Messaging,
} from "firebase/messaging";

// Single source of truth for who the admin is. The dashboard nav link, the
// /dashboard route guard, the "Create a Piece" form, and the Firestore
// security rules (see /firestore.rules) all need to agree on this exact
// value — previously this was hardcoded in two places (public/udd/market.js
// and nowhere else) and the two copies had drifted out of sync.
export const ADMIN_EMAIL = "hello.cherrylabs@gmail.com";

// Web client config — not a secret. Access control lives in Firebase
// Auth + Firestore/Storage security rules, not in hiding this key.
// See: uni_doordash_firebase_project.md
const firebaseConfig = {
  apiKey: "AIzaSyA8xCB8bNYCEemHUtwnJqZP_5YmzxZ518M",
  authDomain: "uni-doordash.firebaseapp.com",
  projectId: "uni-doordash",
  storageBucket: "uni-doordash.firebasestorage.app",
  messagingSenderId: "672556611631",
  appId: "1:672556611631:web:46541c2df8bac2965faeda",
  measurementId: "G-PDPCV6SH16",
};

// getApps()/getApp() guard against "app already initialized" errors that
// would otherwise occur on every hot-reload in dev, or if this module is
// evaluated more than once (e.g. once during SSR, once client-side).
export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// NOTE: this is intentionally not called during server-side rendering.
// Firebase Auth's browser persistence (IndexedDB/localStorage) needs a real
// browser; this app does not verify any session server-side yet, so auth
// state is established client-side only, after hydration. See getFirebaseAuth().
let authInstance: ReturnType<typeof getAuth> | undefined;

export function getFirebaseAuth() {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth() must only be called in the browser.");
  }
  authInstance ??= getAuth(firebaseApp);
  return authInstance;
}

// Firestore, same lazy/browser-only pattern as getFirebaseAuth() above.
// Firestore's modular SDK *can* run during SSR, but this app's product/order
// data is read via realtime onSnapshot listeners designed for the browser,
// so — same as auth — we only ever touch it client-side, after hydration.
//
// Initialized with persistentLocalCache (IndexedDB-backed) rather than the
// plain in-memory client: this means onSnapshot listeners can serve cached
// results immediately on page load — before the network round-trip even
// completes — then transparently reconcile with the server. This is what
// actually fixes "orders disappear on refresh": without it, every reload
// started from a genuinely empty local state until Firestore reconnected.
// persistentMultipleTabManager lets multiple open tabs share one cache
// instead of fighting over a lock.
let firestoreInstance: ReturnType<typeof getFirestore> | undefined;

export function getFirestoreDb() {
  if (typeof window === "undefined") {
    throw new Error("getFirestoreDb() must only be called in the browser.");
  }
  if (!firestoreInstance) {
    try {
      firestoreInstance = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // initializeFirestore throws if Firestore was already touched via
      // getFirestore() elsewhere first, or in environments where
      // IndexedDB isn't available (some private-browsing modes). Fall
      // back to the plain in-memory client so the app still works —
      // just without the offline cache.
      firestoreInstance = getFirestore(firebaseApp);
    }
  }
  return firestoreInstance;
}

// Cloud Messaging (push notifications). Not every environment supports it
// (Safari has partial support, some private-browsing modes block it
// entirely, and it always requires a service worker) — isSupported() checks
// this at runtime rather than assuming, and callers should treat a null
// return as "push just isn't available here", not an error.
let messagingInstance: Messaging | undefined;

export async function getMessagingClient(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (messagingInstance) return messagingInstance;
  if (!(await isMessagingSupported())) return null;
  messagingInstance = getMessaging(firebaseApp);
  return messagingInstance;
}
