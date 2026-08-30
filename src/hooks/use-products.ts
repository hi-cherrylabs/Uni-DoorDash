import { useEffect, useState } from "react";

import { PRODUCTS, type Product } from "@/data/catalog";
import {
  subscribeToHiddenStaticProductIds,
  subscribeToProducts,
  type FirestoreProduct,
} from "@/lib/firestore-data";

/** Realtime feed of admin-posted products. */
export function useLiveProducts(): FirestoreProduct[] {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  useEffect(() => {
    const unsubscribe = subscribeToProducts(setProducts, () =>
      setProducts((prev) => prev),
    );
    return unsubscribe;
  }, []);
  return products;
}

/** Ids of seed-catalog demo products the admin has hidden (deleted) — see firestore-data.ts. */
export function useHiddenStaticProductIds(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    const unsubscribe = subscribeToHiddenStaticProductIds(
      (list) => setIds(new Set(list)),
      () => {},
    );
    return unsubscribe;
  }, []);
  return ids;
}

/**
 * The full product catalog as every visitor should see it: the static seed
 * catalog (minus anything the admin has hidden) plus every live,
 * admin-posted product — all in one flat list, ready to be grouped by
 * category. This is the single source of truth both Home and Market Place
 * should group by category — using this instead of the raw PRODUCTS array
 * directly is what makes a posted product actually land in the category the
 * admin picked, instead of a separate "Community Listings" bucket.
 */
export function useAllVisibleProducts(): Product[] {
  const live = useLiveProducts();
  const hiddenIds = useHiddenStaticProductIds();
  const visibleStatic = PRODUCTS.filter((p) => !hiddenIds.has(p.id));
  return [...live, ...visibleStatic];
}
