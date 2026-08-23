import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import storesHero from "@/assets/udd-stores.png";
import { AppLayout } from "@/components/app-layout";
import { useTheme } from "@/components/theme-provider";
import { FilterDropdown } from "@/components/stores/filter-dropdown";
import { StoreCard } from "@/components/stores/store-card";
import { STORES } from "@/data/catalog";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "Stores — Uni Door Dash" },
      {
        name: "description",
        content:
          "Browse independent sellers on Uni Door Dash — each store specializes in one kind of product.",
      },
      { property: "og:title", content: "Stores — Uni Door Dash" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const SPECIALTIES = ["All", ...Array.from(new Set(STORES.map((s) => s.specialty)))];

function Page() {
  const { dark } = useTheme();
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState<string>(SPECIALTIES[0] ?? "All");

  const filtered = useMemo(
    () =>
      STORES.filter(
        (store) =>
          (specialty === "All" || store.specialty === specialty) &&
          store.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, specialty],
  );

  const favourites = STORES.slice(0, 3);

  return (
    <AppLayout>
      <div className="relative flex h-[220px] items-center justify-center overflow-hidden sm:h-[280px] md:h-[340px]">
        <img
          src={storesHero}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto h-[104px] w-auto select-none object-contain opacity-90 sm:h-[144px] md:h-[184px]"
          style={{
            filter: dark
              ? "drop-shadow(0 20px 60px rgba(255,255,255,0.08))"
              : "drop-shadow(0 30px 60px rgba(0,0,0,0.12))",
          }}
        />
        <h1
          className="relative px-2 text-center text-[64px] font-extrabold uppercase leading-none tracking-tight sm:text-[100px] md:text-[150px] lg:text-[190px]"
          style={{
            color: "transparent",
            WebkitTextStroke: dark ? "2px #ffffff" : "2.5px #111111",
            textShadow: dark
              ? "0 6px 30px rgba(255,255,255,0.15)"
              : "0 8px 40px rgba(0,0,0,0.12)",
          }}
        >
          STORE
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex h-16 flex-1 items-center gap-3 rounded-full px-5 shadow-lg backdrop-blur-xl sm:max-w-[280px]"
          style={{
            border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
            backgroundColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          }}
        >
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <FilterDropdown options={SPECIALTIES} value={specialty} onChange={setSpecialty} />
      </div>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-extrabold uppercase tracking-wide">Favourites</h2>
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {favourites.map((store) => (
            <article className="w-40 shrink-0 sm:w-48" key={store.id}>
              <div className="aspect-square w-full overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={store.image}
                  alt={store.name}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <p className="mt-2 truncate text-center text-sm font-bold">{store.name}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-extrabold uppercase tracking-wide">All stores</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((store) => (
            <StoreCard store={store} key={store.id} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">No stores match your search.</p>
        )}
      </section>
    </AppLayout>
  );
}
