import { createFileRoute } from "@tanstack/react-router";
import { Clock, Heart, Search } from "lucide-react";
import { type CSSProperties, useMemo, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { CommunityListings } from "@/components/home/community-listings";
import { ProductCard } from "@/components/home/product-card";
import { SegmentedControl } from "@/components/segmented-control";
import { useTheme } from "@/components/theme-provider";
import { CATEGORIES, PRODUCTS } from "@/data/catalog";
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

  const sections = useMemo(
    () =>
      CATEGORIES.filter((category) => filter === "All" || filter === category)
        .map((category) => ({
          category,
          items: PRODUCTS.filter(
            (product) =>
              product.category === category && product.name.toLowerCase().includes(query.toLowerCase()),
          ),
        }))
        .filter((section) => section.items.length > 0),
    [query, filter],
  );

  return (
    <AppLayout>
      <div className="relative flex h-[220px] items-center justify-center overflow-hidden sm:h-[280px] md:h-[340px]">
        <img
          src={marketHero}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto h-[200px] w-auto select-none object-contain opacity-90 sm:h-[280px] md:h-[360px]"
          style={{
            filter: dark
              ? "drop-shadow(0 20px 60px rgba(255,255,255,0.08))"
              : "drop-shadow(0 30px 60px rgba(0,0,0,0.12))",
          }}
        />
        <h1
          className="relative px-2 text-center text-[36px] font-extrabold uppercase leading-none tracking-tight sm:text-[56px] md:text-[84px] lg:text-[108px]"
          style={{
            color: "transparent",
            WebkitTextStroke: dark ? "2px #ffffff" : "2.5px #111111",
            textShadow: dark ? "0 6px 30px rgba(255,255,255,0.15)" : "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          Market Place
        </h1>
      </div>

      <div className="mx-auto mt-8 max-w-3xl" style={{ "--search-bg": "var(--app-main-flat)" } as CSSProperties}>
        <div className="rainbow-beam">
          <div className="flex h-16 items-center gap-4 rounded-full px-6" style={{ backgroundColor: "var(--app-main-flat)" }}>
            <Search className="size-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the market place…"
              className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            />
            <span className="hidden shrink-0 text-xs uppercase tracking-widest text-muted-foreground sm:block">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-4">
        <button
          type="button"
          className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)" }}
        >
          <Heart className="size-7 text-white" />
          <span className="text-sm font-bold text-white">Favourites</span>
        </button>
        <button
          type="button"
          className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-border"
          style={{ backgroundColor: "var(--app-main-flat)" }}
        >
          <Clock className="size-7 text-muted-foreground" />
          <span className="text-sm font-bold">Recent purchased</span>
        </button>
      </div>

      <section className="mt-12">
        <CommunityListings
          title="Community Listings"
          emptyHint="Products posted from the seller dashboard will show up here."
        />

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
