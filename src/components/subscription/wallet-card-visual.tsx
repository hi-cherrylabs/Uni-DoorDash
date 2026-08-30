import { useMemo } from "react";

export type WalletCardState = {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
};

export type WalletCardField = "number" | "holder" | "expire" | "cvv" | null;

export function formatCardNumber(value: string) {
  return value.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function WalletCardVisual({
  state,
  focusField,
}: {
  state: WalletCardState;
  focusField: WalletCardField;
}) {
  const { number, holder, month, year, cvv } = state;
  const isFlipped = focusField === "cvv";

  const digitChars = useMemo(() => number.slice(0, 16).split(""), [number]);
  const slots = useMemo(() => {
    const result: { textTop: string; filled: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      let textTop = "#";
      if (i < digitChars.length) {
        const char = digitChars[i] ?? "#";
        textTop = i >= 4 && i <= 11 ? "*" : char;
      }
      result.push({ textTop, filled: i < digitChars.length });
    }
    return result;
  }, [digitChars]);

  const highlightClass = (() => {
    switch (focusField) {
      case "number":
        return "wc-highlight--number";
      case "holder":
        return "wc-highlight--holder";
      case "expire":
        return "wc-highlight--expire";
      case "cvv":
        return "wc-highlight--cvv";
      default:
        return "wc-highlight--hidden";
    }
  })();

  return (
    <div className={`wc-card ${isFlipped ? "wc-card--flip" : ""}`}>
      <div className={`wc-highlight ${highlightClass}`} />
      <section className="wc-face wc-face--front">
        <div className="wc-header">
          <span>Uni Door Dash</span>
          <span className="wc-mark">
            <span className="wc-mark__circle wc-mark__circle--a" />
            <span className="wc-mark__circle wc-mark__circle--b" />
          </span>
        </div>
        <div className="wc-number" aria-label="Card number">
          {slots.map((slot, i) => (
            <span className="wc-slot" key={i}>
              <span
                className={`wc-digit ${slot.filled ? "wc-digit--filled" : ""}`}
              >
                <span className="wc-row">#</span>
                <span className="wc-row">{slot.textTop}</span>
              </span>
            </span>
          ))}
        </div>
        <div className="wc-footer">
          <div>
            <div className="wc-label">Card holder</div>
            <div className="wc-value">{holder || "NAME ON CARD"}</div>
          </div>
          <div className="wc-expires">
            <div className="wc-label">Expires</div>
            <span>
              {month || "MM"}/{year ? year.slice(-2) : "YY"}
            </span>
          </div>
        </div>
      </section>
      <section className="wc-face wc-face--back">
        <div className="wc-hide-line" />
        <div className="wc-cvv">
          <span>CVV</span>
          <div className="wc-cvv-field">{"*".repeat(cvv.length)}</div>
        </div>
      </section>
    </div>
  );
}
