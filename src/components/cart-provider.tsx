import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

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
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
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

  const value = useMemo(
    () => ({ open, setOpen, pulse, markInteracted }),
    [open, setOpen, pulse, markInteracted],
  );

  return <CartUIContext.Provider value={value}>{children}</CartUIContext.Provider>;
}

export function useCartUI(): CartUIContextValue {
  const ctx = useContext(CartUIContext);
  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");
  return ctx;
}
