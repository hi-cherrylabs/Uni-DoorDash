import { motion } from "framer-motion";
import type React from "react";

import { cn } from "@/lib/utils";

const STAGGER = 0.035;

export const TextRoll: React.FC<{
  children: string;
  className?: string;
  center?: boolean;
}> = ({ children, className, center = false }) => {
  return (
    <motion.span
      className={cn("relative block overflow-hidden leading-[1.05]", className)}
      initial="initial"
      whileHover="hovered"
      whileTap="hovered"
      style={{ lineHeight: 1.05 }}
    >
      <span className="block">
        {children.split("").map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;
          return (
            <motion.span
              key={`a-${i}`}
              className="inline-block"
              variants={{ initial: { y: 0 }, hovered: { y: "-100%" } }}
              transition={{ ease: [0.22, 1, 0.36, 1], delay, duration: 0.4 }}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </span>
      <span className="absolute inset-0 block">
        {children.split("").map((l, i) => {
          const delay = center
            ? STAGGER * Math.abs(i - (children.length - 1) / 2)
            : STAGGER * i;
          return (
            <motion.span
              key={`b-${i}`}
              className="inline-block"
              variants={{ initial: { y: "100%" }, hovered: { y: 0 } }}
              transition={{ ease: [0.22, 1, 0.36, 1], delay, duration: 0.4 }}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          );
        })}
      </span>
    </motion.span>
  );
};
