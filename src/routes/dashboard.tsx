import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/components/auth-provider";
import { CreatePieceForm } from "@/components/dashboard/create-piece-form";
import { NotificationsButton } from "@/components/dashboard/notifications-button";
import { OrderProgressList } from "@/components/dashboard/order-progress-list";
import { ProductManagement } from "@/components/dashboard/product-management";
import { SegmentedToggle } from "@/components/dashboard/segmented-toggle";
import { StorageButton } from "@/components/dashboard/storage-button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Uni Door Dash" },
      {
        name: "description",
        content:
          "Create listings and track orders on your Uni Door Dash seller dashboard.",
      },
      { property: "og:title", content: "Dashboard — Uni Door Dash" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const TABS: string[] = ["Create a Piece", "Order Progress", "Management"];

function Page() {
  const { ready, user, isAdmin } = useAuth();
  const [tab, setTab] = useState<string>(TABS[0]!);

  // This route is not linked anywhere for non-admin users (see app-layout.tsx
  // / mobile-dock.tsx), but someone could still type the URL directly — this
  // guard makes sure that never actually shows dashboard content.
  if (!ready) {
    return (
      <AppLayout>
        <p className="mt-16 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      </AppLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AppLayout>
        <div className="mx-auto mt-16 max-w-md text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-2xl">
            🔒
          </div>
          <h1 className="mt-4 text-xl font-bold">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The dashboard is reserved for the Uni Door Dash admin account.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mt-10 flex items-center gap-3 md:mt-0">
        <StorageButton />
        <NotificationsButton />
      </div>

      <div className="mt-6 flex justify-center">
        <SegmentedToggle options={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === "Create a Piece" && <CreatePieceForm />}
      {tab === "Order Progress" && <OrderProgressList />}
      {tab === "Management" && <ProductManagement />}
    </AppLayout>
  );
}
