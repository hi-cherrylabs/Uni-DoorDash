import { AnimatePresence, motion } from "framer-motion";
import { Check, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Timestamp } from "firebase/firestore";

import { useAuth } from "@/components/auth-provider";
import { useCartUI } from "@/components/cart-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  cancelOrderAsBuyer,
  clearBuyerHistory,
  subscribeToUserOrders,
  type FirestoreOrder,
  type OrderStatus,
} from "@/lib/firestore-data";

const DAY_MS = 24 * 60 * 60 * 1000;
type Tab = "Pending" | "On progress";

/** Still-active orders (queued/confirmed) never expire from the popover.
 * Finished orders (declined/cancelled/delivered) stay visible for 24h after
 * resolution, then quietly stop showing here — though they remain in
 * History permanently, and remain permanently visible to the admin. */
function isRecent(order: FirestoreOrder): boolean {
  const ts = order.resolvedAt?.toMillis();
  if (ts == null) return true;
  return Date.now() - ts < DAY_MS;
}

function formatDate(ts: Timestamp | null): string {
  if (!ts) return "Just now";
  return ts
    .toDate()
    .toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  queued: "Awaiting approval",
  confirmed: "On the way",
  declined: "Declined",
  cancelled: "Cancelled",
  delivered: "Delivered",
};

const OPTIMISTIC_ID_PREFIX = "optimistic-";

export function CartMenu({
  size = 44,
  variant = "filled",
}: {
  size?: number;
  variant?: "filled" | "minimal";
}) {
  const { user } = useAuth();
  const { open, setOpen, markInteracted, optimisticOrders } = useCartUI();
  const [orders, setOrders] = useState<FirestoreOrder[] | null>(null);
  const [view, setView] = useState<"list" | "history">("list");
  const [tab, setTab] = useState<Tab>("Pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setOrders(null);
      return;
    }
    const unsubscribe = subscribeToUserOrders(
      user.email,
      (list) => setOrders(list),
      () => setOrders((prev) => prev ?? []),
    );
    return unsubscribe;
  }, [user?.email]);

  useEffect(() => {
    if (!open) setView("list");
  }, [open]);

  if (!user) return null;

  const isMobile = useIsMobile();
  const active = variant === "minimal" ? isMobile : !isMobile;

  const buttonEl = (
    <button
      type="button"
      title="Your orders"
      className={
        variant === "minimal"
          ? "grid place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
          : "grid place-items-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
      }
      style={
        variant === "minimal"
          ? { width: size, height: size }
          : { backgroundColor: "var(--cherry-deep)", width: size, height: size }
      }
    >
      <Truck className={variant === "minimal" ? "size-[60%]" : "size-1/2"} />
    </button>
  );

  if (!active) {
    return buttonEl;
  }

  const real = orders ?? [];
  // Once the real order (matching productId, placed in roughly the same
  // window) shows up via onSnapshot, stop showing its optimistic stand-in
  // — avoids a brief duplicate row while both are technically present.
  const optimisticDisplay: FirestoreOrder[] = optimisticOrders
    .filter(
      (o) =>
        !real.some(
          (r) =>
            r.productId === o.productId &&
            Math.abs((r.createdAt?.toMillis() ?? 0) - o.createdAtMs) < 20000,
        ),
    )
    .map((o) => ({
      id: `${OPTIMISTIC_ID_PREFIX}${o.tempId}`,
      productId: o.productId,
      productName: o.productName,
      productImage: o.productImage,
      price: o.price,
      status: "queued",
      buyerEmail: user.email ?? "",
      buyerUid: user.uid,
      buyerName: user.name,
      sellerName: o.sellerName,
      createdAt: null,
      resolvedAt: null,
      hiddenFromBuyerAt: null,
    }));

  const all = [...optimisticDisplay, ...real];
  const pending = all.filter(
    (o) =>
      o.status === "queued" ||
      ((o.status === "declined" || o.status === "cancelled") && isRecent(o)),
  );
  const progress = all.filter(
    (o) =>
      o.status === "confirmed" || (o.status === "delivered" && isRecent(o)),
  );
  const history = real.filter((o) => !o.hiddenFromBuyerAt);
  const hasAnyActive = pending.length > 0 || progress.length > 0;
  const activeList = tab === "Pending" ? pending : progress;

  async function handleCancel(orderId: string) {
    setBusyId(orderId);
    try {
      await cancelOrderAsBuyer(orderId);
    } catch {
      toast.error("Couldn't cancel that order. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleClearHistory() {
    try {
      await clearBuyerHistory(history.map((o) => o.id));
      toast("History cleared.");
    } catch {
      toast.error("Couldn't clear history. Please try again.");
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Your orders"
          className={
            variant === "minimal"
              ? "grid place-items-center rounded-full text-foreground transition-colors hover:bg-accent"
              : "grid place-items-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
          }
          style={
            variant === "minimal"
              ? { width: size, height: size }
              : {
                  backgroundColor: "var(--cherry-deep)",
                  width: size,
                  height: size,
                }
          }
        >
          <Truck
            className={variant === "minimal" ? "size-[60%]" : "size-1/2"}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        onClick={markInteracted}
        className="glass-panel max-h-[70vh] w-80 overflow-hidden"
      >
        <AnimatePresence mode="wait" initial={false}>
          {view === "history" ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
                <p className="text-sm font-bold">History</p>
                <span className="w-8" />
              </div>
              <div className="no-scrollbar mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
                {history.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No history yet.
                  </p>
                )}
                {history.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 rounded-2xl border p-3"
                    style={{ borderColor: "rgba(22,24,28,0.12)" }}
                  >
                    <img
                      src={order.productImage}
                      alt=""
                      className="size-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">
                        {order.productName}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {formatDate(order.createdAt)} ·{" "}
                        {STATUS_LABEL[order.status]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleClearHistory()}
                  className="glass-button-light mt-4 w-full rounded-full py-2 text-xs font-bold"
                >
                  Clear history
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
            >
              {!hasAnyActive ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div
                    className="relative grid size-14 place-items-center rounded-full"
                    style={{ backgroundColor: "rgba(22,24,28,0.06)" }}
                  >
                    <Truck className="size-7 text-muted-foreground" />
                    <span className="absolute h-[2px] w-9 rotate-45 bg-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold">No recent orders</p>
                </div>
              ) : (
                <>
                  <div
                    className="flex gap-1 rounded-full p-1"
                    style={{ backgroundColor: "#111214" }}
                  >
                    {(["Pending", "On progress"] as Tab[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTab(option)}
                        className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-colors ${
                          tab === option
                            ? "bg-white text-[#111214]"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    {activeList.length === 0 && (
                      <p className="py-6 text-center text-xs text-muted-foreground">
                        Nothing here right now.
                      </p>
                    )}
                    {activeList.map((order) => {
                      const isOptimistic =
                        order.id.startsWith(OPTIMISTIC_ID_PREFIX);
                      const isActionable =
                        !isOptimistic &&
                        (order.status === "queued" ||
                          order.status === "confirmed");
                      const isFlagged =
                        order.status === "declined" ||
                        order.status === "cancelled";
                      const isSuccess = order.status === "delivered";
                      return (
                        <div
                          key={order.id}
                          className="flex items-center gap-3 rounded-2xl border p-3"
                          style={{
                            borderColor: isFlagged
                              ? "rgba(239,68,68,0.4)"
                              : isSuccess
                                ? "rgba(16,185,129,0.4)"
                                : "rgba(22,24,28,0.12)",
                            backgroundColor: isFlagged
                              ? "rgba(239,68,68,0.08)"
                              : isSuccess
                                ? "rgba(16,185,129,0.08)"
                                : undefined,
                            opacity: isOptimistic ? 0.75 : 1,
                          }}
                        >
                          <img
                            src={order.productImage}
                            alt=""
                            className="size-11 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold">
                              {order.productName}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {formatDate(order.createdAt)} ·{" "}
                              {order.sellerName ?? "Uni Door Dash"}
                            </p>
                            <p className="truncate text-[11px] font-semibold">
                              {isOptimistic
                                ? "Placing order…"
                                : STATUS_LABEL[order.status]}
                            </p>
                          </div>
                          {isOptimistic && (
                            <span
                              className="size-4 shrink-0 animate-spin rounded-full border-2 border-t-transparent"
                              style={{
                                borderColor: "rgba(22,24,28,0.25)",
                                borderTopColor: "transparent",
                              }}
                            />
                          )}
                          {!isOptimistic && order.status === "confirmed" && (
                            <span
                              className="size-4 shrink-0 animate-spin rounded-full border-2 border-t-transparent"
                              style={{
                                borderColor: "rgba(22,24,28,0.25)",
                                borderTopColor: "transparent",
                              }}
                            />
                          )}
                          {isActionable && (
                            <div className="flex shrink-0 gap-1.5">
                              <button
                                type="button"
                                disabled={busyId === order.id}
                                onClick={() => void handleCancel(order.id)}
                                title="Cancel order"
                                className="grid size-7 place-items-center rounded-full bg-red-500 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                              >
                                <X className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  toast(
                                    "Approving orders is for the admin only.",
                                  )
                                }
                                title="Awaiting admin approval"
                                className="grid size-7 place-items-center rounded-full text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: "#111214" }}
                              >
                                <Check className="size-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => setView("history")}
                className="glass-button-light mt-4 w-full rounded-full py-2 text-xs font-bold"
              >
                View history
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}
