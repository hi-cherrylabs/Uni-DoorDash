import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Truck } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { SegmentedControl } from "@/components/segmented-control";
import { SubscriptionCountdown } from "@/components/subscription/countdown";
import {
  OpportunityCard,
  type OpportunityPlan,
} from "@/components/subscription/opportunity-card";
import {
  PricingCard,
  type SubscriptionPlan,
} from "@/components/subscription/pricing-card";
import { SlotText } from "@/components/subscription/slot-text";
import { StorageRing } from "@/components/subscription/storage-ring";
import { UpdatesCarousel } from "@/components/subscription/updates-carousel";
import { WalletCardForm } from "@/components/subscription/wallet-card-form";
import { ANNOUNCEMENTS, UPDATES } from "@/data/catalog";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "Subscription — Uni Door Dash" },
      {
        name: "description",
        content:
          "Manage your Uni Door Dash subscription, wallet, and requests.",
      },
      { property: "og:title", content: "Subscription — Uni Door Dash" },
      {
        property: "og:description",
        content:
          "Manage your Uni Door Dash subscription, wallet, and requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubscriptionPage,
});

const TABS: string[] = [
  "Recent Updates",
  "My Wallet",
  "Subscription",
  "Pricing",
];

const PLANS: SubscriptionPlan[] = [
  {
    title: "BOMBA PLAN",
    price: 10000,
    description:
      "Essentials to get started — browse every store, place orders, and track deliveries in real time.",
    type: "waves",
    background: "var(--cherry-deep)",
  },
  {
    title: "SAFARI PLAN",
    price: 23000,
    description:
      "Everything in Bomba, plus priority delivery slots, early access to new drops, and saved favourites sync.",
    type: "crosses",
    background: "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
  },
  {
    title: "WEKEZA PLAN",
    price: 45000,
    description:
      "Full access — zero delivery fees, dedicated support, exclusive seller pricing, and early opportunity listings.",
    type: "waves",
    background: "#1e2f6e",
  },
];

const OPPORTUNITIES: OpportunityPlan[] = [
  {
    title: "Open a Shop",
    price: 50000,
    icon: Store,
    description:
      "List your own products on Uni Door Dash and reach every shopper on the app.",
  },
  {
    title: "Cover Monthly Free Delivery",
    price: 50000,
    icon: Truck,
    description:
      "Offer your customers free delivery all month, funded through this plan.",
  },
];

function SubscriptionPage() {
  const [tab, setTab] = useState<string>(TABS[0]!);
  const [phone, setPhone] = useState("");
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [planEnds, setPlanEnds] = useState<number | null>(null);

  function subscribe(title: string) {
    setActivePlan(title);
    setPlanEnds(Date.now() + 2592000000);
  }

  return (
    <AppLayout>
      <h1 className="text-shimmer-navy-pink mt-10 text-center text-5xl font-black uppercase tracking-tight md:mt-0 md:text-7xl">
        Subscription
      </h1>
      <div className="mt-8 flex justify-center">
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </div>

      {tab === "Recent Updates" && (
        <div className="mt-12">
          <UpdatesCarousel items={UPDATES} />
          <div className="mx-auto mt-12 flex max-w-2xl flex-col gap-3">
            {ANNOUNCEMENTS.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-2xl p-4"
                style={{ backgroundColor: "var(--app-main-flat)" }}
              >
                <img
                  src={item.avatar}
                  alt=""
                  className="size-11 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cherry-deep px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Admin
                    </span>
                    <h3 className="truncate font-bold">{item.title}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p>{new Date(item.date).toLocaleDateString()}</p>
                  <p>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "My Wallet" && (
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide">
              Set up your wallet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Hi! Hi-cherry</p>
          </div>
          <div className="mt-8">
            <WalletCardForm />
          </div>
          <div
            className="mt-6 rounded-2xl p-5 shadow-lg"
            style={{ backgroundColor: "var(--app-main-flat)" }}
          >
            <h3 className="font-bold">Phone number</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              This phone number will be used to be paid or pay accordingly. You
              can change it anytime.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255 7XX XXX XXX"
                className="min-w-0 flex-1 rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                className="shrink-0 rounded-lg bg-cherry-deep px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
          <div
            className="mt-6 rounded-2xl p-6 text-white shadow-lg"
            style={{ backgroundColor: "#0a0a0a" }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                Spendings
              </span>
              <div className="flex items-baseline gap-1">
                <SlotText text="12,400" className="text-xl font-black" />
                <span className="text-sm font-bold">Tsh</span>
              </div>
            </div>
            <div className="my-4 border-t border-white/15" />
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
                Earnings
              </span>
              <div className="flex items-baseline gap-1">
                <SlotText text="45,000" className="text-xl font-black" />
                <span className="text-sm font-bold">Tsh</span>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-cherry-pink">
              Upgrade
            </p>
            <button
              type="button"
              onClick={() => setTab("Pricing")}
              className="mt-2 w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-90 sm:text-base"
              style={{
                background:
                  "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
              }}
            >
              Upgrade your subscription to access more customers
            </button>
          </div>
        </div>
      )}

      {tab === "Subscription" &&
        (activePlan === null || planEnds === null ? (
          <div className="mt-24 flex flex-col items-center px-4 text-center">
            <h2 className="max-w-lg text-3xl font-black uppercase leading-tight sm:text-4xl">
              We are sorry we couldn't see your subscription
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setTab("Pricing")}
                className="rounded-full border border-border bg-accent px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent/70"
              >
                View pricing
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center">
            <SubscriptionCountdown target={planEnds} />
            <div
              className="mx-auto mt-12 w-full max-w-md rounded-2xl p-5 text-center shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                Your plan
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                {activePlan}
              </h3>
            </div>
            <div className="mt-8">
              <StorageRing usedMb={200} totalMb={1024} />
            </div>
          </div>
        ))}

      {tab === "Pricing" && (
        <div className="mt-14">
          <div className="text-center">
            <SlotText
              text="75,000 Tsh"
              className="text-6xl font-black tracking-tight sm:text-7xl md:text-8xl"
            />
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Full features / month
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <PricingCard
                key={plan.title}
                {...plan}
                onSubscribe={() => subscribe(plan.title)}
              />
            ))}
          </div>
          <h2 className="mt-16 text-center text-2xl font-extrabold uppercase tracking-wide">
            Explore opportunity plans
          </h2>
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            {OPPORTUNITIES.map((item) => (
              <OpportunityCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
