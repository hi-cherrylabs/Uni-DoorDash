import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { GoToMarketCard } from "@/components/home/go-to-market-card";
import { ProductCard } from "@/components/home/product-card";
import { ADS, CATEGORIES, FILTER_CHIPS } from "@/data/catalog";
import { useAllVisibleProducts } from "@/hooks/use-products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uni Door Dash Store — Perfumes, clothing & more" },
      {
        name: "description",
        content:
          "Shop Uni Door Dash: hand-picked perfumes, clothing, accessories and home goods from independent sellers.",
      },
      {
        property: "og:title",
        content: "Uni Door Dash Store — Perfumes, clothing & more",
      },
      {
        property: "og:description",
        content:
          "Hand-picked perfumes, clothing, accessories and home goods from independent sellers on Uni Door Dash.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [activeChip, setActiveChip] = useState(FILTER_CHIPS[0]);
  const [query, setQuery] = useState("");
  const allProducts = useAllVisibleProducts();

  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        items: allProducts.filter(
          (product) =>
            product.category === category &&
            product.name.toLowerCase().includes(query.toLowerCase()),
        ),
      })).filter((group) => group.items.length > 0),
    [allProducts, query],
  );

  const marquee = [...ADS, ...ADS];

  return (
    <AppLayout variant="gradient">
      <header className="mt-10 text-center md:mt-0">
        <h1 className="text-5xl font-black uppercase leading-none tracking-tight text-white md:text-7xl">
          UNI DOOR DASH
        </h1>
        <p className="font-handwritten mt-3 text-sm text-white md:text-base">shop what you want</p>
      </header>

      <div
        className="mx-auto mt-8 flex h-14 max-w-2xl items-center gap-3 rounded-full border border-border px-5"
        style={{ backgroundColor: "var(--app-main-flat)" }}
      >
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search perfumes, clothing, accessories…"
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
          ⌘K
        </span>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setActiveChip(chip)}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors ${
              activeChip === chip ? "bg-cherry-deep" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      <section className="-mx-5 mt-14 sm:-mx-8 md:-mx-12">
        <div
          className="relative overflow-hidden py-2"
          style={{
            maskImage: "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)",
          }}
        >
          <div className="slide-track flex w-max gap-6">
            {marquee.map((ad, i) => (
              <article
                key={`${ad.id}-${i}`}
                className="group relative h-64 w-[420px] shrink-0 overflow-hidden rounded-3xl bg-card shadow-2xl sm:h-80 sm:w-[640px]"
              >
                <img
                  src={ad.media}
                  alt={ad.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl font-extrabold">{ad.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="-mx-5 mt-14 px-2 sm:-mx-8 sm:px-3 md:-mx-12 md:px-3">
        <div
          className="relative rounded-xl p-5 pb-8 sm:p-7 sm:pb-10"
          style={{ backgroundColor: "var(--app-main-flat)" }}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide">Whats new</h2>
            <Link
              to="/market-place"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-cherry-deep px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Enter to market place
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {groups.map(({ category, items }) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {category}
              </h3>
              <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
                {items.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
                <GoToMarketCard />
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">
              Nothing here yet — try another search.
            </p>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
