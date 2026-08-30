/**
 * Ported from the standalone onboarding prototype (App.tsx, page 4:
 * 'onboarding' — the Rockbot avatar + morphing dock sequence). Markup,
 * classNames, and motion sequences are unchanged from the original design.
 *
 * Rewired for real persistence: every step writes to this account's
 * `users/{uid}` profile doc via saveOnboardingStep() as it's completed, and
 * `lastStep` is kept in sync so closing the tab mid-flow resumes exactly
 * where it left off (see `initialStep` prop, supplied by <AppGate> from
 * `profile.lastStep`). Reaching the final step sets `onboardingComplete`,
 * which is what tells AppGate the wall can come down — but AppGate keeps
 * showing this component until `onFinished` fires (the person clicking
 * "Unidoordash home"), so the completion screen never gets cut off by the
 * profile update reactively swapping views out from under them.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Building2,
  ChevronDown,
  Search,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { useDistricts } from "@/hooks/use-districts";
import { saveOnboardingStep, type OnboardingStep } from "@/lib/firestore-data";
import { validateTanzaniaPhone } from "@/lib/tanzania-phone";
import {
  RockbotAvatar,
  type AvatarExpressionName,
} from "@/components/onboarding/rockbot-avatar";

export function OnboardingDataFlow({
  initialStep,
  onFinished,
}: {
  initialStep: OnboardingStep;
  onFinished: () => void;
}) {
  const { user, profile } = useAuth();
  const { dark: isDark } = useTheme();
  const { districts } = useDistricts();

  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(
    initialStep === "seller-submitted" ? "seller-contact" : initialStep,
  );
  const [showSetupDot, setShowSetupDot] = useState(true);
  const [isSetupButtonPressed, setIsSetupButtonPressed] = useState(false);
  const [avatarExpression, setAvatarExpression] =
    useState<AvatarExpressionName>("neutral");

  // Local working copy, pre-filled from any prior partial progress so a
  // resumed session doesn't ask the person to retype what they already gave.
  const [username, setUsername] = useState(profile?.username ?? "");
  const [selectedDistrictId, setSelectedDistrictId] = useState(
    profile?.districtId ?? "",
  );
  const [selectedWard, setSelectedWard] = useState(profile?.ward ?? "");
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
  const [wardSearchFilter, setWardSearchFilter] = useState("");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [businessName, setBusinessName] = useState(profile?.businessName ?? "");
  const [sellerEmail, setSellerEmail] = useState(
    profile?.sellerEmail ?? user?.email ?? "",
  );
  const [sellerPhone, setSellerPhone] = useState(profile?.sellerPhone ?? "");

  const currentDistrict = districts.find((d) => d.id === selectedDistrictId);
  const filteredWards = (currentDistrict?.wards || []).filter((w) =>
    w.toLowerCase().includes(wardSearchFilter.toLowerCase().trim()),
  );

  useEffect(() => {
    setShowSetupDot(true);
    const timer = setTimeout(() => setShowSetupDot(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    switch (onboardingStep) {
      case "start-button":
        setAvatarExpression("attentive-left");
        break;
      case "username":
        setAvatarExpression("curious-left");
        break;
      case "location":
        setAvatarExpression("downward-gaze");
        break;
      case "phone":
        setAvatarExpression("skeptical-right");
        break;
      case "terms":
        setAvatarExpression("gentle-downward-gaze");
        break;
      case "business-question":
        setAvatarExpression("skeptical-left");
        break;
      case "business-name":
        setAvatarExpression("attentive-left");
        break;
      case "sell-question":
        setAvatarExpression("curious-left");
        break;
      case "seller-contact":
        setAvatarExpression("small-attentive");
        break;
      case "seller-submitted":
        setAvatarExpression("joyful-down-right");
        break;
      case "completed":
        setAvatarExpression("joyful-wide");
        break;
      default:
        setAvatarExpression("neutral");
    }
  }, [onboardingStep]);

  /** Persists a step's data and advances the local UI immediately — Firestore write happens in the background so the dock never waits on a round trip. */
  function goToStep(next: OnboardingStep, patch: Record<string, unknown> = {}) {
    setOnboardingStep(next);
    if (!user) return;
    void saveOnboardingStep(user.uid, user.email, {
      ...patch,
      lastStep: next,
      ...(next === "completed" ? { onboardingComplete: true } : {}),
    });
  }

  const handleSetupButtonClick = () => {
    setIsSetupButtonPressed(true);
    setTimeout(() => goToStep("username"), 300);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.trim();
    if (!clean) {
      setPhoneError("Please enter your phone number");
      return;
    }
    const res = validateTanzaniaPhone(clean);
    if (!res.isValid && res.rawDigits.length < 8) {
      setPhoneError(
        res.error ||
          "Please enter a valid Tanzanian mobile number (e.g. 0712 345 678, 0654 123 456, or +255 712 345 678)",
      );
      return;
    }
    setPhoneError("");
    const formattedPhone = res.internationalFormat || clean;
    setPhone(formattedPhone);
    setSellerPhone((prev) => prev || formattedPhone);
    goToStep("terms", { phone: formattedPhone });
  };

  return (
    <div
      className={`relative min-h-screen w-full overflow-x-hidden select-none font-sans transition-colors duration-500 ${
        isDark ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"
      }`}
    >
      <main
        id="onboarding-flow-page"
        className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 z-20 overflow-y-auto"
      >
        <div className="w-full flex items-center justify-between">
          <div
            id="company-subtitle-onboard"
            className={`text-xs sm:text-sm font-medium tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
          >
            cherrylabs.inc
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto my-auto flex flex-col items-center py-4">
          <motion.div
            id="rockbot-avatar-container"
            initial={{ scale: 0.85, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 flex flex-col items-center"
          >
            <RockbotAvatar expression={avatarExpression} size={118} />
          </motion.div>

          <div className="w-full flex items-center justify-center min-h-[220px]">
            <AnimatePresence mode="wait">
              {/* Step 0 */}
              {onboardingStep === "start-button" && (
                <motion.div
                  key="step-start-suspended"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center justify-center"
                >
                  {showSetupDot ? (
                    <motion.div
                      id="setup-pulsing-dot"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.4, 1] }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`w-3.5 h-3.5 rounded-full animate-pulse shadow-md ${
                        isDark
                          ? "bg-white shadow-white/30"
                          : "bg-black shadow-black/30"
                      }`}
                    />
                  ) : (
                    <motion.button
                      id="lets-get-started-btn"
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.65,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      onClick={handleSetupButtonClick}
                      className={`px-8 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 border cursor-pointer shadow-xl ${
                        isSetupButtonPressed
                          ? "bg-black text-white border-black scale-95"
                          : isDark
                            ? "bg-white text-black border-white hover:bg-neutral-100 hover:scale-105"
                            : "bg-white text-black border-neutral-300 hover:border-black hover:scale-105"
                      }`}
                    >
                      let's get you set up
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Step 1: Username */}
              {onboardingStep === "username" && (
                <motion.div
                  key="step-username-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center"
                >
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-6 text-center">
                    what should we call you?
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (username.trim())
                        goToStep("location", { username: username.trim() });
                    }}
                    className="w-full flex items-center gap-3"
                  >
                    <div className="relative flex-1">
                      <input
                        id="username-input"
                        type="text"
                        required
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your name or alias"
                        className={`w-full px-6 py-4 rounded-full text-sm sm:text-base outline-none border transition-all shadow-lg backdrop-blur-md ${
                          isDark
                            ? "bg-neutral-900/90 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                            : "bg-white/95 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-neutral-200/50"
                        }`}
                      />
                    </div>
                    <button
                      id="username-next-btn"
                      type="submit"
                      disabled={!username.trim()}
                      className={`w-13 h-13 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-lg ${
                        isDark
                          ? "bg-white text-black hover:bg-neutral-200 disabled:opacity-30"
                          : "bg-black text-white hover:bg-neutral-800 disabled:opacity-30"
                      }`}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Location */}
              {onboardingStep === "location" && (
                <motion.div
                  key="step-location-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xl">🇹🇿</span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-center">
                      what is your current location?
                    </h3>
                  </div>
                  <p
                    className={`text-xs text-center mb-6 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                  >
                    Select your district and ward in Dar es Salaam
                  </p>

                  <div className="w-full flex flex-col gap-3.5 relative">
                    <div className="relative">
                      <button
                        id="district-select-btn"
                        type="button"
                        onClick={() => {
                          setIsDistrictDropdownOpen(!isDistrictDropdownOpen);
                          setIsWardDropdownOpen(false);
                        }}
                        className={`w-full px-6 py-4 rounded-full text-sm sm:text-base text-left flex items-center justify-between border transition-all shadow-lg backdrop-blur-md cursor-pointer ${
                          isDark
                            ? "bg-neutral-900/90 border-neutral-800 text-white hover:border-neutral-700"
                            : "bg-white/95 border-neutral-200 text-neutral-900 hover:border-neutral-300 shadow-neutral-200/50"
                        } ${
                          isDistrictDropdownOpen
                            ? isDark
                              ? "ring-2 ring-sky-400/30 border-sky-400"
                              : "ring-2 ring-sky-500/30 border-sky-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <MapPin
                            className={`w-4 h-4 shrink-0 ${currentDistrict ? "text-sky-400" : "text-neutral-400"}`}
                          />
                          <span
                            className={`truncate font-medium ${
                              currentDistrict
                                ? isDark
                                  ? "text-white"
                                  : "text-neutral-900"
                                : "text-neutral-400"
                            }`}
                          >
                            {currentDistrict
                              ? currentDistrict.name
                              : "Select District (Dar es Salaam)"}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isDistrictDropdownOpen
                              ? "rotate-180 text-sky-400"
                              : "text-neutral-400"
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isDistrictDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            className={`absolute left-0 right-0 top-full mt-2 z-30 p-2.5 rounded-2xl border shadow-2xl backdrop-blur-xl max-h-60 overflow-y-auto ${
                              isDark
                                ? "bg-neutral-900/95 border-neutral-800 shadow-black/80"
                                : "bg-white/95 border-neutral-200 shadow-neutral-300/50"
                            }`}
                          >
                            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                              <span>Dar es Salaam Districts</span>
                              <span>5 Municipal Councils</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                              {districts.map((dist) => {
                                const isSelected =
                                  selectedDistrictId === dist.id;
                                return (
                                  <button
                                    key={dist.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedDistrictId(dist.id);
                                      setSelectedWard("");
                                      setWardSearchFilter("");
                                      setIsDistrictDropdownOpen(false);
                                      setIsWardDropdownOpen(true);
                                    }}
                                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                      isSelected
                                        ? isDark
                                          ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                          : "bg-sky-50 text-sky-700 border border-sky-200"
                                        : isDark
                                          ? "hover:bg-neutral-800/90 text-neutral-200"
                                          : "hover:bg-neutral-100 text-neutral-800"
                                    }`}
                                  >
                                    <div className="flex flex-col truncate pr-2">
                                      <span className="font-semibold text-xs sm:text-sm">
                                        {dist.name}
                                      </span>
                                      <span className="text-[10px] text-neutral-400 truncate">
                                        {dist.popularAreas}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                        isDark
                                          ? "bg-neutral-800 text-neutral-300"
                                          : "bg-neutral-100 text-neutral-600"
                                      }`}
                                    >
                                      {dist.wardsCount} Wards
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {selectedDistrictId && currentDistrict && (
                        <motion.div
                          initial={{ opacity: 0, y: 14, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.96 }}
                          transition={{
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="w-full flex items-center gap-3 relative"
                        >
                          <div className="relative flex-1">
                            <button
                              id="ward-select-btn"
                              type="button"
                              onClick={() => {
                                setIsWardDropdownOpen(!isWardDropdownOpen);
                                setIsDistrictDropdownOpen(false);
                              }}
                              className={`w-full px-6 py-4 rounded-full text-sm sm:text-base text-left flex items-center justify-between border transition-all shadow-lg backdrop-blur-md cursor-pointer ${
                                isDark
                                  ? "bg-neutral-900/90 border-neutral-800 text-white hover:border-neutral-700"
                                  : "bg-white/95 border-neutral-200 text-neutral-900 hover:border-neutral-300 shadow-neutral-200/50"
                              } ${
                                isWardDropdownOpen
                                  ? isDark
                                    ? "ring-2 ring-sky-400/30 border-sky-400"
                                    : "ring-2 ring-sky-500/30 border-sky-500"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-3 truncate">
                                <span
                                  className={`truncate font-medium ${selectedWard ? (isDark ? "text-white" : "text-neutral-900") : "text-neutral-400"}`}
                                >
                                  {selectedWard ||
                                    `Select Ward (${currentDistrict.shortName})`}
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                                  isWardDropdownOpen
                                    ? "rotate-180 text-pink-400"
                                    : "text-neutral-400"
                                }`}
                              />
                            </button>

                            <AnimatePresence>
                              {isWardDropdownOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                  className={`absolute left-0 right-0 top-full mt-2 z-30 p-3 rounded-2xl border shadow-2xl backdrop-blur-xl max-h-64 flex flex-col ${
                                    isDark
                                      ? "bg-neutral-900/95 border-neutral-800 shadow-black/80"
                                      : "bg-white/95 border-neutral-200 shadow-neutral-300/50"
                                  }`}
                                >
                                  <div className="relative mb-2 shrink-0">
                                    <Search
                                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
                                    />
                                    <input
                                      type="text"
                                      value={wardSearchFilter}
                                      onChange={(e) =>
                                        setWardSearchFilter(e.target.value)
                                      }
                                      placeholder={`Search ${currentDistrict.shortName} wards...`}
                                      className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none border transition-all ${
                                        isDark
                                          ? "bg-neutral-950/80 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-sky-400"
                                          : "bg-neutral-50 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500"
                                      }`}
                                      onClick={(e) => e.stopPropagation()}
                                      autoFocus
                                    />
                                  </div>

                                  <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                                    <span>
                                      Wards in {currentDistrict.shortName}
                                    </span>
                                    <span>{filteredWards.length} found</span>
                                  </div>

                                  <div className="overflow-y-auto max-h-44 pr-1 flex flex-col gap-0.5">
                                    {filteredWards.length === 0 ? (
                                      <div className="py-4 text-center text-xs text-neutral-400">
                                        No ward matching &quot;
                                        {wardSearchFilter}&quot;
                                      </div>
                                    ) : (
                                      filteredWards.map((ward) => {
                                        const isWardSelected =
                                          selectedWard === ward;
                                        return (
                                          <button
                                            key={ward}
                                            type="button"
                                            onClick={() => {
                                              setSelectedWard(ward);
                                              setIsWardDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                              isWardSelected
                                                ? isDark
                                                  ? "bg-sky-500/20 text-sky-300 font-semibold"
                                                  : "bg-sky-50 text-sky-700 font-semibold"
                                                : isDark
                                                  ? "hover:bg-neutral-800 text-neutral-200"
                                                  : "hover:bg-neutral-100 text-neutral-800"
                                            }`}
                                          >
                                            <span>{ward}</span>
                                            {isWardSelected && (
                                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                                            )}
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <button
                            id="location-next-btn"
                            type="button"
                            disabled={!selectedWard}
                            onClick={() => {
                              if (selectedWard && currentDistrict) {
                                goToStep("phone", {
                                  districtId: currentDistrict.id,
                                  districtName: currentDistrict.name,
                                  ward: selectedWard,
                                });
                              }
                            }}
                            className={`w-13 h-13 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-lg ${
                              isDark
                                ? "bg-white text-black hover:bg-neutral-200 disabled:opacity-30"
                                : "bg-black text-white hover:bg-neutral-800 disabled:opacity-30"
                            }`}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Phone */}
              {onboardingStep === "phone" && (
                <motion.div
                  key="step-phone-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center"
                >
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 text-center">
                    enter your phone number details
                  </h3>

                  <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                    {(() => {
                      const check = validateTanzaniaPhone(phone);
                      if (check.operator) {
                        return (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                            <span>🇹🇿</span> {check.operator}
                          </span>
                        );
                      }
                      return (
                        <p
                          className={`text-xs text-center ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                        >
                          Tanzanian mobile number (e.g. 0712 345 678 or 0654 123
                          456)
                        </p>
                      );
                    })()}
                  </div>

                  <form
                    onSubmit={handlePhoneSubmit}
                    className="w-full flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1 flex items-center">
                        <span className="absolute left-5 text-xs font-semibold text-neutral-400 flex items-center gap-1.5 pointer-events-none">
                          <span>🇹🇿</span> +255
                        </span>
                        <input
                          id="phone-input"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setPhoneError("");
                          }}
                          placeholder="712 345 678"
                          className={`w-full pl-22 pr-6 py-4 rounded-full text-sm sm:text-base outline-none border transition-all shadow-lg backdrop-blur-md ${
                            phoneError
                              ? "border-red-500 focus:border-red-500 ring-2 ring-red-500/20"
                              : isDark
                                ? "bg-neutral-900/90 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                                : "bg-white/95 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-neutral-200/50"
                          }`}
                        />
                      </div>
                      <button
                        id="phone-next-btn"
                        type="submit"
                        disabled={!phone.trim()}
                        className={`w-13 h-13 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-lg ${
                          isDark
                            ? "bg-white text-black hover:bg-neutral-200 disabled:opacity-30"
                            : "bg-black text-white hover:bg-neutral-800 disabled:opacity-30"
                        }`}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                    {phoneError && (
                      <span className="text-xs text-red-500 mt-1 text-center font-medium">
                        {phoneError}
                      </span>
                    )}
                  </form>
                </motion.div>
              )}

              {/* Step 4: Terms */}
              {onboardingStep === "terms" && (
                <motion.div
                  key="step-terms-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center text-center"
                >
                  <ShieldCheck className="w-10 h-10 text-sky-400 mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                    agree on our personal terms and policies
                  </h3>
                  <p
                    className={`text-xs sm:text-sm max-w-sm mb-6 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                  >
                    By continuing, you agree to our standard community
                    guidelines, privacy protection, and service terms.
                  </p>
                  <button
                    id="agree-terms-btn"
                    onClick={() =>
                      goToStep("business-question", { hasAgreedTerms: true })
                    }
                    className={`px-10 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-xl cursor-pointer ${
                      isDark
                        ? "bg-white text-black hover:bg-neutral-100 hover:scale-105"
                        : "bg-black text-white hover:bg-neutral-800 hover:scale-105"
                    }`}
                  >
                    Agree
                  </button>
                </motion.div>
              )}

              {/* Step 5: Business ownership */}
              {onboardingStep === "business-question" && (
                <motion.div
                  key="step-biz-q-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center text-center"
                >
                  <Building2 className="w-10 h-10 text-pink-400 mb-3" />
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-6">
                    do you own a business?
                  </h3>
                  <div className="flex items-center gap-4 w-full max-w-xs justify-center">
                    <button
                      id="biz-yes-btn"
                      onClick={() =>
                        goToStep("business-name", { ownsBusiness: true })
                      }
                      className={`flex-1 py-4 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-lg cursor-pointer border ${
                        isDark
                          ? "bg-white text-black hover:bg-neutral-100 border-white hover:scale-105"
                          : "bg-black text-white hover:bg-neutral-800 border-black hover:scale-105"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      id="biz-no-btn"
                      onClick={() =>
                        goToStep("completed", { ownsBusiness: false })
                      }
                      className={`flex-1 py-4 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer border backdrop-blur-md ${
                        isDark
                          ? "bg-neutral-900/80 text-neutral-300 border-neutral-700 hover:text-white hover:border-neutral-500 hover:scale-105"
                          : "bg-white/90 text-neutral-800 border-neutral-300 hover:border-neutral-600 hover:scale-105"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 5A: Business name */}
              {onboardingStep === "business-name" && (
                <motion.div
                  key="step-biz-name-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center"
                >
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-6 text-center">
                    what business do you own?
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (businessName.trim())
                        goToStep("sell-question", {
                          businessName: businessName.trim(),
                        });
                    }}
                    className="w-full flex items-center gap-3"
                  >
                    <div className="relative flex-1">
                      <input
                        id="business-name-input"
                        type="text"
                        required
                        autoFocus
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Swahili Coast Apparel / Tech Hub"
                        className={`w-full px-6 py-4 rounded-full text-sm sm:text-base outline-none border transition-all shadow-lg backdrop-blur-md ${
                          isDark
                            ? "bg-neutral-900/90 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                            : "bg-white/95 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-neutral-200/50"
                        }`}
                      />
                    </div>
                    <button
                      id="biz-name-next-btn"
                      type="submit"
                      disabled={!businessName.trim()}
                      className={`w-13 h-13 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-lg ${
                        isDark
                          ? "bg-white text-black hover:bg-neutral-200 disabled:opacity-30"
                          : "bg-black text-white hover:bg-neutral-800 disabled:opacity-30"
                      }`}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 5B: Sell question */}
              {onboardingStep === "sell-question" && (
                <motion.div
                  key="step-sell-q-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center text-center"
                >
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-6">
                    would you like to sell your products on this website?
                  </h3>
                  <div className="flex items-center gap-4 w-full max-w-xs justify-center">
                    <button
                      id="sell-yes-btn"
                      onClick={() =>
                        goToStep("seller-contact", { wantsToSell: true })
                      }
                      className={`flex-1 py-4 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-lg cursor-pointer border ${
                        isDark
                          ? "bg-white text-black hover:bg-neutral-100 border-white hover:scale-105"
                          : "bg-black text-white hover:bg-neutral-800 border-black hover:scale-105"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      id="sell-no-btn"
                      onClick={() =>
                        goToStep("completed", { wantsToSell: false })
                      }
                      className={`flex-1 py-4 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-md cursor-pointer border backdrop-blur-md ${
                        isDark
                          ? "bg-neutral-900/80 text-neutral-300 border-neutral-700 hover:text-white hover:border-neutral-500 hover:scale-105"
                          : "bg-white/90 text-neutral-800 border-neutral-300 hover:border-neutral-600 hover:scale-105"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 5C: Seller contact */}
              {onboardingStep === "seller-contact" && (
                <motion.div
                  key="step-seller-contact-suspended"
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center"
                >
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-1 text-center">
                    enter your active email details and enter your phone number
                    details
                  </h3>
                  <p className="text-xs text-sky-400 text-center mb-6 font-semibold">
                    we'll get up to you
                  </p>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (sellerEmail && sellerPhone) {
                        goToStep("seller-submitted", {
                          sellerEmail,
                          sellerPhone,
                        });
                        setTimeout(() => goToStep("completed"), 1800);
                      }
                    }}
                    className="w-full flex flex-col gap-3.5"
                  >
                    <div>
                      <input
                        id="seller-email-input"
                        type="email"
                        required
                        value={sellerEmail}
                        onChange={(e) => setSellerEmail(e.target.value)}
                        placeholder="active business email (e.g. info@company.com)"
                        className={`w-full px-6 py-4 rounded-full text-sm outline-none border transition-all shadow-lg backdrop-blur-md ${
                          isDark
                            ? "bg-neutral-900/90 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-sky-400"
                            : "bg-white/95 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 shadow-neutral-200/50"
                        }`}
                      />
                    </div>

                    <div>
                      <input
                        id="seller-phone-input"
                        type="tel"
                        required
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        placeholder="active phone number (e.g. +255 712 345 678)"
                        className={`w-full px-6 py-4 rounded-full text-sm outline-none border transition-all shadow-lg backdrop-blur-md ${
                          isDark
                            ? "bg-neutral-900/90 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-sky-400"
                            : "bg-white/95 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-sky-500 shadow-neutral-200/50"
                        }`}
                      />
                    </div>

                    <button
                      id="seller-submit-btn"
                      type="submit"
                      className={`w-full mt-2 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-xl cursor-pointer ${
                        isDark
                          ? "bg-white text-black hover:bg-neutral-100 hover:scale-105"
                          : "bg-black text-white hover:bg-neutral-800 hover:scale-105"
                      }`}
                    >
                      Submit Details
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 5D: Submitted */}
              {onboardingStep === "seller-submitted" && (
                <motion.div
                  key="step-submitted-suspended"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-md flex flex-col items-center text-center py-4"
                >
                  <CheckCircle2 className="w-14 h-14 mb-3 text-emerald-400 animate-bounce" />
                  <h3 className="text-3xl font-bold tracking-tight text-emerald-400">
                    submitted
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2">
                    Our team will reach out to you shortly
                  </p>
                </motion.div>
              )}

              {/* Step 6: Completed */}
              {onboardingStep === "completed" && (
                <motion.div
                  key="step-completed-suspended"
                  initial={{ scale: 0.85, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md flex flex-col items-center text-center"
                >
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                    You&apos;re all set up
                  </h3>
                  <p
                    className={`text-xs sm:text-sm max-w-sm mb-6 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
                  >
                    {username
                      ? `Welcome aboard, ${username}!`
                      : "Welcome aboard!"}{" "}
                    Your account is fully configured and ready.
                  </p>

                  <div
                    className={`w-full max-w-xs p-4 rounded-2xl border text-xs text-left mb-6 flex flex-col gap-2 shadow-lg backdrop-blur-md ${
                      isDark
                        ? "bg-neutral-900/80 border-neutral-800"
                        : "bg-white/90 border-neutral-200"
                    }`}
                  >
                    {username && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">User:</span>
                        <span className="font-semibold">{username}</span>
                      </div>
                    )}
                    {currentDistrict && selectedWard && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Location:</span>
                        <span className="font-semibold">{`${selectedWard} Ward, ${currentDistrict.name}`}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Phone:</span>
                        <span className="font-semibold">{phone}</span>
                      </div>
                    )}
                    {businessName && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Business:</span>
                        <span className="font-semibold">{businessName}</span>
                      </div>
                    )}
                  </div>

                  <button
                    id="unidoordash-home-btn"
                    onClick={onFinished}
                    className={`px-8 py-4 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-xl cursor-pointer flex items-center justify-center ${
                      isDark
                        ? "bg-white text-black hover:bg-neutral-100 hover:scale-105"
                        : "bg-black text-white hover:bg-neutral-800 hover:scale-105"
                    }`}
                  >
                    Unidoordash home
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          className={`w-full text-center text-[11px] pb-2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`}
        >
          Cherry Labs Inc. Copyright 2026
        </div>
      </main>

      {/* Glow layer — shown immediately (no reveal delay) since by the time
          someone reaches this component they've either already seen the
          reveal animation in <WelcomeAuthFlow>, or arrived here directly
          via the plain sign-in card and never saw it at all. Either way,
          the background should just already be there. */}
      <motion.div
        id="stratified-curved-glow-layer-data-flow"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="pointer-events-none fixed inset-0 overflow-hidden z-10 flex flex-col justify-end"
      >
        <div className="relative w-full h-[52vh] min-h-[340px] max-h-[580px] pointer-events-none">
          <div
            className="absolute -bottom-12 left-[-10%] w-[68vw] max-w-[850px] h-[48vh] rounded-[100%_90%_70%_80%/100%_100%_40%_40%] blur-[75px] opacity-95"
            style={{
              background: isDark
                ? "radial-gradient(ellipse 90% 75% at 45% 100%, #FFAEC9 0%, #FF85B3 30%, #FF4D94 55%, transparent 85%)"
                : "radial-gradient(ellipse 90% 75% at 45% 100%, #FFB8D2 0%, #FFA1C5 35%, #FF7AA8 60%, transparent 85%)",
              mixBlendMode: isDark ? "screen" : "multiply",
            }}
          />
          <div
            className="absolute -bottom-12 right-[-10%] w-[68vw] max-w-[850px] h-[48vh] rounded-[90%_100%_80%_70%/100%_100%_40%_40%] blur-[75px] opacity-95"
            style={{
              background: isDark
                ? "radial-gradient(ellipse 90% 75% at 55% 100%, #80D4FF 0%, #47BEFF 30%, #0099FF 55%, transparent 85%)"
                : "radial-gradient(ellipse 90% 75% at 55% 100%, #99DEFF 0%, #70CDFF 35%, #38B6FF 60%, transparent 85%)",
              mixBlendMode: isDark ? "screen" : "multiply",
            }}
          />
          <div
            className="absolute -bottom-10 left-[18%] right-[18%] h-[38vh] rounded-[100%_100%_60%_60%/100%_100%_35%_35%] blur-[85px] opacity-80"
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
    </div>
  );
}
