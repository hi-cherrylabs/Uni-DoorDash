import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";
import { placeOrder } from "@/lib/firestore-data";
import type { Product } from "@/data/catalog";

export function OrderConfirmDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!product) return null;

  async function handleConfirm() {
    if (!user?.email) return; // guarded by caller, but keep TS + runtime honest
    setPlacing(true);
    try {
      await placeOrder({
        productId: product!.id,
        productName: product!.name,
        productImage: product!.image,
        price: product!.price,
        buyerEmail: user.email,
        buyerName: user.name,
      });
      setPlaced(true);
      setTimeout(() => {
        onOpenChange(false);
        setPlaced(false);
      }, 1300);
    } catch {
      toast.error("Couldn't place that order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !placing && onOpenChange(next)}>
      <DialogContent className="glass-card text-center">
        {placed ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="grid size-14 place-items-center rounded-full bg-accent text-2xl">✅</div>
            <p className="text-lg font-bold">Your order is queued</p>
            <p className="text-sm text-muted-foreground">We'll keep you posted on {product.name}.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 pt-1">
              <div className="grid size-14 place-items-center rounded-full bg-accent text-2xl">🛍️</div>
              <p className="text-lg font-bold">Place this order?</p>
              <p className="text-sm text-muted-foreground">
                {product.name} — Tsh {product.price.toLocaleString()}
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={placing}
                onClick={() => void handleConfirm()}
                className="rounded-full py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)" }}
              >
                {placing ? "Placing order…" : "Confirm to place order — Cash on delivery"}
              </button>
              <button
                type="button"
                disabled={placing}
                onClick={() => onOpenChange(false)}
                className="rounded-full border border-border py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
