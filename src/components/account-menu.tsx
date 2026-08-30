import { LogOut, MapPin, Phone, Building2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function initials(name: string | null, email: string | null): string {
  const source = (name?.trim() || email?.split("@")[0] || "U").trim();
  return source.slice(0, 1).toUpperCase();
}

/**
 * Signed in: the user's avatar; pressing it opens a glass profile popover.
 * Signed out is unreachable here — <AppGate> never mounts anything from
 * the real route tree (which is where this component lives) without a
 * signed-in, fully onboarded user, so there's no sign-in affordance to
 * show in that state anymore.
 */
export function AccountMenu({ size = 44 }: { size?: number }) {
  const { ready, user, profile, isAdmin, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);

  if (!ready || !user) return null;

  function comingSoon(label: string) {
    toast(`${label} — coming soon.`);
    setOpen(false);
  }

  async function handleSignOut() {
    setOpen(false);
    await signOutUser();
  }

  const displayName = user.name ?? user.email ?? "Account";
  const isComplete = !!profile?.onboardingComplete;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={displayName}
          className="relative grid place-items-center overflow-hidden rounded-full text-white shadow-lg transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "var(--cherry-deep)",
            width: size,
            height: size,
          }}
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
          {isAdmin && (
            <p className="text-[11px] text-muted-foreground">Admin account</p>
          )}
        </div>

        {isComplete ? (
          <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-black/5 p-3 text-xs dark:bg-white/5">
            {profile?.districtName && profile?.ward && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate text-foreground">
                  {profile.ward} Ward, {profile.districtName}
                </span>
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                <span className="truncate text-foreground">
                  {profile.phone}
                </span>
              </div>
            )}
            {profile?.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate text-foreground">
                  {profile.email}
                </span>
              </div>
            )}
            {profile?.ownsBusiness && profile?.businessName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-3.5 shrink-0" />
                <span className="truncate text-foreground">
                  {profile.businessName}
                </span>
              </div>
            )}
          </div>
        ) : (
          // Defensive fallback only — under the sign-in wall this shouldn't
          // be reachable (AppGate keeps an incomplete profile inside
          // OnboardingDataFlow, not the real app), but kept in case someone
          // reaches this popover mid-transition.
          <button
            type="button"
            onClick={() => comingSoon("Account setup")}
            className="glass-button-dark mt-4 w-full rounded-full py-2.5 text-xs font-bold"
          >
            Let's finish setting up your account
          </button>
        )}

        <div className="mt-3 flex gap-2">
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
