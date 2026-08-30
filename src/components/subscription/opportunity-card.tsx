import type { LucideIcon } from "lucide-react";

import { SlotText } from "@/components/subscription/slot-text";

export type OpportunityPlan = {
  title: string;
  price: number;
  description: string;
  icon: LucideIcon;
};

export function OpportunityCard({
  title,
  price,
  description,
  icon: Icon,
}: OpportunityPlan) {
  return (
    <article
      className="flex flex-col rounded-2xl border border-border p-6 shadow-lg transition-transform hover:-translate-y-1"
      style={{ backgroundColor: "var(--app-main-flat)" }}
    >
      <span
        className="grid size-11 place-items-center rounded-full"
        style={{
          background:
            "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
        }}
      >
        <Icon className="size-5 text-white" />
      </span>
      <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <SlotText
          text={price.toLocaleString()}
          className="text-2xl font-black"
        />
        <span className="text-sm font-bold">Tsh</span>
        <span className="text-xs text-muted-foreground">/monthly</span>
      </div>
    </article>
  );
}
