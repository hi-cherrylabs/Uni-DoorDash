import { Heart, EllipsisVertical } from "lucide-react";

import type { Store } from "@/data/catalog";

export function StoreCard({ store }: { store: Store }) {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-border"
      style={{ backgroundColor: "var(--app-main-flat)" }}
    >
      <div className="aspect-[16/9] w-full overflow-hidden">
        <img
          src={store.image}
          alt={store.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={store.owner.avatar}
              alt={store.owner.name}
              className="size-8 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold">{store.name}</h3>
              <p className="truncate text-xs text-muted-foreground">
                {store.specialty}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              title="Add to favourites"
              className="grid size-8 place-items-center rounded-full transition-colors hover:bg-accent"
            >
              <Heart className="size-4" />
            </button>
            <button
              type="button"
              title="More options"
              className="grid size-8 place-items-center rounded-full transition-colors hover:bg-accent"
            >
              <EllipsisVertical className="size-4" />
            </button>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {store.description}
        </p>
      </div>
    </article>
  );
}
