export function StorageButton() {
  const total = 1024;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (19.53125 / 100) * circumference;

  return (
    <button
      type="button"
      title={`Storage: 200MB of ${total}MB used`}
      className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-4 shadow-md transition-colors hover:bg-accent"
      style={{ backgroundColor: "var(--app-main-flat)" }}
    >
      <span className="relative grid size-11 shrink-0 place-items-center">
        <svg
          viewBox="0 0 64 64"
          className="absolute inset-0 size-full -rotate-90"
        >
          <circle
            cx="32"
            cy="32"
            r={26}
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r={26}
            fill="none"
            stroke="url(#dash-storage-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient
              id="dash-storage-gradient"
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
        <span className="text-[9px] font-black">20%</span>
      </span>
      <span className="text-left">
        <span className="block text-xs font-bold leading-tight">Storage</span>
        <span className="block text-[11px] leading-tight text-muted-foreground">
          200MB / {total}MB
        </span>
      </span>
    </button>
  );
}
