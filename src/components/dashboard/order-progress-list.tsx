import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { subscribeToAllOrders, setOrderStatus, type FirestoreOrder } from "@/lib/firestore-data";

const STATUS_LABEL: Record<FirestoreOrder["status"], string> = {
  queued: "Pending confirmation",
  confirmed: "Confirmed — awaiting delivery",
  declined: "Declined",
};

export function OrderProgressList() {
  const [orders, setOrders] = useState<FirestoreOrder[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders(
      (list) => setOrders(list),
      () => setOrders((prev) => prev ?? []),
    );
    return unsubscribe;
  }, []);

  async function updateStatus(orderId: string, status: FirestoreOrder["status"]) {
    setBusyId(orderId);
    try {
      await setOrderStatus(orderId, status);
    } catch {
      toast.error("Couldn't update that order. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (orders === null) {
    return <p className="mt-8 text-center text-sm text-muted-foreground">Loading orders…</p>;
  }

  if (orders.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-muted-foreground">
        No orders yet — they'll show up here as soon as someone buys.
      </p>
    );
  }

  return (
    <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center gap-4 rounded-2xl p-4 shadow-md"
          style={{ backgroundColor: "var(--app-main-flat)" }}
        >
          <img
            src={order.productImage}
            alt=""
            className="size-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{order.productName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {order.buyerEmail} · Tsh {order.price.toLocaleString()} · {STATUS_LABEL[order.status]}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              title="Confirm"
              disabled={busyId === order.id || order.status === "confirmed"}
              onClick={() => void updateStatus(order.id, "confirmed")}
              className="grid size-9 place-items-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "var(--cherry-deep)" }}
            >
              <Check className="size-4" />
            </button>
            <button
              type="button"
              title="Decline"
              disabled={busyId === order.id || order.status === "declined"}
              onClick={() => void updateStatus(order.id, "declined")}
              className="grid size-9 place-items-center rounded-full border border-border transition-colors hover:bg-accent disabled:opacity-40"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
