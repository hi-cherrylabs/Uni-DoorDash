import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
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
// Orders — created by any signed-in shopper on "Buy now", read by the admin
// on the dashboard's Order Progress tab (and, implicitly, only ever queried
// for a single buyer's own email elsewhere — see security rules).
// ---------------------------------------------------------------------------

export type OrderStatus = "queued" | "confirmed" | "declined";

export type FirestoreOrder = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  status: OrderStatus;
  buyerEmail: string;
  buyerName: string | null;
  createdAt: Timestamp | null;
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

export type NewOrderInput = {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  buyerEmail: string;
  buyerName: string | null;
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
    createdAt: serverTimestamp(),
  });
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(getFirestoreDb(), ORDERS_COLLECTION, orderId), { status });
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
