import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

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
let firestoreInstance: ReturnType<typeof getFirestore> | undefined;

export function getFirestoreDb() {
  if (typeof window === "undefined") {
    throw new Error("getFirestoreDb() must only be called in the browser.");
  }
  firestoreInstance ??= getFirestore(firebaseApp);
  return firestoreInstance;
}
