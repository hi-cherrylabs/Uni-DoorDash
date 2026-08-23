import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ThemeContextValue = {
  dark: boolean;
  toggle: (event?: { clientX: number; clientY: number }) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("udd-theme");
      if (stored === "light") setDark(false);
      else if (stored === "dark") setDark(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
    try {
      localStorage.setItem("udd-theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  const toggle = useCallback((event?: { clientX: number; clientY: number }) => {
    const flip = () => setDark((value) => !value);
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition || !event) {
      flip();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    doc.startViewTransition(() => flip()).ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 900,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a ThemeProvider");
  return context;
}
