import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/data/catalog";
import { useAuth } from "@/components/auth-provider";
import { addToCart } from "@/lib/cart";
import { OrderConfirmDialog } from "@/components/order-confirm-dialog";

export function ProductCard({ product }: { product: Product }) {
  const { ready, user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Auth is required to buy or add to cart, but — per product decision —
  // nothing here ever auto-opens the sign-in card. If someone's signed
  // out, we just tell them so via a toast; they sign in from the account
  // button whenever they're ready.
  function requireSignedIn(): boolean {
    if (!ready) return false;
    if (!user) {
      toast("Sign in to continue — tap the account icon.");
      return false;
    }
    return true;
  }

  function handleAddToCart() {
    if (!requireSignedIn()) return;
    addToCart(product.id);
    toast("Added to cart.");
  }

  function handleBuyNow() {
    if (!requireSignedIn()) return;
    setConfirmOpen(true);
  }

  return (
    <article className="w-56 shrink-0 sm:w-64">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-lg">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <button
          type="button"
          title="Add to cart"
          onClick={handleAddToCart}
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-black/60"
        >
          <ShoppingCart className="size-4" />
        </button>
      </div>
      <div className="mt-3">
        <h3 className="truncate text-sm font-bold">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="size-5 shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-[11px] text-muted-foreground">{product.seller.name}</span>
          </div>
          <span className="shrink-0 text-sm font-bold">${product.price}</span>
        </div>
        <button
          type="button"
          onClick={handleBuyNow}
          className="mt-2 w-full rounded-full bg-cherry-deep py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          Buy now
        </button>
      </div>

      <OrderConfirmDialog product={product} open={confirmOpen} onOpenChange={setConfirmOpen} />
    </article>
  );
}
