import { Mail } from "lucide-react";

export function NotificationsButton() {
  return (
    <button
      type="button"
      title="Notifications and requests"
      className="relative grid size-11 shrink-0 place-items-center rounded-full border border-border shadow-md transition-colors hover:bg-accent"
      style={{ backgroundColor: "var(--app-main-flat)" }}
    >
      <Mail className="size-5" />
      <span
        className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full text-[10px] font-bold text-white"
        style={{ backgroundColor: "var(--cherry-deep)" }}
      >
        3
      </span>
    </button>
  );
}
