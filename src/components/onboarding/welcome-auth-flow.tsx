/**
 * Ported from the standalone onboarding prototype (App.tsx, pages 1–3:
 * 'welcome' | 'theme-reveal' | 'auth'). Markup, classNames, and motion
 * sequences are unchanged from the original design — only the handlers are
 * rewired: theme selection now calls the real ThemeProvider, and the auth
 * form/social buttons now call real Firebase auth via useAuth() instead of
 * faking a signed-in state.
 *
 * Shown by <AppGate> only to a browser that has never signed in before
 * (see auth-provider.tsx `hasSignedInBefore`). Once sign-in/sign-up
 * succeeds, `user` becomes truthy in AuthProvider and AppGate itself swaps
 * this component out for <OnboardingDataFlow> — there is no manual
 * hand-off here, it's a natural consequence of the auth state changing.
 */
import { useEffect, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";

type PageState = "welcome" | "theme-reveal" | "auth";
type ThemeOption = "light" | "dark";

export function WelcomeAuthFlow() {
  const { error, signInGoogle, signInApple, signInEmail, signUpEmail } =
    useAuth();
  const { dark, setDark } = useTheme();

  const [currentPage, setCurrentPage] = useState<PageState>("welcome");
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [hasGlowRevealed, setHasGlowRevealed] = useState(false);
  const [showDotBubble, setShowDotBubble] = useState(false);
  const [isThemeSplit, setIsThemeSplit] = useState(false);

  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formHint, setFormHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGetStartedClick = () => {
    setIsButtonPressed(true);
    setTimeout(() => {
      setCurrentPage("theme-reveal");
    }, 280);
  };

  useEffect(() => {
    if (currentPage !== "theme-reveal") return undefined;

    setShowGlow(false);
    setShowDotBubble(false);
    setIsThemeSplit(false);

    const glowTimer = setTimeout(() => {
      setShowGlow(true);
      setHasGlowRevealed(true);
    }, 1000);

    const dotTimer = setTimeout(() => {
      setShowDotBubble(true);
    }, 2200);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(dotTimer);
    };
  }, [currentPage]);

  const handlePickThemeClick = () => {
    setIsThemeSplit(true);
  };

  const handleSelectTheme = (theme: ThemeOption) => {
    setDark(theme === "dark");
    setTimeout(() => {
      setCurrentPage("auth");
    }, 320);
  };

  const handleEmailAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormHint("Please enter both email and password.");
      return;
    }
    setFormHint(null);
    setSubmitting(true);
    try {
      if (authMode === "signin") await signInEmail(email, password);
      else await signUpEmail(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: "Google" | "Apple") => {
    setSubmitting(true);
    try {
      if (provider === "Google") await signInGoogle();
      else await signInApple();
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = dark;
  const statusMessage = formHint ?? error;

  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden select-none font-sans transition-colors duration-500 ${
        isDark && currentPage === "auth"
          ? "bg-neutral-950 text-white"
          : "bg-white text-neutral-900"
      }`}
    >
      <AnimatePresence mode="wait">
        {/* ================= STEP 1: WELCOME ================= */}
        {currentPage === "welcome" && (
          <motion.main
            key="welcome-page"
            id="onboarding-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-screen w-full bg-white flex flex-col items-center pt-16 px-6"
          >
            <div
              id="company-subtitle"
              className="absolute top-6 left-6 text-xs sm:text-sm font-medium text-neutral-500 tracking-wide"
            >
              cherrylabs.inc
            </div>

            <h1
              id="welcome-title"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 text-center"
            >
              Welcome
            </h1>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                id="get-started-button"
                onClick={handleGetStartedClick}
                className={`pointer-events-auto px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-200 border cursor-pointer ${
                  isButtonPressed
                    ? "bg-black text-white border-black scale-95 shadow-md"
                    : "bg-white text-black border-neutral-300 hover:border-neutral-900 hover:scale-[1.02] shadow-sm active:scale-95"
                }`}
              >
                GET STARTED
              </button>
            </div>
          </motion.main>
        )}

        {/* ================= STEP 2: GLOW & THEME SPLIT REVEAL ================= */}
        {currentPage === "theme-reveal" && (
          <motion.main
            key="theme-reveal-page"
            id="theme-reveal-page"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-screen w-full bg-white overflow-hidden flex flex-col justify-between"
          >
            <div className="relative z-30 w-full flex items-center justify-between p-6">
              <div
                id="company-subtitle-step2"
                className="text-xs sm:text-sm font-medium text-neutral-400 tracking-wide"
              >
                cherrylabs.inc
              </div>
            </div>

            <div className="relative z-30 flex-1 flex items-center justify-center px-4">
              <AnimatePresence>
                {showDotBubble && (
                  <motion.div
                    key="dot-bubble-container"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 0.25, 1.1, 1],
                      opacity: [0, 0.7, 1, 1],
                    }}
                    transition={{
                      duration: 0.75,
                      times: [0, 0.2, 0.7, 1],
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="flex items-center justify-center"
                  >
                    {!isThemeSplit ? (
                      <motion.button
                        id="choose-theme-button"
                        onClick={handlePickThemeClick}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        className="px-8 py-3.5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-2xl hover:bg-neutral-800 transition-all cursor-pointer border border-neutral-800"
                      >
                        Choose Theme
                      </motion.button>
                    ) : (
                      <motion.div
                        id="split-theme-buttons"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                      >
                        <motion.button
                          id="theme-onyx-dark-btn"
                          initial={{ x: 25, scale: 0.85, opacity: 0 }}
                          animate={{ x: 0, scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.45,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelectTheme("dark")}
                          className="w-44 py-3.5 rounded-full bg-black text-white text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-xl hover:bg-neutral-900 border border-neutral-800 cursor-pointer flex items-center justify-center text-center"
                        >
                          Onyx Dark
                        </motion.button>

                        <motion.button
                          id="theme-clean-white-btn"
                          initial={{ x: -25, scale: 0.85, opacity: 0 }}
                          animate={{ x: 0, scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.45,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelectTheme("light")}
                          className="w-44 py-3.5 rounded-full bg-white text-black text-xs sm:text-sm font-semibold tracking-wider uppercase shadow-xl hover:bg-neutral-50 border border-neutral-300 hover:border-neutral-500 cursor-pointer flex items-center justify-center text-center"
                        >
                          Clean White
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        )}

        {/* ================= STEP 3: AUTHENTICATION ================= */}
        {currentPage === "auth" && (
          <motion.main
            key="auth-page"
            id="auth-page"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 z-20"
          >
            <div className="w-full flex items-center justify-between">
              <div
                id="company-subtitle-auth"
                className={`text-xs sm:text-sm font-medium tracking-wide ${
                  isDark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                cherrylabs.inc
              </div>
            </div>

            <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center py-6">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full text-center mb-6"
              >
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                  {authMode === "signin" ? "Welcome back" : "Create an account"}
                </h2>
                <p
                  className={`text-xs sm:text-sm ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                >
                  {authMode === "signin"
                    ? "Sign in to access your cherrylabs workspace"
                    : "Get started with your free cherrylabs account"}
                </p>
              </motion.div>

              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`w-full mb-5 p-3 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium border ${
                    isDark
                      ? "bg-neutral-900 border-neutral-700 text-neutral-300"
                      : "bg-neutral-100 border-neutral-300 text-neutral-700"
                  }`}
                >
                  <span>{statusMessage}</span>
                </motion.div>
              )}

              <form
                id="email-auth-form"
                onSubmit={(e) => void handleEmailAuthSubmit(e)}
                className="w-full flex flex-col gap-3.5"
              >
                <div>
                  <label
                    htmlFor="auth-email-input"
                    className={`block text-[11px] uppercase tracking-wider font-semibold mb-1.5 ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail
                      className={`absolute left-3.5 w-4 h-4 pointer-events-none ${
                        isDark ? "text-neutral-500" : "text-neutral-400"
                      }`}
                    />
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none border ${
                        isDark
                          ? "bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30"
                          : "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 shadow-xs"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-password-input"
                      className={`block text-[11px] uppercase tracking-wider font-semibold ${
                        isDark ? "text-neutral-400" : "text-neutral-600"
                      }`}
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative flex items-center">
                    <Lock
                      className={`absolute left-3.5 w-4 h-4 pointer-events-none ${
                        isDark ? "text-neutral-500" : "text-neutral-400"
                      }`}
                    />
                    <input
                      id="auth-password-input"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm transition-all outline-none border ${
                        isDark
                          ? "bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30"
                          : "bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 shadow-xs"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 p-1 rounded hover:opacity-80 transition-opacity cursor-pointer ${
                        isDark ? "text-neutral-400" : "text-neutral-500"
                      }`}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  id="email-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className={`w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 ${
                    isDark
                      ? "bg-white hover:bg-neutral-100 text-black hover:shadow-neutral-800"
                      : "bg-black hover:bg-neutral-800 text-white"
                  }`}
                >
                  <span>
                    {submitting
                      ? "Please wait…"
                      : authMode === "signin"
                        ? "Sign in with Email"
                        : "Create Account with Email"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="w-full flex items-center gap-3 my-5">
                <div
                  className={`flex-1 h-px ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                />
                <span
                  className={`text-[11px] uppercase tracking-wider ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
                >
                  or continue with
                </span>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-neutral-800" : "bg-neutral-200"}`}
                />
              </div>

              <div className="w-full flex flex-col gap-2.5">
                <button
                  id="signin-google-btn"
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleSocialAuth("Google")}
                  className={`w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all shadow-xs cursor-pointer border disabled:opacity-60 ${
                    isDark
                      ? "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 text-white"
                      : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900 hover:border-neutral-300"
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {authMode === "signin"
                      ? "Sign in by Google"
                      : "Sign up with Google"}
                  </span>
                </button>

                <button
                  id="signin-apple-btn"
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleSocialAuth("Apple")}
                  className={`w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all shadow-xs cursor-pointer border disabled:opacity-60 ${
                    isDark
                      ? "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 text-white"
                      : "bg-neutral-900 hover:bg-black text-white border-neutral-900"
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.03-7.6-7.8-11.7-14.3-5.3-8.36-9.47-17.88-12.52-28.56-3.04-10.68-4.57-20.73-4.57-30.15 0-14.28 3.65-25.86 10.96-34.75 7.3-8.89 16.5-13.43 27.6-13.62 4.58 0 9.7 1.2 15.36 3.6 5.65 2.4 9.17 3.66 10.55 3.8 2.02-.34 5.6-1.63 10.74-3.86 5.14-2.24 9.94-3.26 14.4-3.07 10.45.54 18.9 4.3 25.35 11.28 6.45 6.98 10.48 15.42 12.09 25.32-9.28 5.6-13.84 13.3-13.68 23.1.16 7.6 2.92 14.15 8.28 19.64 5.36 5.5 12.05 8.9 20.07 10.2-1.74 5.48-3.78 10.7-6.12 15.65zM119.22 31.84c0-6.14 2.22-11.96 6.66-17.46 4.44-5.5 9.8-9.4 16.08-11.7-.85 5.9-3.1 11.63-6.75 17.18-3.65 5.56-9.12 9.68-16.4 12.37.14-.14.28-.27.41-.39z" />
                  </svg>
                  <span>
                    {authMode === "signin"
                      ? "Sign in by Apple"
                      : "Sign up with Apple"}
                  </span>
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  id="create-account-toggle-btn"
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "signin" ? "signup" : "signin");
                    setFormHint(null);
                  }}
                  className={`text-xs sm:text-sm font-medium tracking-wide underline underline-offset-4 hover:opacity-75 transition-opacity cursor-pointer ${
                    isDark ? "text-neutral-300" : "text-neutral-700"
                  }`}
                >
                  {authMode === "signin"
                    ? "Create an account?"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>

            <div
              className={`w-full text-center text-[11px] pb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
            >
              By proceeding, you agree to our Terms of Service and Privacy
              Policy.
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {(showGlow || (hasGlowRevealed && currentPage !== "welcome")) && (
        <motion.div
          id="stratified-curved-glow-layer"
          initial={
            currentPage === "theme-reveal" && !hasGlowRevealed
              ? { opacity: 0, y: 140 }
              : { opacity: 1, y: 0 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: hasGlowRevealed ? 0.6 : 2.0,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="pointer-events-none fixed inset-0 overflow-hidden z-10 flex flex-col justify-end"
        >
          <div className="relative w-full h-[52vh] min-h-[340px] max-h-[580px] pointer-events-none">
            <div
              className="absolute -bottom-12 left-[-10%] w-[68vw] max-w-[850px] h-[48vh] rounded-[100%_90%_70%_80%/100%_100%_40%_40%] blur-[75px] opacity-95 transition-all duration-700"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse 90% 75% at 45% 100%, #FFAEC9 0%, #FF85B3 30%, #FF4D94 55%, transparent 85%)"
                  : "radial-gradient(ellipse 90% 75% at 45% 100%, #FFB8D2 0%, #FFA1C5 35%, #FF7AA8 60%, transparent 85%)",
                mixBlendMode: isDark ? "screen" : "multiply",
              }}
            />
            <div
              className="absolute -bottom-12 right-[-10%] w-[68vw] max-w-[850px] h-[48vh] rounded-[90%_100%_80%_70%/100%_100%_40%_40%] blur-[75px] opacity-95 transition-all duration-700"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse 90% 75% at 55% 100%, #80D4FF 0%, #47BEFF 30%, #0099FF 55%, transparent 85%)"
                  : "radial-gradient(ellipse 90% 75% at 55% 100%, #99DEFF 0%, #70CDFF 35%, #38B6FF 60%, transparent 85%)",
                mixBlendMode: isDark ? "screen" : "multiply",
              }}
            />
            <div
              className="absolute -bottom-10 left-[18%] right-[18%] h-[38vh] rounded-[100%_100%_60%_60%/100%_100%_35%_35%] blur-[85px] opacity-80 transition-all duration-700"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse 100% 80% at 50% 100%, #D8B4FE 0%, #A5B4FC 25%, #67E8F9 50%, transparent 80%)"
                  : "radial-gradient(ellipse 100% 80% at 50% 100%, #FFD1DC 0%, #BAE6FD 30%, #7DD3FC 55%, transparent 80%)",
                mixBlendMode: isDark ? "screen" : "multiply",
              }}
            />
            <div
              className="absolute bottom-0 inset-x-0 h-[100px] blur-[32px] opacity-95"
              style={{
                background: isDark
                  ? "linear-gradient(to top, rgba(255, 175, 205, 0.75) 0%, rgba(110, 200, 255, 0.75) 50%, transparent 100%)"
                  : "linear-gradient(to top, rgba(255, 185, 215, 0.85) 0%, rgba(135, 215, 255, 0.85) 50%, transparent 100%)",
                mixBlendMode: isDark ? "screen" : "multiply",
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
