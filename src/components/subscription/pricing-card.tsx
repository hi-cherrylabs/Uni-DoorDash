import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SlotText } from "@/components/subscription/slot-text";

const DiagonalStripes = () => (
  <svg width="129" height="1387" viewBox="0 0 129 1387" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.2131 11L106.283 106.07M106.283 106.07L117.279 117.066M106.283 106.07L22.2962 190.003M106.283 106.07L116.688 95.6708M11.2962 200.997L22.2962 190.003M22.2962 190.003L11.2529 178.96M22.2962 190.003L106.323 274.03M106.323 274.03L117.319 285.026M106.323 274.03L22.4537 357.846M106.323 274.03L116.728 263.631M11.3361 368.957L22.4537 357.846M22.4537 357.846L11.5493 346.901M22.4537 357.846L106.44 442.149M106.44 442.149L117.416 453.166M106.44 442.149L22.2962 525.925M106.44 442.149L116.865 431.769M11.2756 536.897L22.2962 525.925M22.2962 525.925L11.2737 514.861M22.2962 525.925L106.165 610.109M106.165 610.109L117.14 621.126M106.165 610.109L11 704.857M106.165 610.109L116.59 599.729M11.2131 683L106.283 778.07M106.283 778.07L117.279 789.066M106.283 778.07L22.2962 862.003M106.283 778.07L116.688 767.671M11.2962 872.997L22.2962 862.003M22.2962 862.003L11.2529 850.96M22.2962 862.003L106.323 946.03M106.323 946.03L117.319 957.026M106.323 946.03L22.4537 1029.85M106.323 946.03L116.728 935.631M11.3361 1040.96L22.4537 1029.85M22.4537 1029.85L11.5493 1018.9M22.4537 1029.85L106.44 1114.15M106.44 1114.15L117.416 1125.17M106.44 1114.15L22.2962 1197.92M106.44 1114.15L116.865 1103.77M11.2756 1208.9L22.2962 1197.92M22.2962 1197.92L11.2737 1186.86M22.2962 1197.92L106.165 1282.11M106.165 1282.11L117.14 1293.13M106.165 1282.11L11 1376.86M106.165 1282.11L116.59 1271.73"
      stroke="#282828"
      strokeWidth="31"
    />
  </svg>
);

const CrossMark = () => (
  <svg width="130" height="130" viewBox="0 0 130 130" fill="none" className="scale-125" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 11L118.899 119M11.101 119L119 11" stroke="#282828" strokeWidth="31" />
  </svg>
);

function PlanCardShell({
  children,
  className,
  style,
  type = "waves",
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: "waves" | "crosses";
}) {
  return (
    <article
      className={cn(
        "relative flex h-[600px] max-h-[600px] min-h-[300px] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-purple-500 text-white",
        className,
      )}
      style={style}
    >
      <span className="relative z-[2] flex h-full w-full flex-col items-start justify-start gap-7 p-6 sm:gap-10">
        {children}
      </span>
      {type === "waves" && (
        <>
          <div className="waves absolute -top-[106px] -left-0 z-0 h-fit w-fit sm:left-4">
            <DiagonalStripes />
          </div>
          <div className="waves absolute -top-[106px] -right-0 z-0 h-fit w-fit sm:right-4">
            <DiagonalStripes />
          </div>
        </>
      )}
      {type === "crosses" && (
        <>
          <div className="absolute top-0 -left-10 z-0 h-fit w-fit animate-[spin_5s_linear_infinite]">
            <CrossMark />
          </div>
          <div className="absolute top-1/2 -right-12 z-0 h-fit w-fit animate-[spin_5s_linear_infinite]">
            <CrossMark />
          </div>
          <div className="absolute top-[85%] -left-5 z-0 h-fit w-fit animate-[spin_5s_linear_infinite]">
            <CrossMark />
          </div>
        </>
      )}
    </article>
  );
}

const PlanTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
  <h1 className={cn("text-[clamp(1.7rem,10vw,3rem)] font-bold leading-[1] sm:text-5xl", className)}>{children}</h1>
);

const PlanPrice = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div style={{ lineHeight: "1" }} className={cn("text-[clamp(1.7rem,10vw,3rem)] font-bold sm:text-5xl", className)}>
    {children}
  </div>
);

const PlanDescription = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("text-[clamp(0.1rem,20vw,1.25rem)] font-bold sm:text-2xl", className)}>{children}</p>
);

export type SubscriptionPlan = {
  title: string;
  price: number;
  description: string;
  type: "waves" | "crosses";
  background: string;
};

export function PricingCard({
  title,
  price,
  description,
  type,
  background,
  onSubscribe,
}: SubscriptionPlan & { onSubscribe: () => void }) {
  return (
    <PlanCardShell type={type} className="mx-auto max-w-none" style={{ background }}>
      <PlanTitle>{title}</PlanTitle>
      <div className="flex w-full items-center justify-between gap-3">
        <PlanPrice>
          <SlotText text={price.toLocaleString()} />
          <span className="ml-1 text-lg font-bold sm:text-2xl">Tsh</span>
        </PlanPrice>
        <button
          type="button"
          onClick={onSubscribe}
          className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 hover:opacity-90"
        >
          Subscribe
        </button>
      </div>
      <PlanDescription>{description}</PlanDescription>
    </PlanCardShell>
  );
}
