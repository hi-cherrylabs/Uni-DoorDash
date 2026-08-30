import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { getFirestoreDb } from "@/lib/firebase";
import type { Product, Seller } from "@/data/catalog";

// ---------------------------------------------------------------------------
// Products — written by the admin via the "Create a Piece" form, read by
// everyone. Shape matches `Product` from data/catalog.ts so the same
// <ProductCard> works for both the static seed catalog and these live,
// admin-posted listings.
// ---------------------------------------------------------------------------

export type FirestoreProduct = Product & {
  quantity: number;
  deliveryTime: string;
  sellerEmail: string | null;
  createdAt: Timestamp | null;
};

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";

export function subscribeToProducts(
  onChange: (products: FirestoreProduct[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(
    collection(getFirestoreDb(), PRODUCTS_COLLECTION),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const products = snapshot.docs.map((d) => {
        const data = d.data() as Omit<FirestoreProduct, "id">;
        return { ...data, id: d.id } satisfies FirestoreProduct;
      });
      onChange(products);
    },
    onError,
  );
}

export type NewProductInput = {
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  deliveryTime: string;
  image: string;
  sellerEmail: string | null;
};

export async function createProduct(input: NewProductInput): Promise<void> {
  const seller: Seller = { name: "Uni Door Dash", avatar: PLACEHOLDER_AVATAR };
  await addDoc(collection(getFirestoreDb(), PRODUCTS_COLLECTION), {
    name: input.name,
    description: input.description,
    category: input.category,
    quantity: input.quantity,
    price: input.price,
    deliveryTime: input.deliveryTime,
    image: input.image || PLACEHOLDER_IMAGE,
    seller,
    sellerEmail: input.sellerEmail,
    createdAt: serverTimestamp(),
  });
}

/** Admin only — permanently removes an admin-posted product for everyone. */
export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), PRODUCTS_COLLECTION, productId));
}

// ---------------------------------------------------------------------------
// Hidden static products — the seed catalog in data/catalog.ts is plain
// source code, not database rows, so "deleting" one of those demo products
// can't be a database delete. Instead we keep a single small Firestore doc
// listing which seed-catalog ids the admin has hidden; every page that
// renders the static catalog filters it through this list, so a "delete" on
// a demo product syncs to every visitor immediately, same as a real one.
// ---------------------------------------------------------------------------

const SETTINGS_COLLECTION = "settings";
const CATALOG_SETTINGS_DOC = "catalog";

export function subscribeToHiddenStaticProductIds(
  onChange: (ids: string[]) => void,
  onError?: (error: unknown) => void,
) {
  const ref = doc(getFirestoreDb(), SETTINGS_COLLECTION, CATALOG_SETTINGS_DOC);
  return onSnapshot(
    ref,
    (snapshot) => {
      const data = snapshot.data() as
        { hiddenProductIds?: string[] } | undefined;
      onChange(data?.hiddenProductIds ?? []);
    },
    onError,
  );
}

/** Admin only — hides a pre-installed demo product for everyone (permanent, no undo UI). */
export async function hideStaticProduct(productId: string): Promise<void> {
  const ref = doc(getFirestoreDb(), SETTINGS_COLLECTION, CATALOG_SETTINGS_DOC);
  await setDoc(
    ref,
    { hiddenProductIds: arrayUnion(productId) },
    { merge: true },
  );
}

// ---------------------------------------------------------------------------
// Orders — created by any signed-in shopper on "Buy now". Lifecycle:
//   queued -> confirmed -> delivered   (admin approves, then marks delivered)
//   queued -> declined                 (admin rejects)
//   queued | confirmed -> cancelled    (buyer cancels it themselves)
// `resolvedAt` is stamped the moment a status becomes terminal (declined,
// delivered, cancelled) — it's what the buyer's cart popover uses to know
// when to quietly stop showing a finished order (still-active queued/
// confirmed orders are never time-limited). `hiddenFromBuyerAt` is separate:
// it's only ever set by the buyer's own "clear history" action, and only
// affects what that buyer sees — the admin's view never filters on it.
// ---------------------------------------------------------------------------

export type OrderStatus =
  "queued" | "confirmed" | "declined" | "cancelled" | "delivered";

export const TERMINAL_STATUSES: OrderStatus[] = [
  "declined",
  "cancelled",
  "delivered",
];

export type FirestoreOrder = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  status: OrderStatus;
  buyerEmail: string;
  buyerUid: string;
  buyerName: string | null;
  sellerName: string | null;
  createdAt: Timestamp | null;
  resolvedAt: Timestamp | null;
  hiddenFromBuyerAt: Timestamp | null;
};

export function subscribeToAllOrders(
  onChange: (orders: FirestoreOrder[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(
    collection(getFirestoreDb(), ORDERS_COLLECTION),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => {
        const data = d.data() as Omit<FirestoreOrder, "id">;
        return { ...data, id: d.id } satisfies FirestoreOrder;
      });
      onChange(orders);
    },
    onError,
  );
}

/** Realtime feed of a single buyer's own orders — powers the cart popover + history view. */
export function subscribeToUserOrders(
  email: string,
  onChange: (orders: FirestoreOrder[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(
    collection(getFirestoreDb(), ORDERS_COLLECTION),
    where("buyerEmail", "==", email),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => {
        const data = d.data() as Omit<FirestoreOrder, "id">;
        return { ...data, id: d.id } satisfies FirestoreOrder;
      });
      onChange(orders);
    },
    onError,
  );
}

export type NewOrderInput = {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  buyerEmail: string;
  buyerUid: string;
  buyerName: string | null;
  sellerName: string | null;
};

export async function placeOrder(input: NewOrderInput): Promise<void> {
  await addDoc(collection(getFirestoreDb(), ORDERS_COLLECTION), {
    productId: input.productId,
    productName: input.productName,
    productImage: input.productImage,
    price: input.price,
    status: "queued" satisfies OrderStatus,
    buyerEmail: input.buyerEmail,
    buyerUid: input.buyerUid,
    buyerName: input.buyerName,
    sellerName: input.sellerName,
    createdAt: serverTimestamp(),
    resolvedAt: null,
    hiddenFromBuyerAt: null,
  });
}

/** Admin only — confirm/decline a queued order, or mark a confirmed one delivered. */
export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), ORDERS_COLLECTION, orderId), {
    status,
    resolvedAt: TERMINAL_STATUSES.includes(status) ? serverTimestamp() : null,
  });
}

/** Buyer only — cancel their own order while it's still queued or confirmed. */
export async function cancelOrderAsBuyer(orderId: string): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), ORDERS_COLLECTION, orderId), {
    status: "cancelled" satisfies OrderStatus,
    resolvedAt: serverTimestamp(),
  });
}

/** Buyer only — hides the given orders from their own history view. Admin's view is untouched. */
export async function clearBuyerHistory(orderIds: string[]): Promise<void> {
  if (orderIds.length === 0) return;
  const batch = writeBatch(getFirestoreDb());
  for (const id of orderIds) {
    batch.update(doc(getFirestoreDb(), ORDERS_COLLECTION, id), {
      hiddenFromBuyerAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

// ---------------------------------------------------------------------------
// Push notification tokens — one doc per signed-in device (keyed by uid, so
// re-registering on a later sign-in just overwrites the same doc). Only
// written by the client for their own uid; only read by the admin server
// functions in src/server/push-notify.ts (via firebase-admin, which bypasses
// these rules entirely — this file's own read/write is client-side only).
// ---------------------------------------------------------------------------

const PUSH_TOKENS_COLLECTION = "pushTokens";

export async function savePushToken(
  uid: string,
  token: string,
  email: string | null,
): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), PUSH_TOKENS_COLLECTION, uid),
    { token, email, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

// ---------------------------------------------------------------------------
// User profiles — one doc per signed-in account (keyed by uid), written
// incrementally by the onboarding flow as the person completes each step,
// and read to decide whether onboarding needs to run at all.
// `onboardingComplete` is the single source of truth for that decision —
// deliberately not "does the doc exist", since a half-finished onboarding
// (tab closed mid-flow) still has a doc, just with onboardingComplete still
// false and `lastStep` pointing at wherever they left off, so re-opening the
// app resumes instead of restarting from the top.
// ---------------------------------------------------------------------------

const USERS_COLLECTION = "users";

export type OnboardingStep =
  | "start-button"
  | "username"
  | "location"
  | "phone"
  | "terms"
  | "business-question"
  | "business-name"
  | "sell-question"
  | "seller-contact"
  | "seller-submitted"
  | "completed";

export type UserProfile = {
  uid: string;
  email: string | null;
  username: string | null;
  districtId: string | null;
  districtName: string | null;
  ward: string | null;
  phone: string | null;
  hasAgreedTerms: boolean;
  ownsBusiness: boolean | null;
  businessName: string | null;
  wantsToSell: boolean | null;
  sellerEmail: string | null;
  sellerPhone: string | null;
  theme: "light" | "dark" | null;
  onboardingComplete: boolean;
  lastStep: OnboardingStep;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

/** Realtime subscription to one account's profile — null until the doc exists. */
export function subscribeToUserProfile(
  uid: string,
  onChange: (profile: UserProfile | null) => void,
  onError?: (error: unknown) => void,
) {
  return onSnapshot(
    doc(getFirestoreDb(), USERS_COLLECTION, uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      onChange({
        ...(snapshot.data() as Omit<UserProfile, "uid">),
        uid: snapshot.id,
      });
    },
    onError,
  );
}

/**
 * Creates the profile doc the moment a person authenticates with no existing
 * profile — stamps `createdAt` exactly once. Safe to call even if the doc
 * already exists (merge: true just leaves the existing createdAt alone
 * since we don't pass it again here).
 */
export async function ensureUserProfileShell(
  uid: string,
  email: string | null,
): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), USERS_COLLECTION, uid),
    {
      uid,
      email,
      onboardingComplete: false,
      lastStep: "start-button" satisfies OnboardingStep,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Writes one onboarding step's worth of data to the profile doc, merging
 * rather than overwriting so earlier steps' fields survive. Called after
 * every step the person completes — not just once at the end — so progress
 * is never lost if they close the tab partway through. Never touches
 * `createdAt` (set once, by ensureUserProfileShell above).
 */
export async function saveOnboardingStep(
  uid: string,
  email: string | null,
  patch: Partial<Omit<UserProfile, "uid" | "createdAt" | "updatedAt">>,
): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), USERS_COLLECTION, uid),
    {
      uid,
      email,
      ...patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// ---------------------------------------------------------------------------
// Shared placeholders (same look as the old vanilla-JS placeholders, so
// admin-posted products without an uploaded image still render sensibly).
// ---------------------------------------------------------------------------

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#cfd3da"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#808693" text-anchor="middle" dy=".3em">No image</text></svg>',
  );

export const PLACEHOLDER_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" rx="20" fill="#111214"/><text x="50%" y="54%" font-family="sans-serif" font-size="16" fill="#fff" text-anchor="middle" dy=".3em">U</text></svg>',
  );
