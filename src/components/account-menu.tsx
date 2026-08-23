import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function initials(name: string | null, email: string | null): string {
  const source = (name?.trim() || email?.split("@")[0] || "U").trim();
  return source.slice(0, 1).toUpperCase();
}

/**
 * Replaces the old plain sign-in/sign-out icon button. Signed out: same
 * button as before, opens the sign-in card. Signed in: becomes the user's
 * avatar; pressing it opens a glass profile popover anchored to the avatar
 * instead of immediately signing out.
 */
export function AccountMenu({ size = 44 }: { size?: number }) {
  const { ready, user, isAdmin, openSignIn, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);

  if (!ready) return null;

  if (!user) {
    return (
      <button
        type="button"
        title="Sign in"
        onClick={openSignIn}
        className="grid place-items-center rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--cherry-deep)", width: size, height: size }}
      >
        <User className="size-1/2" />
      </button>
    );
  }

  function comingSoon(label: string) {
    toast(`${label} — coming soon.`);
    setOpen(false);
  }

  async function handleSignOut() {
    setOpen(false);
    await signOutUser();
  }

  const displayName = user.name ?? user.email ?? "Account";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={displayName}
          className="relative grid place-items-center overflow-hidden rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--cherry-deep)", width: size, height: size }}
        >
          <Avatar className="size-full">
            <AvatarImage src={user.photoURL ?? undefined} alt="" />
            <AvatarFallback className="bg-transparent text-sm font-bold text-white">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute right-0 top-0 size-2.5 rounded-full border-2 border-[var(--cherry-deep)] bg-emerald-400" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={12} className="glass-panel w-72">
        <div className="flex flex-col items-center gap-1 text-center">
          <Avatar className="size-16">
            <AvatarImage src={user.photoURL ?? undefined} alt="" />
            <AvatarFallback
              className="text-lg font-bold text-white"
              style={{ backgroundColor: "var(--cherry-deep)" }}
            >
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <p className="mt-2 truncate text-sm font-bold">{displayName}</p>
          {isAdmin && <p className="text-[11px] text-muted-foreground">Admin account</p>}
        </div>

        <button
          type="button"
          onClick={() => comingSoon("Account setup")}
          className="glass-button-dark mt-4 w-full rounded-full py-2.5 text-xs font-bold"
        >
          Let's finish setting up your account
        </button>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-destructive py-2.5 text-xs font-bold text-destructive-foreground transition-opacity hover:opacity-90"
          >
            <LogOut className="size-3.5" />
            Log out
          </button>
          <button
            type="button"
            onClick={() => comingSoon("Membership")}
            className="glass-button-light flex-1 rounded-full py-2.5 text-xs font-bold"
          >
            Get membership
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
