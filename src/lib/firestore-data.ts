import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  doc,
  where,
  Timestamp,
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
  const q = query(collection(getFirestoreDb(), PRODUCTS_COLLECTION), orderBy("createdAt", "desc"));
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

export type OrderStatus = "queued" | "confirmed" | "declined" | "cancelled" | "delivered";

export const TERMINAL_STATUSES: OrderStatus[] = ["declined", "cancelled", "delivered"];

export type FirestoreOrder = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  status: OrderStatus;
  buyerEmail: string;
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
  const q = query(collection(getFirestoreDb(), ORDERS_COLLECTION), orderBy("createdAt", "desc"));
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
    buyerName: input.buyerName,
    sellerName: input.sellerName,
    createdAt: serverTimestamp(),
    resolvedAt: null,
    hiddenFromBuyerAt: null,
  });
}

/** Admin only — confirm/decline a queued order, or mark a confirmed one delivered. */
export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
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
    batch.update(doc(getFirestoreDb(), ORDERS_COLLECTION, id), { hiddenFromBuyerAt: serverTimestamp() });
  }
  await batch.commit();
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
