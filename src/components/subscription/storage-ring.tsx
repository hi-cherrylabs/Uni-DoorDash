export function StorageRing({
  usedMb,
  totalMb,
}: {
  usedMb: number;
  totalMb: number;
}) {
  const circumference = 2 * Math.PI * 50;
  const offset =
    circumference -
    (Math.min(100, (usedMb / totalMb) * 100) / 100) * circumference;

  return (
    <div
      className="mx-auto flex aspect-square w-48 items-center justify-center rounded-2xl border border-border p-4 shadow-lg"
      style={{ backgroundColor: "var(--app-main-flat)" }}
    >
      <div className="relative flex size-full items-center justify-center">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={50}
            fill="none"
            stroke="var(--border)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={50}
            fill="none"
            stroke="url(#storage-ring-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
          <defs>
            <linearGradient
              id="storage-ring-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--cherry-pink)" />
              <stop offset="100%" stopColor="#2f6bff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Storage
          </span>
          <span className="text-lg font-black">{usedMb} MB</span>
        </div>
      </div>
    </div>
  );
}
