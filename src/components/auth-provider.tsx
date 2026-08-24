import {
  type User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ADMIN_EMAIL, getFirebaseAuth } from "@/lib/firebase";
import { SignInDialog } from "@/components/sign-in-dialog";

// Set once the sign-in card has auto-opened for this browser (or once we've
// confirmed it doesn't need to, because someone's already signed in). After
// that, the card never opens itself again — only a deliberate click on the
// account button (see app-layout.tsx / mobile-dock.tsx) opens it.
const FIRST_VISIT_KEY = "udd-first-visit-shown";

export type UddUser = {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  provider: "Google" | "Apple" | "Email";
};

type AuthContextValue = {
  user: UddUser | null;
  /** True once the initial Firebase auth-state check has resolved. */
  ready: boolean;
  /** True when `user` is signed in with the admin account. */
  isAdmin: boolean;
  error: string | null;
  openSignIn: () => void;
  closeSignIn: () => void;
  signInGoogle: () => Promise<void>;
  signInApple: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}

function mapUser(fbUser: FirebaseUser): UddUser {
  const providerId = fbUser.providerData[0]?.providerId ?? "password";
  const provider: UddUser["provider"] =
    providerId === "google.com" ? "Google" : providerId === "apple.com" ? "Apple" : "Email";
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName ?? fbUser.email?.split("@")[0] ?? null,
    photoURL: fbUser.photoURL,
    provider,
  };
}

function describeAuthError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account already exists with that email — try signing in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return ""; // user just closed the popup — not a real error
    case "auth/operation-not-allowed":
      return "That sign-in method isn't enabled for this project yet.";
    default:
      return "Something went wrong signing in. Please try again.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UddUser | null>(null);
  const [ready, setReady] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      setUser(fbUser ? mapUser(fbUser) : null);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  // Auto-open the sign-in card exactly once: the very first time this
  // browser ever loads the site while signed out. Firebase Auth persists
  // the session locally by default, so on every later visit `user` is
  // already populated by the time `ready` flips true and this is a no-op.
  // Nothing else in the app is allowed to call openSignIn() as a side
  // effect of some other button (cart/buy/create-a-piece etc. just show a
  // toast instead) — this effect is the only automatic trigger left.
  useEffect(() => {
    if (!ready) return;
    let alreadyShown = true;
    try {
      alreadyShown = localStorage.getItem(FIRST_VISIT_KEY) === "1";
    } catch {
      /* if storage is unavailable, fail closed: don't nag every load */
    }
    if (!alreadyShown && !user) {
      setDialogOpen(true);
    }
    try {
      localStorage.setItem(FIRST_VISIT_KEY, "1");
    } catch {
      /* ignore */
    }
    // Deliberately only depends on `ready` — this must run once per app
    // load, not every time `user` changes (e.g. on sign-out).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const openSignIn = useCallback(() => {
    setError(null);
    setDialogOpen(true);
  }, []);
  const closeSignIn = useCallback(() => setDialogOpen(false), []);

  const signInGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      setDialogOpen(false);
    } catch (err) {
      const message = describeAuthError(err);
      if (message) setError(message);
    }
  }, []);

  const signInApple = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(getFirebaseAuth(), new OAuthProvider("apple.com"));
      setDialogOpen(false);
    } catch (err) {
      const message = describeAuthError(err);
      if (message) setError(message);
    }
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      setDialogOpen(false);
    } catch (err) {
      setError(describeAuthError(err));
    }
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      setDialogOpen(false);
    } catch (err) {
      setError(describeAuthError(err));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    // Deliberate exception to the "only auto-opens once, ever" rule: a
    // logout is an explicit user action, and re-prompting for sign-in
    // right after is expected here — unlike buy/cart/create-a-piece,
    // which never trigger the card automatically.
    setError(null);
    setDialogOpen(true);
  }, []);

  // Legacy bridge, kept only in case any other script still reads
  // window.UDDAuth. public/udd/market.js (the only thing that used to call
  // this) has been retired — its product/cart/order/admin-gate logic is now
  // real React + Firestore. requireAuth() deliberately does NOT open the
  // sign-in card anymore: the card only ever auto-opens once, on a
  // brand-new browser's first visit (see the effect above). Callers should
  // check isSignedIn() and show their own toast instead of relying on this
  // to pop the dialog.
  useEffect(() => {
    window.UDDAuth = {
      requireAuth() {
        return ready && !!user;
      },
      isSignedIn: () => ready && !!user,
      getCurrentUser: () => user,
      show: openSignIn,
      hide: closeSignIn,
      signOut: () => {
        void signOutUser();
      },
    };
  }, [user, ready, openSignIn, closeSignIn, signOutUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isAdmin,
      error,
      openSignIn,
      closeSignIn,
      signInGoogle,
      signInApple,
      signInEmail,
      signUpEmail,
      signOutUser,
    }),
    [
      user,
      ready,
      isAdmin,
      error,
      openSignIn,
      closeSignIn,
      signInGoogle,
      signInApple,
      signInEmail,
      signUpEmail,
      signOutUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SignInDialog
        open={dialogOpen}
        onOpenChange={(open) => (open ? openSignIn() : closeSignIn())}
      />
    </AuthContext.Provider>
  );
}

declare global {
  interface Window {
    UDDAuth?: {
      requireAuth: () => boolean;
      isSignedIn: () => boolean;
      getCurrentUser: () => UddUser | null;
      show: () => void;
      hide: () => void;
      signOut: () => void;
    };
  }
}
