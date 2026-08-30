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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { ADMIN_EMAIL, getFirebaseAuth } from "@/lib/firebase";
import {
  ensureUserProfileShell,
  subscribeToUserProfile,
  type UserProfile,
} from "@/lib/firestore-data";

// Set permanently (never cleared, including on logout) the first time this
// browser ever completes a real sign-in. This is what tells AppGate which
// signed-out surface to show: a browser that's never signed in here before
// sees the full onboarding welcome/theme/auth experience; a browser that has
// (i.e. someone who just logged out) sees the plain sign-in card instead.
const EVER_SIGNED_IN_KEY = "udd-ever-signed-in";

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
  /** This account's onboarding profile, or null if it doesn't exist yet. */
  profile: UserProfile | null;
  /** True once the profile subscription has reported at least once for the current user (or trivially true when signed out). */
  profileReady: boolean;
  /** True if this browser has ever completed a sign-in before (persists across logout). */
  hasSignedInBefore: boolean;
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
    providerId === "google.com"
      ? "Google"
      : providerId === "apple.com"
        ? "Apple"
        : "Email";
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

function markEverSignedIn() {
  try {
    localStorage.setItem(EVER_SIGNED_IN_KEY, "1");
  } catch {
    /* ignore */
  }
}

function readEverSignedIn(): boolean {
  try {
    return localStorage.getItem(EVER_SIGNED_IN_KEY) === "1";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UddUser | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [hasSignedInBefore, setHasSignedInBefore] = useState(false);

  useEffect(() => {
    setHasSignedInBefore(readEverSignedIn());
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      setUser(fbUser ? mapUser(fbUser) : null);
      setReady(true);
      if (fbUser) markEverSignedIn();
    });
    return unsubscribe;
  }, []);

  // Profile subscription: follows the signed-in uid, resets whenever it
  // changes (including to null on sign-out) so a stale previous account's
  // profile is never briefly visible for the next one.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileReady(true);
      return;
    }
    setProfileReady(false);
    let cancelled = false;
    const unsubscribe = subscribeToUserProfile(
      user.uid,
      (nextProfile) => {
        if (cancelled) return;
        setProfile(nextProfile);
        setProfileReady(true);
        // First time this account is ever seen with no profile doc at all —
        // create the shell immediately so onboarding has something to
        // merge into and so `lastStep` exists from the very first step.
        if (!nextProfile) {
          void ensureUserProfileShell(user.uid, user.email);
        }
      },
      () => {
        if (cancelled) return;
        setProfileReady(true);
      },
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const signInGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } catch (err) {
      const message = describeAuthError(err);
      if (message) setError(message);
    }
  }, []);

  const signInApple = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(getFirebaseAuth(), new OAuthProvider("apple.com"));
    } catch (err) {
      const message = describeAuthError(err);
      if (message) setError(message);
    }
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (err) {
      setError(describeAuthError(err));
    }
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (err) {
      setError(describeAuthError(err));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    setError(null);
    // Deliberately NOT clearing EVER_SIGNED_IN_KEY: a logout is what makes
    // AppGate show the plain sign-in card instead of the full onboarding
    // welcome experience on this browser from now on.
  }, []);

  // Legacy bridge, kept only in case any other script still reads
  // window.UDDAuth. requireAuth()/isSignedIn() reflect real auth state;
  // show()/hide() are now no-ops since the sign-in surface is fully owned
  // by AppGate, not a dismissible dialog toggled from elsewhere.
  useEffect(() => {
    window.UDDAuth = {
      requireAuth: () => ready && !!user,
      isSignedIn: () => ready && !!user,
      getCurrentUser: () => user,
      show: () => {},
      hide: () => {},
      signOut: () => {
        void signOutUser();
      },
    };
  }, [user, ready, signOutUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isAdmin,
      error,
      profile,
      profileReady,
      hasSignedInBefore,
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
      profile,
      profileReady,
      hasSignedInBefore,
      signInGoogle,
      signInApple,
      signInEmail,
      signUpEmail,
      signOutUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
