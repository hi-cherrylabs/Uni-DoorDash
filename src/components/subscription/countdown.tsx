import { useEffect, useState } from "react";

import { SlotText } from "@/components/subscription/slot-text";

function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  return {
    months: Math.floor(totalSeconds / 2592000),
    days: Math.floor((totalSeconds % 2592000) / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <SlotText
        text={pad(value)}
        className="text-5xl font-black tabular-nums tracking-tight sm:text-6xl md:text-7xl"
      />
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function SubscriptionCountdown({ target }: { target: number }) {
  const { months, days, hours, minutes, seconds } = useCountdown(target);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="relative text-xs uppercase tracking-widest text-muted-foreground opacity-60">
        Time remaining on your plan
      </span>
      <div className="mt-4 flex items-start gap-3 sm:gap-5">
        <CountdownUnit value={months} label="Months" />
        <span className="mt-1 text-3xl font-black text-muted-foreground sm:text-4xl">:</span>
        <CountdownUnit value={days} label="Days" />
        <span className="mt-1 text-3xl font-black text-muted-foreground sm:text-4xl">:</span>
        <CountdownUnit value={hours} label="Hours" />
        <span className="mt-1 text-3xl font-black text-muted-foreground sm:text-4xl">:</span>
        <CountdownUnit value={minutes} label="Minutes" />
        <span className="mt-1 text-3xl font-black text-muted-foreground sm:text-4xl">:</span>
        <CountdownUnit value={seconds} label="Seconds" />
      </div>
    </div>
  );
}
