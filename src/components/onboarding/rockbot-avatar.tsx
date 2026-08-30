import React, { useState, useEffect, useMemo } from "react";

export type AvatarExpressionName =
  | "neutral"
  | "upward-side-glance"
  | "downward-gaze"
  | "skeptical-right"
  | "small-attentive"
  | "wide-downward-gaze"
  | "surprised-left"
  | "sleepy-squint"
  | "angry-right"
  | "curious-left"
  | "asymmetric-down-right"
  | "attentive-left"
  | "joyful-wide"
  | "eyes-closed"
  | "joyful-down-right"
  | "skeptical-left"
  | "far-right-glance"
  | "angry-left"
  | "playful-right"
  | "asymmetric-up-left"
  | "gentle-downward-gaze"
  | "wide-down-left"
  | "surprised-wide-left"
  | "drowsy-closed"
  | "suspicious-right"
  | "shy-downward"
  | "angry-brows"
  | "uneasy-left";

interface EyeConfig {
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
}

interface ExpressionData {
  head: { x: number; y: number; z: number };
  eyes: {
    left: EyeConfig;
    right: EyeConfig;
    spacing: number;
  };
  perspective?: number;
  motion?: { eyes?: string; body?: string };
  colors?: { body?: string; eyes?: string };
}

const EXPRESSIONS: Record<AvatarExpressionName, ExpressionData> = {
  neutral: {
    head: { x: 0, y: 0, z: 0 },
    eyes: {
      left: { width: 20, height: 50, x: 0, y: -7, angle: 0 },
      right: { width: 20, height: 50, x: 0, y: -7, angle: 0 },
      spacing: 35,
    },
  },
  "upward-side-glance": {
    head: { x: 7.3, y: 27.8, z: -16.1 },
    eyes: {
      left: { width: 22.5, height: 42.4, x: 0, y: -20.5, angle: 0 },
      right: { width: 22.5, height: 42.4, x: 0, y: -20.5, angle: 0 },
      spacing: 54.3,
    },
  },
  "downward-gaze": {
    head: { x: -15.1, y: 0.1, z: -14.5 },
    eyes: {
      left: { width: 22.4, height: 54.6, x: 0, y: 0, angle: 0 },
      right: { width: 22.4, height: 54.6, x: 0, y: 0, angle: 0 },
      spacing: 57.7,
    },
  },
  "skeptical-right": {
    head: { x: -16.5, y: -3.8, z: -13.7 },
    eyes: {
      left: { width: 23.1, height: 57.7, x: 0, y: 0, angle: 0 },
      right: { width: 49.9, height: 12.4, x: 0, y: 0, angle: 0 },
      spacing: 56.3,
    },
  },
  "small-attentive": {
    head: { x: -4.2, y: 14.4, z: 11.2 },
    eyes: {
      left: { width: 22.1, height: 39.6, x: 0, y: 0, angle: 0 },
      right: { width: 22.1, height: 39.6, x: 0, y: 0, angle: 0 },
      spacing: 50.9,
    },
  },
  "wide-downward-gaze": {
    head: { x: -19.2, y: 15.2, z: 11.8 },
    eyes: {
      left: { width: 52.1, height: 51.5, x: 0, y: 0, angle: 0 },
      right: { width: 53.1, height: 52.2, x: 0, y: 0, angle: 0 },
      spacing: 69.5,
    },
  },
  "surprised-left": {
    head: { x: 2.9, y: -16.1, z: -20.9 },
    eyes: {
      left: { width: 51.7, height: 51.7, x: 0, y: 0, angle: 0 },
      right: { width: 51.7, height: 51.7, x: 0, y: 0, angle: 0 },
      spacing: 70.9,
    },
  },
  "sleepy-squint": {
    head: { x: 3.4, y: 13.2, z: 9.0 },
    eyes: {
      left: { width: 51.8, height: 13.0, x: 0, y: 0, angle: 0 },
      right: { width: 51.8, height: 13.0, x: 0, y: 0, angle: 0 },
      spacing: 63.9,
    },
  },
  "angry-right": {
    head: { x: 8.1, y: 17.6, z: -11.1 },
    eyes: {
      left: { width: 20.9, height: 40.4, x: 0, y: 0, angle: -30.9 },
      right: { width: 20.9, height: 40.4, x: 0, y: 0, angle: 28.8 },
      spacing: 52.1,
    },
  },
  "curious-left": {
    head: { x: -12.3, y: -17.6, z: 5.9 },
    eyes: {
      left: { width: 20.6, height: 47.8, x: 0, y: 0, angle: 23.5 },
      right: { width: 20.6, height: 47.8, x: 0, y: 0, angle: -24.0 },
      spacing: 54.9,
    },
  },
  "asymmetric-down-right": {
    head: { x: -20.1, y: 12.6, z: -12.7 },
    eyes: {
      left: { width: 42.5, height: 41.8, x: 0, y: 0, angle: 0 },
      right: { width: 22.1, height: 22.2, x: 0, y: 0, angle: 0 },
      spacing: 61.7,
    },
  },
  "attentive-left": {
    head: { x: 1.4, y: 6.2, z: 10.6 },
    eyes: {
      left: { width: 23.8, height: 58.1, x: 0, y: 0, angle: 0 },
      right: { width: 23.8, height: 58.1, x: 0, y: 0, angle: 0 },
      spacing: 56.8,
    },
  },
  "joyful-wide": {
    head: { x: -2.1, y: -15.9, z: -14.5 },
    eyes: {
      left: { width: 34.2, height: 85.3, x: 0, y: 0, angle: 0 },
      right: { width: 34.2, height: 83.2, x: 0, y: 0, angle: 0 },
      spacing: 59.4,
    },
  },
  "eyes-closed": {
    head: { x: -8.8, y: -8.7, z: -10.8 },
    eyes: {
      left: { width: 56.1, height: 12.0, x: 0, y: 0, angle: 0 },
      right: { width: 56.1, height: 12.0, x: 0, y: 0, angle: 0 },
      spacing: 69.3,
    },
  },
  "joyful-down-right": {
    head: { x: -15.3, y: 15.0, z: 12.8 },
    eyes: {
      left: { width: 31.3, height: 76.7, x: 0, y: 0, angle: 0 },
      right: { width: 31.3, height: 76.7, x: 0, y: 0, angle: 0 },
      spacing: 68.7,
    },
  },
  "skeptical-left": {
    head: { x: 3.5, y: -7.1, z: 9.8 },
    eyes: {
      left: { width: 24.3, height: 59.3, x: 0, y: 0, angle: 0 },
      right: { width: 48.9, height: 13.4, x: 0, y: 0, angle: 0 },
      spacing: 62.2,
    },
  },
  "far-right-glance": {
    head: { x: 0.3, y: 35.3, z: -10.9 },
    eyes: {
      left: { width: 22.5, height: 39.8, x: 0, y: 0, angle: 0 },
      right: { width: 22.5, height: 39.8, x: 0, y: 0, angle: 0 },
      spacing: 53.9,
    },
  },
  "angry-left": {
    head: { x: -14.8, y: -19.4, z: 5.6 },
    eyes: {
      left: { width: 19.6, height: 48.6, x: 0, y: 0, angle: -27.6 },
      right: { width: 19.6, height: 48.6, x: 0, y: 0, angle: 26.1 },
      spacing: 55.1,
    },
  },
  "playful-right": {
    head: { x: -4.4, y: 14.1, z: -16.1 },
    eyes: {
      left: { width: 19.0, height: 43.4, x: 0, y: 0, angle: 26.3 },
      right: { width: 19.0, height: 43.4, x: 0, y: 0, angle: -20.2 },
      spacing: 51.7,
    },
  },
  "asymmetric-up-left": {
    head: { x: 6.6, y: 4.7, z: 12.8 },
    eyes: {
      left: { width: 42.1, height: 41.7, x: 0, y: 0, angle: 0 },
      right: { width: 22.2, height: 22.1, x: 0, y: 0, angle: 0 },
      spacing: 60.4,
    },
  },
  "gentle-downward-gaze": {
    head: { x: -6.1, y: -11.0, z: -14.0 },
    eyes: {
      left: { width: 23.0, height: 58.7, x: 0, y: 0, angle: 0 },
      right: { width: 23.0, height: 58.7, x: 0, y: 0, angle: 0 },
      spacing: 56.2,
    },
  },
  "wide-down-left": {
    head: { x: -17.1, y: 18.1, z: 13.9 },
    eyes: {
      left: { width: 35.5, height: 79.1, x: 0, y: 0, angle: 0 },
      right: { width: 35.5, height: 79.1, x: 0, y: 0, angle: 0 },
      spacing: 70.8,
    },
  },
  "surprised-wide-left": {
    head: { x: -5.4, y: -11.7, z: -13.5 },
    eyes: {
      left: { width: 51.4, height: 50.1, x: 0, y: 0, angle: 0 },
      right: { width: 50.5, height: 49.4, x: 0, y: 0, angle: 0 },
      spacing: 69.0,
    },
  },
  "drowsy-closed": {
    head: { x: 10.3, y: 3.4, z: 7.6 },
    eyes: {
      left: { width: 55.7, height: 14.6, x: 0, y: 0, angle: 0 },
      right: { width: 55.7, height: 14.6, x: 0, y: 0, angle: 0 },
      spacing: 68.4,
    },
  },
  "suspicious-right": {
    head: { x: -17.8, y: 10.0, z: -10.9 },
    eyes: {
      left: { width: 24.0, height: 55.9, x: 0, y: -9.8, angle: 0 },
      right: { width: 53.6, height: 13.3, x: 0, y: -9.8, angle: 0 },
      spacing: 59.9,
    },
  },
  "shy-downward": {
    head: { x: 7.1, y: 7.8, z: 3.9 },
    eyes: {
      left: { width: 21.5, height: 32.0, x: 0, y: 40, angle: 0 },
      right: { width: 23.2, height: 33.5, x: 0, y: 40, angle: 0 },
      spacing: 51.2,
    },
  },
  "angry-brows": {
    head: { x: 10.5, y: 5.1, z: 4.7 },
    eyes: {
      left: { width: 27.1, height: 63.0, x: 0, y: 0, angle: -36.2 },
      right: { width: 27.1, height: 63.0, x: 0, y: 0, angle: 27.7 },
      spacing: 68.7,
    },
    colors: { body: "#ba3636", eyes: "#610000" },
  },
  "uneasy-left": {
    head: { x: -12.3, y: -17.6, z: 5.9 },
    eyes: {
      left: { width: 20.6, height: 47.8, x: 0, y: 0, angle: 23.5 },
      right: { width: 20.6, height: 47.8, x: 0, y: 0, angle: -24.0 },
      spacing: 54.9,
    },
    colors: { body: "#adc3ff" },
  },
};

interface RockbotAvatarProps {
  expression?: AvatarExpressionName;
  size?: number;
  className?: string;
  isBlinking?: boolean;
}

export function RockbotAvatar({
  expression = "neutral",
  size = 110,
  className = "",
  isBlinking = false,
}: RockbotAvatarProps) {
  const [blink, setBlink] = useState(false);

  // Natural spontaneous blinking loop
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => {
        setBlink(false);
      }, 160);

      const nextInterval = 2800 + Math.random() * 3400;
      blinkTimeout = setTimeout(triggerBlink, nextInterval);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  const currentExpr = EXPRESSIONS[expression] || EXPRESSIONS.neutral;
  const isEyeClosed = blink || isBlinking;

  // Scale relative to reference body size 240px
  const scale = size / 240;

  // 3D rotation values
  const rotX = currentExpr.head.x;
  const rotY = currentExpr.head.y;
  const rotZ = currentExpr.head.z;

  const bodyColor = currentExpr.colors?.body || "#000000";
  const eyesColor = currentExpr.colors?.eyes || "#ffffff";

  const leftEye = currentExpr.eyes.left;
  const rightEye = currentExpr.eyes.right;
  const spacing = currentExpr.eyes.spacing;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "600px",
      }}
    >
      {/* Spherical Head with 3D Lighting & Shadows */}
      <div
        className="relative rounded-full transition-transform duration-500 ease-out shadow-2xl flex items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: size,
          backgroundColor: bodyColor,
          transform: `rotateX(${-rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
          transformStyle: "preserve-3d",
          boxShadow:
            bodyColor === "#000000"
              ? "0 18px 38px -10px rgba(0, 0, 0, 0.45), inset 0 -8px 16px rgba(255, 255, 255, 0.08), inset 0 8px 18px rgba(255, 255, 255, 0.15)"
              : "0 18px 38px -10px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Subtle Specular Highlight on Sphere */}
        <div
          className="absolute top-2 left-4 w-1/3 h-1/4 rounded-full pointer-events-none opacity-20 bg-gradient-to-br from-white via-white/50 to-transparent blur-[2px]"
          style={{ transform: "rotate(-25deg)" }}
        />

        {/* Eyes Face Container */}
        <div
          className="relative flex items-center justify-center transition-all duration-500 ease-out pointer-events-none"
          style={{
            gap: `${spacing * scale * 0.7}px`,
            transform: `translate3d(${rotY * 0.4 * scale}px, ${-rotX * 0.4 * scale}px, 20px)`,
          }}
        >
          {/* Left Eye */}
          <div
            className="transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${Math.max(4, leftEye.width * scale)}px`,
              height: isEyeClosed
                ? `${4 * scale}px`
                : `${Math.max(4, leftEye.height * scale)}px`,
              backgroundColor: eyesColor,
              transform: `translate(${leftEye.x * scale}px, ${leftEye.y * scale}px) rotate(${leftEye.angle}deg)`,
              boxShadow: `0 0 ${8 * scale}px ${eyesColor}80`,
            }}
          />

          {/* Right Eye */}
          <div
            className="transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${Math.max(4, rightEye.width * scale)}px`,
              height: isEyeClosed
                ? `${4 * scale}px`
                : `${Math.max(4, rightEye.height * scale)}px`,
              backgroundColor: eyesColor,
              transform: `translate(${rightEye.x * scale}px, ${rightEye.y * scale}px) rotate(${rightEye.angle}deg)`,
              boxShadow: `0 0 ${8 * scale}px ${eyesColor}80`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
