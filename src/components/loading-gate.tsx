import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useAuth } from "@/components/auth-provider";

/**
 * Ports the draw/undo/redraw Web Animations API sequence from the provided
 * loader-small.html verbatim (same timeline math, same easing, same
 * durations) — just swapping getElementById for refs since this now lives
 * inside React instead of a standalone page.
 */
function CherryLoader() {
  const strokeRef = useRef<SVGPathElement>(null);
  const brightRef = useRef<SVGPathElement>(null);
  const blackRef = useRef<SVGPathElement>(null);
  const coloredRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const stroke = strokeRef.current;
    const fillBright = brightRef.current;
    const fillBlack = blackRef.current;
    const fillColored = coloredRef.current;
    if (!stroke || !fillBright || !fillBlack || !fillColored) return;

    const len = stroke.getTotalLength();
    stroke.style.strokeDasharray = String(len);
    stroke.style.strokeDashoffset = String(len);

    const DRAW = 2600;
    const FTR = 450;
    const HOLD = 900;
    const UNDO = 2600;

    let t = 0;
    const draw1End = t + DRAW;
    t = draw1End;
    const brightInEnd = t + FTR;
    t += FTR;
    const holdBrightEnd = t + HOLD;
    t += HOLD;
    const brightOutEnd = t + FTR;
    const undo1End = draw1End + FTR + HOLD + UNDO;
    t = undo1End;

    const draw2End = t + DRAW;
    t = draw2End;
    const blackInEnd = t + FTR;
    t += FTR;
    const holdBlackEnd = t + HOLD;
    t += HOLD;
    const blackOutEnd = t + FTR;
    const undo2End = draw2End + FTR + HOLD + UNDO;
    t = undo2End;

    const draw3End = t + DRAW;
    t = draw3End;
    const coloredInEnd = t + FTR;
    t += FTR;
    const holdColoredEnd = t + HOLD;
    t += HOLD;
    const coloredOutEnd = t + FTR;
    const undo3End = draw3End + FTR + HOLD + UNDO;

    const CYCLE = undo3End;
    const f = (ms: number) => ms / CYCLE;

    const animations = [
      stroke.animate(
        [
          { strokeDashoffset: len, offset: f(0) },
          { strokeDashoffset: 0, offset: f(draw1End) },
          { strokeDashoffset: 0, offset: f(holdBrightEnd) },
          { strokeDashoffset: len, offset: f(undo1End) },
          { strokeDashoffset: len, offset: f(undo1End) },
          { strokeDashoffset: 0, offset: f(draw2End) },
          { strokeDashoffset: 0, offset: f(holdBlackEnd) },
          { strokeDashoffset: len, offset: f(undo2End) },
          { strokeDashoffset: len, offset: f(undo2End) },
          { strokeDashoffset: 0, offset: f(draw3End) },
          { strokeDashoffset: 0, offset: f(holdColoredEnd) },
          { strokeDashoffset: len, offset: f(undo3End) },
        ],
        { duration: CYCLE, iterations: Infinity, easing: "linear" },
      ),
      fillBright.animate(
        [
          { opacity: 0, offset: f(0) },
          { opacity: 0, offset: f(draw1End) },
          { opacity: 1, offset: f(brightInEnd) },
          { opacity: 1, offset: f(holdBrightEnd) },
          { opacity: 0, offset: f(brightOutEnd) },
          { opacity: 0, offset: f(CYCLE) },
        ],
        { duration: CYCLE, iterations: Infinity, easing: "linear" },
      ),
      fillBlack.animate(
        [
          { opacity: 0, offset: f(0) },
          { opacity: 0, offset: f(draw2End) },
          { opacity: 1, offset: f(blackInEnd) },
          { opacity: 1, offset: f(holdBlackEnd) },
          { opacity: 0, offset: f(blackOutEnd) },
          { opacity: 0, offset: f(CYCLE) },
        ],
        { duration: CYCLE, iterations: Infinity, easing: "linear" },
      ),
      fillColored.animate(
        [
          { opacity: 0, offset: f(0) },
          { opacity: 0, offset: f(draw3End) },
          { opacity: 1, offset: f(coloredInEnd) },
          { opacity: 1, offset: f(holdColoredEnd) },
          { opacity: 0, offset: f(coloredOutEnd) },
          { opacity: 0, offset: f(CYCLE) },
        ],
        { duration: CYCLE, iterations: Infinity, easing: "linear" },
      ),
    ];

    return () => animations.forEach((a) => a.cancel());
  }, []);

  return (
    <div style={{ width: 88, height: 62 }}>
      <svg viewBox="0 0 221.8 157.7" style={{ width: "100%", height: "100%", overflow: "visible" }}>
        <defs>
          <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e85c8a" />
            <stop offset="55%" stopColor="#c23a6b" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
          <linearGradient id="brightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffb3d1" />
            <stop offset="50%" stopColor="#ff6fa0" />
            <stop offset="100%" stopColor="#3f5c94" />
          </linearGradient>
          <linearGradient id="fillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e85c8a" />
            <stop offset="55%" stopColor="#c23a6b" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
        </defs>
        <path
          ref={brightRef}
          fill="url(#brightGrad)"
          style={{ opacity: 0 }}
          d="M 103.8,0.6 C 71.9,6.5 42.2,29.7 17.6,67.7 C 9.3,80.5 4.8,88.3 4.8,89.9 C 4.8,90.6 9.7,93.9 15.5,97.3 L 26.3,103.4 L 30.6,95.8 C 33,91.6 35.9,86.6 37,84.7 C 41.3,77.2 55.9,58.9 62.9,52.1 C 84.2,31.7 107.3,23 126.3,28.1 C 147.3,33.7 159.7,49.1 161.4,71.4 C 163,94.3 155,113 139.7,122 C 131.3,126.9 125.3,128.6 114.1,129.4 L 104.8,130 L 104.6,98.1 L 104.3,66.2 L 100.8,66.5 C 98.9,66.6 94.2,68.2 90.5,69.9 C 77.5,75.9 66.2,91.9 61.2,111.5 C 59.8,116.8 58.4,124.3 58,128.2 L 57.3,135.2 L 50.1,136.8 C 38.3,139.6 20.9,145.7 11.3,150.4 C 1.7,155.2 -1.9,157.7 1,157.7 C 1.8,157.7 7.7,156.8 13.9,155.8 C 23.7,154.1 31.8,153.1 56.8,150.2 C 70.4,148.6 114,147.8 137,148.7 C 160.2,149.6 197.3,153.3 206.8,155.7 C 213.5,157.4 221.8,158 221.8,156.8 C 221.8,155.1 205.3,147.3 192.3,142.9 C 181.2,139.2 177,138 169.4,136.2 L 166.5,135.6 L 170,131.9 C 174.7,126.8 178.1,122.1 181,116.2 C 186.9,104.6 190.5,85.7 189.3,72.2 C 188.4,62 184.8,47.5 181.3,40.6 C 172.5,23.1 155,8.3 136.4,2.5 C 129.5,0.4 111,-0.7 103.8,0.6 Z"
        />
        <path
          ref={blackRef}
          fill="#0a0a0a"
          style={{ opacity: 0 }}
          d="M 103.8,0.6 C 71.9,6.5 42.2,29.7 17.6,67.7 C 9.3,80.5 4.8,88.3 4.8,89.9 C 4.8,90.6 9.7,93.9 15.5,97.3 L 26.3,103.4 L 30.6,95.8 C 33,91.6 35.9,86.6 37,84.7 C 41.3,77.2 55.9,58.9 62.9,52.1 C 84.2,31.7 107.3,23 126.3,28.1 C 147.3,33.7 159.7,49.1 161.4,71.4 C 163,94.3 155,113 139.7,122 C 131.3,126.9 125.3,128.6 114.1,129.4 L 104.8,130 L 104.6,98.1 L 104.3,66.2 L 100.8,66.5 C 98.9,66.6 94.2,68.2 90.5,69.9 C 77.5,75.9 66.2,91.9 61.2,111.5 C 59.8,116.8 58.4,124.3 58,128.2 L 57.3,135.2 L 50.1,136.8 C 38.3,139.6 20.9,145.7 11.3,150.4 C 1.7,155.2 -1.9,157.7 1,157.7 C 1.8,157.7 7.7,156.8 13.9,155.8 C 23.7,154.1 31.8,153.1 56.8,150.2 C 70.4,148.6 114,147.8 137,148.7 C 160.2,149.6 197.3,153.3 206.8,155.7 C 213.5,157.4 221.8,158 221.8,156.8 C 221.8,155.1 205.3,147.3 192.3,142.9 C 181.2,139.2 177,138 169.4,136.2 L 166.5,135.6 L 170,131.9 C 174.7,126.8 178.1,122.1 181,116.2 C 186.9,104.6 190.5,85.7 189.3,72.2 C 188.4,62 184.8,47.5 181.3,40.6 C 172.5,23.1 155,8.3 136.4,2.5 C 129.5,0.4 111,-0.7 103.8,0.6 Z"
        />
        <path
          ref={coloredRef}
          fill="url(#fillGrad)"
          style={{ opacity: 0 }}
          d="M 103.8,0.6 C 71.9,6.5 42.2,29.7 17.6,67.7 C 9.3,80.5 4.8,88.3 4.8,89.9 C 4.8,90.6 9.7,93.9 15.5,97.3 L 26.3,103.4 L 30.6,95.8 C 33,91.6 35.9,86.6 37,84.7 C 41.3,77.2 55.9,58.9 62.9,52.1 C 84.2,31.7 107.3,23 126.3,28.1 C 147.3,33.7 159.7,49.1 161.4,71.4 C 163,94.3 155,113 139.7,122 C 131.3,126.9 125.3,128.6 114.1,129.4 L 104.8,130 L 104.6,98.1 L 104.3,66.2 L 100.8,66.5 C 98.9,66.6 94.2,68.2 90.5,69.9 C 77.5,75.9 66.2,91.9 61.2,111.5 C 59.8,116.8 58.4,124.3 58,128.2 L 57.3,135.2 L 50.1,136.8 C 38.3,139.6 20.9,145.7 11.3,150.4 C 1.7,155.2 -1.9,157.7 1,157.7 C 1.8,157.7 7.7,156.8 13.9,155.8 C 23.7,154.1 31.8,153.1 56.8,150.2 C 70.4,148.6 114,147.8 137,148.7 C 160.2,149.6 197.3,153.3 206.8,155.7 C 213.5,157.4 221.8,158 221.8,156.8 C 221.8,155.1 205.3,147.3 192.3,142.9 C 181.2,139.2 177,138 169.4,136.2 L 166.5,135.6 L 170,131.9 C 174.7,126.8 178.1,122.1 181,116.2 C 186.9,104.6 190.5,85.7 189.3,72.2 C 188.4,62 184.8,47.5 181.3,40.6 C 172.5,23.1 155,8.3 136.4,2.5 C 129.5,0.4 111,-0.7 103.8,0.6 Z"
        />
        <path
          ref={strokeRef}
          fill="transparent"
          stroke="url(#strokeGrad)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          d="M 103.8,0.6 C 71.9,6.5 42.2,29.7 17.6,67.7 C 9.3,80.5 4.8,88.3 4.8,89.9 C 4.8,90.6 9.7,93.9 15.5,97.3 L 26.3,103.4 L 30.6,95.8 C 33,91.6 35.9,86.6 37,84.7 C 41.3,77.2 55.9,58.9 62.9,52.1 C 84.2,31.7 107.3,23 126.3,28.1 C 147.3,33.7 159.7,49.1 161.4,71.4 C 163,94.3 155,113 139.7,122 C 131.3,126.9 125.3,128.6 114.1,129.4 L 104.8,130 L 104.6,98.1 L 104.3,66.2 L 100.8,66.5 C 98.9,66.6 94.2,68.2 90.5,69.9 C 77.5,75.9 66.2,91.9 61.2,111.5 C 59.8,116.8 58.4,124.3 58,128.2 L 57.3,135.2 L 50.1,136.8 C 38.3,139.6 20.9,145.7 11.3,150.4 C 1.7,155.2 -1.9,157.7 1,157.7 C 1.8,157.7 7.7,156.8 13.9,155.8 C 23.7,154.1 31.8,153.1 56.8,150.2 C 70.4,148.6 114,147.8 137,148.7 C 160.2,149.6 197.3,153.3 206.8,155.7 C 213.5,157.4 221.8,158 221.8,156.8 C 221.8,155.1 205.3,147.3 192.3,142.9 C 181.2,139.2 177,138 169.4,136.2 L 166.5,135.6 L 170,131.9 C 174.7,126.8 178.1,122.1 181,116.2 C 186.9,104.6 190.5,85.7 189.3,72.2 C 188.4,62 184.8,47.5 181.3,40.6 C 172.5,23.1 155,8.3 136.4,2.5 C 129.5,0.4 111,-0.7 103.8,0.6 Z"
        />
      </svg>
    </div>
  );
}

/**
 * Blocks the rest of the app from rendering at all until Firebase Auth's
 * initial check resolves (`ready`). This is deliberately stronger than just
 * covering the screen with an overlay — nothing underneath mounts, so
 * there's no flash of an unauthenticated/incomplete page before the
 * sign-in card (for new visitors) or real content (for returning ones) is
 * ready to show. Always a fixed deep-charcoal background regardless of
 * light/dark theme — this is a brief, theme-independent transition state,
 * not a themed page.
 */
export function LoadingGate({ children }: { children: ReactNode }) {
  const { ready } = useAuth();
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (!ready) return;
    // Small delay so the fade-out is a deliberate transition rather than an
    // abrupt cut, and so the first-visit sign-in card (which opens on this
    // same `ready` transition) has a tick to be in place before the
    // overlay clears.
    const timer = setTimeout(() => setOverlayVisible(false), 220);
    return () => clearTimeout(timer);
  }, [ready]);

  return (
    <>
      {ready ? children : null}
      {overlayVisible && (
        <div
          aria-hidden={ready}
          className="fixed inset-0 z-[300] grid place-items-center transition-opacity duration-500"
          style={{ backgroundColor: "#121212", opacity: ready ? 0 : 1 }}
        >
          <CherryLoader />
        </div>
      )}
    </>
  );
}
