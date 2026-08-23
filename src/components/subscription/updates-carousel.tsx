import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

const AUTOPLAY_MS = 3000;

export function UpdatesCarousel({ items }: { items: { id: string; title: string; src: string }[] }) {
  const { dark } = useTheme();
  const [index, setIndex] = useState(0);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + items.length) % items.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  const navButtonStyle = {
    border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}`,
    backgroundColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
  };

  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden sm:h-80 md:h-96">
      {items.map((item, i) => {
        let offset = i - index;
        if (offset > items.length / 2) offset -= items.length;
        if (offset < -items.length / 2) offset += items.length;
        if (Math.abs(offset) > 1) return null;
        const isActive = offset === 0;
        const translate = offset * 62;
        const scale = isActive ? 1 : 0.78;
        const opacity = isActive ? 1 : 0.45;
        const zIndex = isActive ? 20 : 10;
        return (
          <article
            key={item.id}
            className="absolute h-56 w-[220px] shrink-0 overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 ease-out sm:h-72 sm:w-[300px] md:h-80 md:w-[380px]"
            style={{
              transform: `translateX(${translate}%) scale(${scale})`,
              opacity,
              zIndex,
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <img src={item.src} alt={item.title} loading="lazy" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="text-xl font-extrabold text-white sm:text-2xl">{item.title}</h3>
            </div>
          </article>
        );
      })}
      <button
        type="button"
        title="Previous"
        onClick={() => go(-1)}
        className="absolute left-1 z-30 grid size-11 shrink-0 place-items-center rounded-full shadow-lg backdrop-blur-xl transition-transform hover:scale-105 sm:left-4"
        style={navButtonStyle}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        title="Next"
        onClick={() => go(1)}
        className="absolute right-1 z-30 grid size-11 shrink-0 place-items-center rounded-full shadow-lg backdrop-blur-xl transition-transform hover:scale-105 sm:right-4"
        style={navButtonStyle}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
