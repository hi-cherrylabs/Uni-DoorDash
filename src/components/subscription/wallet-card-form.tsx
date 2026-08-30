import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";

import {
  WalletCardVisual,
  digitsOnly,
  formatCardNumber,
  type WalletCardField,
} from "@/components/subscription/wallet-card-visual";

export function WalletCardForm() {
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [focusField, setFocusField] = useState<WalletCardField>(null);
  const [saved, setSaved] = useState(false);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(currentYear + i));
  }, []);

  const validity = useMemo(() => {
    const validNumber = number.length >= 13;
    const validHolder = holder.trim().length >= 2;
    const validMonth = !!month && +month >= 1 && +month <= 12;
    const validYear = !!year && +year >= new Date().getFullYear();
    const validCvv = /^\d{3,4}$/.test(cvv);
    return {
      number: validNumber,
      holder: validHolder,
      month: validMonth,
      year: validYear,
      cvv: validCvv,
      allValid:
        validNumber && validHolder && validMonth && validYear && validCvv,
    };
  }, [number, holder, month, year, cvv]);

  useEffect(() => {
    if (saved && !validity.allValid) setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = { number, holder, month, year, cvv };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validity.allValid) setSaved(true);
  }

  if (saved) {
    return (
      <div
        className="flex items-center gap-4 rounded-3xl p-4 shadow-lg"
        style={{ backgroundColor: "var(--app-main-flat)" }}
      >
        <div className="wc-scale-down">
          <WalletCardVisual state={state} focusField={null} />
        </div>
        <button
          type="button"
          title="Edit card details"
          onClick={() => setSaved(false)}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-accent transition-colors hover:bg-accent/70"
        >
          <Pencil className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6 rounded-3xl p-5 shadow-lg sm:p-7 lg:flex-row lg:items-start"
      style={{ backgroundColor: "var(--app-main-flat)" }}
    >
      <div className="mx-auto w-full max-w-[420px] shrink-0 lg:mx-0">
        <WalletCardVisual state={state} focusField={focusField} />
      </div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full flex-col gap-3"
      >
        <div>
          <label
            htmlFor="wc-number"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Card number
          </label>
          <input
            id="wc-number"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={formatCardNumber(number)}
            onChange={(e) => setNumber(digitsOnly(e.target.value, 19))}
            onFocus={() => setFocusField("number")}
            onBlur={() => setFocusField(null)}
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="wc-holder"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Card holder
          </label>
          <input
            id="wc-holder"
            type="text"
            autoComplete="cc-name"
            placeholder="JANE DOE"
            value={holder}
            onChange={(e) => setHolder(e.target.value.toUpperCase())}
            onFocus={() => setFocusField("holder")}
            onBlur={() => setFocusField(null)}
            className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Expiration date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                onFocus={() => setFocusField("expire")}
                onBlur={() => setFocusField(null)}
                className="w-full rounded-lg bg-accent px-2 py-2.5 text-sm outline-none"
              >
                <option value="" disabled>
                  MM
                </option>
                {Array.from({ length: 12 }, (_, i) =>
                  String(i + 1).padStart(2, "0"),
                ).map((m) => (
                  <option value={m} key={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onFocus={() => setFocusField("expire")}
                onBlur={() => setFocusField(null)}
                className="w-full rounded-lg bg-accent px-2 py-2.5 text-sm outline-none"
              >
                <option value="" disabled>
                  YYYY
                </option>
                {years.map((y) => (
                  <option value={y} key={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="wc-cvv"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              CVV
            </label>
            <input
              id="wc-cvv"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="***"
              value={cvv}
              onChange={(e) => setCvv(digitsOnly(e.target.value, 4))}
              onFocus={() => setFocusField("cvv")}
              onBlur={() => setFocusField(null)}
              className="w-full rounded-lg bg-accent px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!validity.allValid}
          className="mt-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--cherry-pink) 0%, #2f6bff 100%)",
          }}
        >
          {validity.allValid ? "Save card" : "Complete all fields"}
        </button>
      </form>
    </div>
  );
}
