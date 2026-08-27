import { Check, PackageCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getFirebaseAuth } from "@/lib/firebase";
import { subscribeToAllOrders, setOrderStatus, type FirestoreOrder } from "@/lib/firestore-data";
import { notifyBuyer } from "@/server/push-notify";

const STATUS_LABEL: Record<FirestoreOrder["status"], string> = {
  queued: "Pending confirmation",
  confirmed: "Confirmed — out for delivery",
  declined: "Declined",
  cancelled: "Cancelled by buyer",
  delivered: "Delivered",
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

  async function updateStatus(order: FirestoreOrder, status: FirestoreOrder["status"]) {
    setBusyId(order.id);
    try {
      await setOrderStatus(order.id, status);

      // Only "delivery accepted" (confirmed) gets a push, per the intended
      // trigger list — best-effort, never blocks the status update itself,
      // which has already succeeded by this point.
      if (status === "confirmed") {
        void (async () => {
          try {
            const idToken = await getFirebaseAuth().currentUser?.getIdToken();
            if (!idToken) return;
            await notifyBuyer({
              data: {
                idToken,
                buyerUid: order.buyerUid,
                title: "Your order was accepted",
                body: `${order.productName} is on its way.`,
              },
            });
          } catch {
            /* silent — see comment above */
          }
        })();
      }
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
      {orders.map((order) => {
        const busy = busyId === order.id;
        return (
          <div
            key={order.id}
            className="flex items-center gap-4 rounded-2xl p-4 shadow-md"
            style={{ backgroundColor: "var(--app-main-flat)" }}
          >
            <img src={order.productImage} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{order.productName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {order.buyerEmail} · Tsh {order.price.toLocaleString()} · {STATUS_LABEL[order.status]}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {order.status === "queued" && (
                <>
                  <button
                    type="button"
                    title="Confirm"
                    disabled={busy}
                    onClick={() => void updateStatus(order, "confirmed")}
                    className="grid size-9 place-items-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ backgroundColor: "var(--cherry-deep)" }}
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    type="button"
                    title="Decline"
                    disabled={busy}
                    onClick={() => void updateStatus(order, "declined")}
                    className="grid size-9 place-items-center rounded-full border border-border transition-colors hover:bg-accent disabled:opacity-40"
                  >
                    <X className="size-4" />
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button
                  type="button"
                  title="Mark delivered"
                  disabled={busy}
                  onClick={() => void updateStatus(order, "delivered")}
                  className="grid size-9 place-items-center rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: "var(--cherry-deep)" }}
                >
                  <PackageCheck className="size-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
