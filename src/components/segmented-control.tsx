import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme-provider";

type IndicatorRect = { left: number; width: number };

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { dark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);

  useEffect(() => {
    const update = () => {
      const button = buttonRefs.current[value];
      const container = containerRef.current;
      if (!button || !container) return;
      const buttonRect = button.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar relative inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1 backdrop-blur"
      style={{
        border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
        backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      }}
    >
      {indicator && (
        <div
          className="absolute bottom-1 top-1 rounded-full transition-all duration-300 ease-out"
          style={
            dark
              ? {
                  left: indicator.left,
                  width: indicator.width,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.14))",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.5)",
                  backdropFilter: "blur(6px)",
                }
              : {
                  left: indicator.left,
                  width: indicator.width,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.65))",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.9)",
                  backdropFilter: "blur(6px)",
                }
          }
        />
      )}
      {options.map((option) => (
        <button
          key={option}
          ref={(el) => {
            buttonRefs.current[option] = el;
          }}
          type="button"
          onClick={() => onChange(option)}
          className={`relative z-10 shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            value === option
              ? "text-cherry-deep"
              : "text-foreground/80 hover:text-foreground"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
