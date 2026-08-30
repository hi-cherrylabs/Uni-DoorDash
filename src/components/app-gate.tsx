import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/components/auth-provider";
import { FullScreenLoader } from "@/components/loading-gate";
import { SignInDialog } from "@/components/sign-in-dialog";
import { WelcomeAuthFlow } from "@/components/onboarding/welcome-auth-flow";
import { OnboardingDataFlow } from "@/components/onboarding/onboarding-data-flow";

/**
 * The single authentication + onboarding wall for the whole app. Sits above
 * <Outlet/> in __root.tsx and decides, on every render, exactly one of five
 * things to show:
 *
 *  1. Not ready yet               → full-screen loader
 *  2a. No user, new browser       → the onboarding prototype's own
 *                                    welcome/theme/auth pages (full takeover)
 *  2b. No user, returning browser → the real app blurred + inert behind the
 *                                    plain, non-dismissible sign-in card
 *  3. User, profile still loading → full-screen loader ("syncing account")
 *  4. User, profile incomplete    → the onboarding data-collection flow
 *                                    (full takeover), resumed at lastStep
 *  5. User, profile complete      → the real app, nothing on top
 *
 * Because the real route tree only ever renders in case 5 (or blurred+inert
 * behind the wall in 2b), there is no window where route content can
 * attempt to render, fail to match, and flash a 404 — the bug that used to
 * show up around sign-out. Gating above <Outlet/> removes that possibility
 * structurally rather than patching each route.
 */
export function AppGate({ children }: { children: ReactNode }) {
  const { ready, user, profile, profileReady, hasSignedInBefore } = useAuth();
  const navigate = useNavigate();

  // Sticky per-account "the person has clicked through the completion
  // screen" flag. Without this, the moment onboarding's final step writes
  // onboardingComplete: true to Firestore, the profile subscription would
  // update and immediately swap OnboardingDataFlow out for the real app —
  // potentially before the person has even seen the "You're all set up"
  // screen or clicked its button. Resets whenever the signed-in account
  // changes, so the next incomplete account isn't wrongly treated as
  // already dismissed.
  const [dismissedOnboardingForUid, setDismissedOnboardingForUid] = useState<
    string | null
  >(null);
  useEffect(() => {
    setDismissedOnboardingForUid(null);
  }, [user?.uid]);

  if (!ready) {
    return <FullScreenLoader />;
  }

  if (!user) {
    if (!hasSignedInBefore) {
      // Brand new browser — never signed in here before. Show the full
      // onboarding welcome/theme/auth experience instead of the plain card.
      return <WelcomeAuthFlow />;
    }
    // This browser has signed in before (someone just logged out, or the
    // session expired) — show the plain sign-in card, blurred storefront
    // preview behind it. `inert` removes the preview from focus/interaction
    // for assistive tech and keyboard users, not just the mouse.
    return (
      <>
        <div className="blur-md" style={{ pointerEvents: "none" }} inert>
          {children}
        </div>
        <SignInDialog open dismissible={false} onOpenChange={() => {}} />
      </>
    );
  }

  if (!profileReady) {
    return <FullScreenLoader />;
  }

  const needsOnboarding = !profile || !profile.onboardingComplete;
  if (needsOnboarding && dismissedOnboardingForUid !== user.uid) {
    return (
      <OnboardingDataFlow
        initialStep={profile?.lastStep ?? "start-button"}
        onFinished={() => {
          setDismissedOnboardingForUid(user.uid);
          void navigate({ to: "/" });
        }}
      />
    );
  }

  return <>{children}</>;
}
