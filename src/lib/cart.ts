// Cart stays client-local (same as before) — it's pre-checkout scratch
// state, not something that needs to sync anywhere. Only a placed *order*
// needs to be durable and visible to the admin, which is why that part
// moved to Firestore (see firestore-data.ts) and this didn't.

const LS_CART = "udd_cart";

export type CartLine = { productId: string; qty: number };

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(LS_CART);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(LS_CART, JSON.stringify(lines));
  } catch {
    /* ignore (private browsing / storage full) */
  }
}

export function addToCart(productId: string) {
  const cart = readCart();
  const existing = cart.find((line) => line.productId === productId);
  if (existing) existing.qty += 1;
  else cart.push({ productId, qty: 1 });
  writeCart(cart);
}
