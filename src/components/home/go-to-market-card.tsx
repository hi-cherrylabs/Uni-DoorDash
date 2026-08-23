import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

export function GoToMarketCard() {
  return (
    <Link
      to="/market-place"
      className="flex w-56 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed text-center shadow-lg transition-colors hover:bg-accent sm:w-64"
      style={{ aspectRatio: "4 / 5", borderColor: "var(--border)" }}
    >
      <span className="grid size-12 place-items-center rounded-full bg-accent">
        <Store className="size-6" />
      </span>
      <span className="px-4 text-sm font-semibold">Go to market place</span>
    </Link>
  );
}
