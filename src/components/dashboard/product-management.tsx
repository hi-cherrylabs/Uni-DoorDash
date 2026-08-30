import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Timestamp } from "firebase/firestore";

import { PRODUCTS } from "@/data/catalog";
import {
  useHiddenStaticProductIds,
  useLiveProducts,
} from "@/hooks/use-products";
import {
  deleteProduct,
  hideStaticProduct,
  subscribeToAllOrders,
  type FirestoreOrder,
} from "@/lib/firestore-data";

type ManagedProduct = {
  id: string;
  name: string;
  image: string;
  category: string;
  postedLabel: string;
  /** Firestore-native products can be hard-deleted; seed-catalog demo
   * products get hidden instead (see firestore-data.ts for why). */
  kind: "live" | "static";
};

function formatDate(ts: Timestamp | null): string {
  if (!ts) return "Just now";
  return ts.toDate().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProductManagement() {
  const liveProducts = useLiveProducts();
  const hiddenIds = useHiddenStaticProductIds();
  const [orders, setOrders] = useState<FirestoreOrder[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(
      (list) => setOrders(list),
      () => setOrders((prev) => prev ?? []),
    );
    return unsubscribe;
  }, []);

  const orderCountFor = (productId: string): number =>
    (orders ?? []).filter((o) => o.productId === productId).length;

  const managed: ManagedProduct[] = [
    ...liveProducts.map((p): ManagedProduct => ({
      id: p.id,
      name: p.name,
      image: p.image,
      category: p.category,
      postedLabel: `Posted ${formatDate(p.createdAt)}`,
      kind: "live",
    })),
    ...PRODUCTS.filter((p) => !hiddenIds.has(p.id)).map(
      (p): ManagedProduct => ({
        id: p.id,
        name: p.name,
        image: p.image,
        category: p.category,
        postedLabel: "Pre-installed demo product",
        kind: "static",
      }),
    ),
  ];

  async function handleDelete(product: ManagedProduct) {
    setBusyId(product.id);
    try {
      if (product.kind === "live") {
        await deleteProduct(product.id);
      } else {
        await hideStaticProduct(product.id);
      }
      toast.success(`${product.name} removed from the website.`);
    } catch {
      toast.error("Couldn't remove that product. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (managed.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-muted-foreground">
        No products to manage yet.
      </p>
    );
  }

  return (
    <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3">
      {managed.map((product) => (
        <div
          key={`${product.kind}-${product.id}`}
          className="flex items-center gap-4 rounded-2xl p-4 shadow-md"
          style={{ backgroundColor: "var(--app-main-flat)" }}
        >
          <img
            src={product.image}
            alt=""
            className="size-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{product.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {product.category} · {product.postedLabel} ·{" "}
              {orderCountFor(product.id)} order
              {orderCountFor(product.id) === 1 ? "" : "s"} since posted
            </p>
          </div>
          <button
            type="button"
            title="Delete product"
            disabled={busyId === product.id}
            onClick={() => void handleDelete(product)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
