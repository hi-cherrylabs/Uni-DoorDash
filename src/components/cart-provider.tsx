import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

/**
 * A locally-constructed stand-in for an order that's been submitted but
 * hasn't been confirmed by the server yet. Exists purely so the cart
 * popover can show *something* the instant a buyer places an order,
 * instead of a real empty-state flash while the network round-trip is in
 * flight — which is especially noticeable on slower connections.
 */
export type OptimisticOrder = {
  tempId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  sellerName: string | null;
  createdAtMs: number;
};

type CartUIContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Opens the cart for 3s and auto-closes — UNLESS the user interacts with
   * it in the meantime (see markInteracted), in which case it just stays
   * open like a normal manual open. Called right after an order is placed. */
  pulse: () => void;
  /** Cancels any pending auto-close. Call this on any click inside the
   * popover's content. */
  markInteracted: () => void;
  optimisticOrders: OptimisticOrder[];
  /** Call BEFORE awaiting the real Firestore write. Returns a tempId to
   * pass to removeOptimisticOrder once the real write settles (success or
   * failure) — the cart popover shows this immediately in the meantime. */
  addOptimisticOrder: (
    order: Omit<OptimisticOrder, "tempId" | "createdAtMs">,
  ) => string;
  removeOptimisticOrder: (tempId: string) => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [optimisticOrders, setOptimisticOrders] = useState<OptimisticOrder[]>(
    [],
  );
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setOpen = useCallback(
    (next: boolean) => {
      clearTimer();
      setOpenState(next);
    },
    [clearTimer],
  );

  const pulse = useCallback(() => {
    clearTimer();
    setOpenState(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setOpenState(false);
    }, 3000);
  }, [clearTimer]);

  const markInteracted = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const addOptimisticOrder = useCallback(
    (order: Omit<OptimisticOrder, "tempId" | "createdAtMs">) => {
      const tempId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setOptimisticOrders((prev) => [
        { ...order, tempId, createdAtMs: Date.now() },
        ...prev,
      ]);
      // Safety net: even if removeOptimisticOrder is never called for some
      // reason (a swallowed error, a race), don't let a placeholder linger
      // forever — by 12s the real onSnapshot update should long since have
      // arrived in any normal network condition.
      window.setTimeout(() => {
        setOptimisticOrders((prev) => prev.filter((o) => o.tempId !== tempId));
      }, 12000);
      return tempId;
    },
    [],
  );

  const removeOptimisticOrder = useCallback((tempId: string) => {
    setOptimisticOrders((prev) => prev.filter((o) => o.tempId !== tempId));
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      pulse,
      markInteracted,
      optimisticOrders,
      addOptimisticOrder,
      removeOptimisticOrder,
    }),
    [
      open,
      setOpen,
      pulse,
      markInteracted,
      optimisticOrders,
      addOptimisticOrder,
      removeOptimisticOrder,
    ],
  );

  return (
    <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>
  );
}

export function useCartUI(): CartUIContextValue {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");
  return ctx;
}
