import { useEffect, useState } from "react";

import { ProductCard } from "@/components/home/product-card";
import { subscribeToProducts, type FirestoreProduct } from "@/lib/firestore-data";

/**
 * Admin-posted products, live from Firestore. Used on both Home (capped to
 * the newest few, under "What's New") and Market Place (the full list,
 * under "Community Listings") — same data source, same <ProductCard/>.
 */
export function CommunityListings({
  title,
  limit,
  emptyHint,
}: {
  title: string;
  limit?: number;
  emptyHint?: string;
}) {
  const [products, setProducts] = useState<FirestoreProduct[] | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (list) => setProducts(list),
      () => setProducts((prev) => prev ?? []),
    );
    return unsubscribe;
  }, []);

  // Still loading (first paint / before Firestore responds) — render
  // nothing rather than an empty-state flash.
  if (products === null) return null;

  const items = typeof limit === "number" ? products.slice(0, limit) : products;

  if (items.length === 0) {
    if (!emptyHint) return null;
    return (
      <div className="mb-8 last:mb-0">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="mb-8 last:mb-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
