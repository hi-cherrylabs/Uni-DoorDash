import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { ProductCard } from "@/components/home/product-card";
import { SegmentedControl } from "@/components/segmented-control";
import { useTheme } from "@/components/theme-provider";
import { CATEGORIES } from "@/data/catalog";
import { useAllVisibleProducts } from "@/hooks/use-products";
import marketHero from "@/assets/udd-market.png";

export const Route = createFileRoute("/market-place")({
  head: () => ({
    meta: [
      { title: "Market Place — Uni Door Dash" },
      {
        name: "description",
        content: "Browse the full Uni Door Dash Market Place — every seller, every category, in one place.",
      },
      { property: "og:title", content: "Market Place — Uni Door Dash" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketPlacePage,
});

const FILTER_OPTIONS = ["All", ...CATEGORIES];

function MarketPlacePage() {
  const { dark } = useTheme();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>(FILTER_OPTIONS[0] ?? "All");
  const allProducts = useAllVisibleProducts();

  const sections = useMemo(
    () =>
      CATEGORIES.filter((category) => filter === "All" || filter === category)
        .map((category) => ({
          category,
          items: allProducts.filter(
            (product) =>
              product.category === category && product.name.toLowerCase().includes(query.toLowerCase()),
          ),
        }))
        .filter((section) => section.items.length > 0),
    [allProducts, query, filter],
  );

  return (
    <AppLayout>
      <div className="relative flex h-[220px] items-center justify-center overflow-hidden sm:h-[280px] md:h-[340px]">
        <img
          src={marketHero}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto h-[160px] w-auto select-none object-contain opacity-90 sm:h-[224px] md:h-[288px]"
        />
        <h1
          className="relative px-2 text-center text-[36px] font-extrabold uppercase leading-none tracking-tight sm:text-[56px] md:text-[84px] lg:text-[108px]"
          style={{
            color: "transparent",
            WebkitTextStroke: dark ? "2px #ffffff" : "2.5px #111111",
            textShadow: dark ? "0 0 4px rgba(255,255,255,0.35)" : "0 0 4px rgba(0,0,0,0.25)",
          }}
        >
          Market Place
        </h1>
      </div>

      <div
        className="mx-auto mt-8 max-w-xl px-4"
        style={{ "--search-bg": "var(--app-main-flat)" } as CSSProperties}
      >
        <div className="rainbow-beam-search">
          <div
            className="flex h-11 items-center gap-3 px-5"
            style={{ backgroundColor: "var(--app-main-flat)", borderRadius: "inherit" }}
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the market place…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </div>

      <section className="mt-8">
        {sections.map(({ category, items }) => (
          <div key={category} className="mb-8 last:mb-0">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{category}</h3>
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">Nothing here yet — try another search or filter.</p>
        )}
      </section>
    </AppLayout>
  );
}
