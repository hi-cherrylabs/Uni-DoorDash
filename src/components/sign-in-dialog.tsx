import { useState } from "react";
import type { FormEvent } from "react";

import logo from "@/assets/udd-logo.png";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth-provider";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.9v2.9h6.6c-.3 1.6-2.2 4.7-6.6 4.7-4 0-7.2-3.3-7.2-7.5S8 3.5 12 3.5c2.3 0 3.8.9 4.7 1.8l2.5-2.4C17.6 1.3 15 .3 12 .3 5.7.3.5 5.5.5 11.9S5.7 23.5 12 23.5c6.9 0 11.5-4.9 11.5-11.7 0-.8-.1-1.4-.2-1.9H12Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden="true">
      <path d="M16.7 1.5c0 1.1-.4 2.1-1.1 2.9-.8.9-2 1.6-3.1 1.5-.1-1.1.4-2.2 1.1-2.9.8-.9 2.1-1.6 3.1-1.5ZM19.9 17c-.5 1.2-.8 1.7-1.5 2.7-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.7.9-1.6 0-2.8-1.5-3.7-2.9-2.5-3.9-2.8-8.5-1.2-11 1.1-1.8 2.9-2.9 4.6-2.9 1.7 0 2.8 1 4.2 1 1.4 0 2.2-1 4.2-1 1.5 0 3.1.8 4.2 2.2-3.7 2-3.1 7.3.4 8.8Z" />
    </svg>
  );
}

export function SignInDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { error, signInGoogle, signInApple, signInEmail, signUpEmail } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signin") await signInEmail(email, password);
      else await signUpEmail(email, password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card text-center">
        <div className="flex flex-col items-center gap-1 pt-2">
          <img src={logo} alt="Uni Door Dash" className="h-9 w-auto object-contain" />
          <p className="mt-2 text-lg font-semibold">Uni Door Dash</p>
          <p className="text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to continue" : "Create an account to continue"}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => void signInGoogle()}
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-accent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent/70"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => void signInApple()}
            className="flex items-center justify-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5 text-left">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)" }}
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {mode === "signin" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
        </button>

        <p className="text-[11px] leading-snug text-muted-foreground">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}
