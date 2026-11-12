"use client";

import { useState, useEffect, useRef, useId, type ReactNode } from "react";
import { motion, useAnimationFrame, useAnimate } from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";
import { ThinkingOrb } from "./thinking-orb";
import { ShimmerText } from "./shimmer-text";
import { SpaceshipLogoScene } from "./SpaceshipLogo/SpaceshipLogoScene";
import { SpaceshipMarkImage } from "./SpaceshipLogo/SpaceshipMark";

// ━━━ ThinkingDots — animated 3×3 gravity grid icon ━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Grid constants ───────────────────────────────────────────────────────────

const DOT_R_MIN = 1.6; // resting dot radius
const DOT_R_MAX = 1.9; // max dot radius at peak influence
const LINE_STROKE = 1.8; // thicker lines

// 3×3 grid: dots at positions 3, 10, 17 on both axes (15% inset, 7px pitch)
const DOTS = Array.from({ length: 9 }, (_, i) => ({
  row: Math.floor(i / 3),
  col: i % 3,
  cx: 3 + (i % 3) * 7,
  cy: 3 + Math.floor(i / 3) * 7,
}));

type GridLine = {
  x1: number;
  y1: number; // start (corner or edge dot)
  mx: number;
  my: number; // through-point (middle dot)
  x2: number;
  y2: number; // end (opposite corner or edge dot)
};

// 6 full-span lines: 3 horizontal + 3 vertical, each passing through all 3 grid points
const LINES: GridLine[] = [
  // Horizontal
  { x1: 3, y1: 3, mx: 10, my: 3, x2: 17, y2: 3 },
  { x1: 3, y1: 10, mx: 10, my: 10, x2: 17, y2: 10 },
  { x1: 3, y1: 17, mx: 10, my: 17, x2: 17, y2: 17 },
  // Vertical
  { x1: 3, y1: 3, mx: 3, my: 10, x2: 3, y2: 17 },
  { x1: 10, y1: 3, mx: 10, my: 10, x2: 10, y2: 17 },
  { x1: 17, y1: 3, mx: 17, my: 10, x2: 17, y2: 17 },
];

// Deterministic dot traversal order for the random pattern (stable SSR)
const RANDOM_ORDER = [4, 7, 1, 8, 2, 5, 0, 3, 6];

// ─── Physics constants ────────────────────────────────────────────────────────

const GRID_SHIFT_STRENGTH = 1.8; // dot & line-endpoint shift (cloth translation)
const CURVE_STRENGTH = 3.6; // line midpoint displacement (shift + curvature)
const FALLOFF_SIGMA = 12; // Gaussian spread — wider influence radius
const SOFT_RADIUS = 1; // smooths displacement through zero when gravity overlaps a grid point
const GRAD_HALF_SPAN = 30; // half the repeating gradient tile (60 units → ~12 units per color band)

// ─── Corner paths ─────────────────────────────────────────────────────────────

const CORNERS_RECT = [
  { x: 3, y: 3 }, // TL
  { x: 17, y: 3 }, // TR
  { x: 17, y: 17 }, // BR
  { x: 3, y: 17 }, // BL
];

const CORNERS_X = [
  { x: 3, y: 3 }, // TL
  { x: 17, y: 17 }, // BR
  { x: 17, y: 3 }, // TR
  { x: 3, y: 17 }, // BL
];

function cornerLap(corners: { x: number; y: number }[], t: number) {
  // Two laps per cycle (one push, one pull)
  const lapT = (t * 2) % 1;
  const segment = lapT * 4;
  const seg = Math.floor(segment) % 4;
  const frac = segment - Math.floor(segment);
  const ease = (1 - Math.cos(frac * Math.PI)) / 2;
  const from = corners[seg]!;
  const to = corners[(seg + 1) % 4]!;
  return {
    x: from.x + (to.x - from.x) * ease,
    y: from.y + (to.y - from.y) * ease,
  };
}

// ─── Physics helpers ──────────────────────────────────────────────────────────

/** Returns the (x, y) gravity attractor position for the given pattern and normalized time t ∈ [0, 1). */
function gravityPosition(
  pattern:
    | "diagonal"
    | "radial"
    | "radial-pull"
    | "horizontal"
    | "random"
    | "breathe"
    | "breathe-x",
  t: number,
): { x: number; y: number } {
  const θ = t * 2 * Math.PI;
  switch (pattern) {
    case "horizontal":
      return { x: 10 + 7 * Math.sin(θ), y: 10 };
    case "diagonal": {
      const phase = t * 8;
      const seg = Math.floor(phase) % 8;
      if (seg % 2 === 1) return { x: 10, y: 10 }; // odd = rest at center
      return CORNERS_X[seg / 2]!; // even = wave at corner
    }
    case "radial":
      return { x: 10 + 7 * Math.cos(θ), y: 10 + 7 * Math.sin(θ) };
    case "radial-pull": {
      const phase = t * 3;
      const seg = Math.floor(phase) % 3;
      if (seg === 1) return { x: 10, y: 10 }; // rest at center
      const frac = phase - Math.floor(phase);
      const angle = frac * 2 * Math.PI; // full circle per active segment
      return { x: 10 + 7 * Math.cos(angle), y: 10 + 7 * Math.sin(angle) };
    }
    case "breathe":
      return cornerLap(CORNERS_RECT, t);
    case "breathe-x":
      return cornerLap(CORNERS_X, t);
    case "random": {
      const n = RANDOM_ORDER.length;
      const step = Math.floor(t * n) % n;
      const alpha = (t * n) % 1;
      const smooth = (1 - Math.cos(alpha * Math.PI)) / 2;
      const d0 = DOTS[RANDOM_ORDER[step]!]!;
      const d1 = DOTS[RANDOM_ORDER[(step + 1) % n]!]!;
      return {
        x: d0.cx + (d1.cx - d0.cx) * smooth,
        y: d0.cy + (d1.cy - d0.cy) * smooth,
      };
    }
  }
}

/** Displaces grid point (px, py) toward gravity (gx, gy) with Gaussian falloff; returns dx/dy offsets and 0–1 influence. */
function displacePoint(
  px: number,
  py: number,
  gx: number,
  gy: number,
  strength: number,
): { dx: number; dy: number; influence: number } {
  const dvx = gx - px;
  const dvy = gy - py;
  const dist = Math.sqrt(dvx * dvx + dvy * dvy);
  const taper = Math.exp(-(dist * dist) / (2 * FALLOFF_SIGMA * FALLOFF_SIGMA));
  const magnitude = strength * taper;
  const softDist = dist + SOFT_RADIUS;
  return {
    dx: -((dvx / softDist) * magnitude),
    dy: -((dvy / softDist) * magnitude),
    influence: taper,
  };
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const thinkingDotsVariants = cva(
  ["inline-flex items-center justify-center"],
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
      surface: {
        default: "",
        "shadow-border": "rounded-sm shadow-(--shadow-border)",
      },
    },
    defaultVariants: { size: "md", surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingDotsProps
  extends
    React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof thinkingDotsVariants> {
  pattern?:
    | "diagonal"
    | "radial"
    | "radial-pull"
    | "horizontal"
    | "random"
    | "breathe"
    | "breathe-x";
  duration?: number;
  disableMotion?: boolean;
  variant?: "rainbow" | "subtle";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ThinkingDots({
  pattern = "diagonal",
  duration = 3.6,
  disableMotion = false,
  variant = "rainbow",
  size,
  surface,
  className,
  ...props
}: ThinkingDotsProps) {
  const wrapperClass = cn(
    thinkingDotsVariants({ size, surface }),
    variant === "subtle" && "thinking-dots-subtle",
    className,
  );

  // Unique gradient ID per instance (avoids collisions with multiple mounts)
  const rawId = useId();
  const gradId = `td-grad-${rawId.replace(/:/g, "")}`;

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const lineOverlayRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotBaseRefs = useRef<(SVGCircleElement | null)[]>([]);
  const dotOverlayRefs = useRef<(SVGCircleElement | null)[]>([]);
  const gradRef = useRef<SVGLinearGradientElement | null>(null);

  useAnimationFrame((time) => {
    if (disableMotion) return;
    const t = (time / 1000 / duration) % 1;
    const { x: gx, y: gy } = gravityPosition(pattern, t);

    // breathe patterns alternate push/pull: first lap (+1), second lap (−1)
    const isBreathe = pattern === "breathe" || pattern === "breathe-x";
    let forceMul: number;
    if (pattern === "diagonal") {
      const phase = (t * 8) % 8;
      const seg = Math.floor(phase) % 8;
      if (seg % 2 === 1) {
        forceMul = 0; // odd segment = rest
      } else {
        const frac = phase - Math.floor(phase);
        forceMul = Math.sin(frac * Math.PI); // 0 → +1 → 0
      }
    } else if (pattern === "radial-pull") {
      const phase = (t * 3) % 3;
      const seg = Math.floor(phase) % 3;
      if (seg === 1) {
        forceMul = 0; // rest
      } else {
        const frac = phase - Math.floor(phase);
        const sign = seg === 0 ? 1 : -1; // push then pull
        forceMul = sign * Math.sin(frac * Math.PI); // 0 → ±1 → 0
      }
    } else if (isBreathe) {
      forceMul = t < 0.5 ? 1 : -1;
    } else {
      forceMul = 1;
    }
    const shiftStr = GRID_SHIFT_STRENGTH * forceMul;
    const curveStr = CURVE_STRENGTH * forceMul;

    // ── Gradient sweep ──────────────────────────────────────────────────────
    // horizontal/diagonal: linear ramp so the band sweeps fully off-screen at
    // both cycle boundaries → seamless loop with no bounce.
    // All other patterns: gravity-derived direction + sin-based sweep (natural
    // loop for radial/breathe/random).
    let sweepDirX: number, sweepDirY: number, sweepOffset: number;

    if (pattern === "horizontal") {
      sweepDirX = 1;
      sweepDirY = 0;
      sweepOffset = (t * 2 - 1) * 20;
    } else {
      // Direction from gravity offset — works for diagonal, radial, breathe, random
      const gdx = gx - 10;
      const gdy = gy - 10;
      const gLen = Math.sqrt(gdx * gdx + gdy * gdy) || 1;
      sweepDirX = gdx / gLen;
      sweepDirY = gdy / gLen;
      sweepOffset = Math.sin(t * 2 * Math.PI) * 14;
    }

    const ox = 10 + sweepDirX * sweepOffset;
    const oy = 10 + sweepDirY * sweepOffset;
    gradRef.current?.setAttribute(
      "x1",
      String(ox - sweepDirX * GRAD_HALF_SPAN),
    );
    gradRef.current?.setAttribute(
      "y1",
      String(oy - sweepDirY * GRAD_HALF_SPAN),
    );
    gradRef.current?.setAttribute(
      "x2",
      String(ox + sweepDirX * GRAD_HALF_SPAN),
    );
    gradRef.current?.setAttribute(
      "y2",
      String(oy + sweepDirY * GRAD_HALF_SPAN),
    );

    // Update lines: displace endpoints (cloth shift), midpoint as sole control point (C-curve)
    for (let i = 0; i < LINES.length; i++) {
      const ln = LINES[i]!;
      const s = displacePoint(ln.x1, ln.y1, gx, gy, shiftStr);
      const m = displacePoint(ln.mx, ln.my, gx, gy, curveStr);
      const e = displacePoint(ln.x2, ln.y2, gx, gy, shiftStr);

      const linePath = `M ${ln.x1 + s.dx} ${ln.y1 + s.dy} Q ${ln.mx + m.dx} ${ln.my + m.dy} ${ln.x2 + e.dx} ${ln.y2 + e.dy}`;
      pathRefs.current[i]?.setAttribute("d", linePath);

      const lineOverlay = lineOverlayRefs.current[i];
      if (lineOverlay) {
        lineOverlay.setAttribute("d", linePath);
        lineOverlay.setAttribute("opacity", String(m.influence * 0.5));
      }
    }

    // Update dots: displace via transform (compositor-tier), pulse radius, influence-based opacity
    for (let i = 0; i < DOTS.length; i++) {
      const { cx, cy } = DOTS[i]!;
      const { dx, dy, influence } = displacePoint(cx, cy, gx, gy, shiftStr);
      const r = DOT_R_MIN + influence * (DOT_R_MAX - DOT_R_MIN);
      // translate in SVG user-space units (no px suffix) for compositor compositing
      const translateStr = `translate(${dx.toFixed(2)}, ${dy.toFixed(2)})`;

      const base = dotBaseRefs.current[i];
      if (base) {
        base.setAttribute("transform", translateStr);
        base.setAttribute("opacity", String(0.65 + influence * 0.35));
        base.setAttribute("r", String(r));
      }

      const overlay = dotOverlayRefs.current[i];
      if (overlay) {
        overlay.setAttribute("transform", translateStr);
        overlay.setAttribute("opacity", String(influence));
        overlay.setAttribute("r", String(r));
      }
    }
  });

  const svg = (
    <svg
      aria-hidden="true"
      {...props}
      viewBox="0 0 20 20"
      width="100%"
      height="100%"
    >
      <defs>
        {/* Narrow-band shimmer — sweeps along gravity direction */}
        <linearGradient
          id={gradId}
          ref={gradRef}
          gradientUnits="userSpaceOnUse"
          spreadMethod="repeat"
          x1="-27"
          y1="10"
          x2="33"
          y2="10"
        >
          <stop offset="0%" stopColor="var(--effect-thinking-1)" />
          <stop offset="20%" stopColor="var(--effect-thinking-2)" />
          <stop offset="40%" stopColor="var(--effect-thinking-3)" />
          <stop offset="60%" stopColor="var(--effect-thinking-4)" />
          <stop offset="80%" stopColor="var(--effect-thinking-5)" />
          <stop offset="100%" stopColor="var(--effect-thinking-1)" />
        </linearGradient>
      </defs>
      {LINES.map((ln, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el;
          }}
          d={`M ${ln.x1} ${ln.y1} Q ${ln.mx} ${ln.my} ${ln.x2} ${ln.y2}`}
          fill="none"
          stroke="var(--effect-thinking-line)"
          strokeWidth={LINE_STROKE}
          strokeLinecap="round"
        />
      ))}
      {LINES.map((ln, i) => (
        <path
          key={`overlay-${i}`}
          ref={(el) => {
            lineOverlayRefs.current[i] = el;
          }}
          d={`M ${ln.x1} ${ln.y1} Q ${ln.mx} ${ln.my} ${ln.x2} ${ln.y2}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={LINE_STROKE}
          strokeLinecap="round"
          opacity={0}
        />
      ))}
      {DOTS.map(({ cx, cy }, i) => (
        <g key={i}>
          <circle
            ref={(el) => {
              dotBaseRefs.current[i] = el;
            }}
            cx={cx}
            cy={cy}
            r={DOT_R_MIN}
            fill="var(--effect-thinking-dot)"
            opacity={disableMotion ? 0.8 : 0.65}
          />
          <circle
            ref={(el) => {
              dotOverlayRefs.current[i] = el;
            }}
            cx={cx}
            cy={cy}
            r={DOT_R_MIN}
            fill={`url(#${gradId})`}
            opacity={0}
          />
        </g>
      ))}
    </svg>
  );

  if (disableMotion) {
    return (
      <span className={wrapperClass}>
        <VisuallyHidden>Loading</VisuallyHidden>
        {svg}
      </span>
    );
  }

  return (
    <motion.span
      className={wrapperClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      <VisuallyHidden>Loading</VisuallyHidden>
      {svg}
    </motion.span>
  );
}

// ━━━ ThinkingShip — mini saucer weaving through asteroid streaks ━━━━━━━━━━━━━

// ─── Constants ────────────────────────────────────────────────────────────────

const SHIP_CX = 10; // ship center X in viewBox
const SHIP_CY = 10; // ship center Y in viewBox
const WEAVE_AMP = 0.6; // primary weave amplitude (px along perpendicular axis)
const WEAVE_AMP_2 = 0.3; // secondary weave amplitude (px)
const WEAVE_FREQ = 1.1; // primary wave frequency (rad/s)
const WEAVE_FREQ_2 = 2.7; // secondary wave frequency (rad/s)
const SQ2_INV = 1 / Math.sqrt(2); // ≈ 0.707

/** Asteroid streak — each travels diagonally from top-right to bottom-left. */
type AsteroidDef = {
  x0: number;
  y0: number;
  speed: number;
  phase: number;
  half: number;
};

const ASTEROIDS: AsteroidDef[] = [
  { x0: 18, y0: 0, speed: 8, phase: 0.0, half: 2.5 },
  { x0: 22, y0: 5, speed: 6, phase: 0.35, half: 3.0 },
  { x0: 15, y0: -2, speed: 10, phase: 0.6, half: 2.0 },
  { x0: 24, y0: 2, speed: 7, phase: 0.2, half: 2.8 },
  { x0: 20, y0: 9, speed: 5, phase: 0.78, half: 2.3 },
];

/** Diagonal travel distance per wrap cycle (viewBox units). */
const ASTEROID_CYCLE = 36;

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const thinkingShipVariants = cva(
  ["inline-flex items-center justify-center"],
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
      surface: {
        default: "",
        "shadow-border": "rounded-sm shadow-(--shadow-border)",
      },
    },
    defaultVariants: { size: "md", surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingShipProps
  extends
    React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof thinkingShipVariants> {
  /** Omit to follow the application theme. */
  treatment?: "graphite" | "silver";
  duration?: number;
  disableMotion?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ThinkingShip({
  treatment,
  duration = 4,
  disableMotion = false,
  size,
  surface,
  className,
  ...props
}: ThinkingShipProps) {
  void duration; // exposed for API consistency; internal speeds are fixed

  const wrapperClass = cn(thinkingShipVariants({ size, surface }), className);

  const shipRef = useRef<SVGGElement | null>(null);
  const asteroidRefs = useRef<(SVGLineElement | null)[]>([]);

  useAnimationFrame((time) => {
    if (disableMotion) return;
    const t = time / 1000; // seconds

    // ── Ship weave: two-sine oscillation perpendicular to heading ────────────
    // Heading: top-right (1,−1)/√2. Perpendicular (CCW): (1,1)/√2.
    const wave =
      WEAVE_AMP * Math.sin(t * WEAVE_FREQ) +
      WEAVE_AMP_2 * Math.sin(t * WEAVE_FREQ_2);
    const sx = SHIP_CX + wave * SQ2_INV;
    const sy = SHIP_CY + wave * SQ2_INV;
    shipRef.current?.setAttribute(
      "transform",
      `translate(${sx.toFixed(2)}, ${sy.toFixed(2)})`,
    );

    // ── Asteroid streaks: diagonal travel, wrap when off-screen ─────────────
    for (let i = 0; i < ASTEROIDS.length; i++) {
      const a = ASTEROIDS[i]!;
      const progress =
        (t * a.speed + a.phase * ASTEROID_CYCLE) % ASTEROID_CYCLE;
      const cx = a.x0 - progress * SQ2_INV;
      const cy = a.y0 + progress * SQ2_INV;
      // Fade in over 2 units, fade out over 4 units near the end of each cycle
      const opacity = Math.min(
        1,
        Math.min(progress / 2, (ASTEROID_CYCLE - progress) / 4),
      );
      const el = asteroidRefs.current[i];
      if (el) {
        el.setAttribute("x1", (cx + a.half * SQ2_INV).toFixed(2));
        el.setAttribute("y1", (cy - a.half * SQ2_INV).toFixed(2));
        el.setAttribute("x2", (cx - a.half * SQ2_INV).toFixed(2));
        el.setAttribute("y2", (cy + a.half * SQ2_INV).toFixed(2));
        el.setAttribute("opacity", opacity.toFixed(3));
      }
    }
  });

  const svg = (
    <svg
      aria-hidden="true"
      {...props}
      viewBox="0 0 20 20"
      width="100%"
      height="100%"
    >
      {/* Asteroid streaks — rendered first so they appear behind the ship */}
      {ASTEROIDS.map((_, i) => (
        <line
          key={i}
          ref={(el) => {
            asteroidRefs.current[i] = el;
          }}
          x1="20"
          y1="0"
          x2="20"
          y2="0"
          stroke="var(--effect-thinking-asteroid)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={0}
        />
      ))}
      <g ref={shipRef} transform={`translate(${SHIP_CX}, ${SHIP_CY})`}>
        <SpaceshipMarkImage
          treatment={treatment}
          x="-9"
          y={-(18 * 380) / 405 / 2}
          width="18"
          height={(18 * 380) / 405}
        />
      </g>
    </svg>
  );

  if (disableMotion) {
    return (
      <span className={wrapperClass}>
        <VisuallyHidden>Loading</VisuallyHidden>
        {svg}
      </span>
    );
  }

  return (
    <motion.span
      className={wrapperClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      <VisuallyHidden>Loading</VisuallyHidden>
      {svg}
    </motion.span>
  );
}

// ━━━ ThinkingLogo — SpaceshipLogoScene at 20×24 px ━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingLogoProps {
  disableMotion?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Spaceship mark rendered at 20×24 px as a thinking indicator. */
export function ThinkingLogo({
  disableMotion = false,
  className,
}: ThinkingLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-5 h-6 overflow-hidden",
        className,
      )}
    >
      <SpaceshipLogoScene
        width={20}
        interactive={false}
        disableMotion={disableMotion}
        decorations={[]}
      />
    </span>
  );
}

// ━━━ ThinkingSaucer — beam-less saucer icon (32×32 inline SVG) ━━━━━━━━━━━━━━

// ─── Animation constants ──────────────────────────────────────────────────────

/** Sway-bank-rest cycle constants. */
const SWAY = {
  x: 2, // px lateral drift per sway
  bankAngle: 6, // degrees tilt opposite to sway direction
  neutral: 0, // preserve the approved logo tilt
};
const BOB = {
  y: 1.5, // px vertical float amplitude
};

/** Possible drift targets — left, center, right. */
const DRIFT_TARGETS = [-SWAY.x, 0, SWAY.x];
/** Spring for lateral drift transitions. */
const DRIFT_SPRING = {
  type: "spring" as const,
  stiffness: 20,
  damping: 8,
  duration: 2,
};
/** Random pause range (seconds) between drift moves. */
const DRIFT_PAUSE_MIN = 2;
const DRIFT_PAUSE_MAX = 5;
/** Bob animation config — ease tween, mirrors infinitely for a continuous float. */
const BOB_ANIMATION = {
  duration: 1.0,
  repeat: Infinity,
  repeatType: "mirror" as const,
  ease: "easeInOut" as const,
};

/** Return a random float between min and max. */
const randBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);
/** Pick a random element from an array. */
const randPick = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]!;

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const thinkingSaucerVariants = cva(
  ["inline-flex items-center justify-center"],
  {
    variants: {
      size: {
        lg: "size-6",
        xl: "size-7",
      },
      surface: {
        default: "",
        "shadow-border": "rounded-sm shadow-(--shadow-border)",
      },
    },
    defaultVariants: { size: "lg", surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingSaucerProps
  extends
    React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof thinkingSaucerVariants> {
  /** Omit to follow the application theme. */
  treatment?: "graphite" | "silver";
  duration?: number;
  disableMotion?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Animated saucer icon — bobs gently while drifting to random positions, giving a weightless searching-in-space feel. */
export function ThinkingSaucer({
  treatment,
  duration = 4,
  disableMotion = false,
  size,
  surface,
  className,
  ...props
}: ThinkingSaucerProps) {
  void duration; // exposed for API consistency; internal speeds are fixed

  const [scope, animateEl] = useAnimate();

  useEffect(() => {
    if (disableMotion) return;

    let cancelled = false;

    const run = async () => {
      await animateEl(scope.current, { opacity: 1 }, springs.gentle);

      // Continuous bob on y — runs independently of the sway loop.
      // Motion tracks each property separately, so animating x/rotate won't interrupt this.
      animateEl(scope.current, { y: [-BOB.y, BOB.y] }, BOB_ANIMATION);

      while (!cancelled) {
        const pause = randBetween(DRIFT_PAUSE_MIN, DRIFT_PAUSE_MAX);
        await new Promise<void>((r) => setTimeout(r, pause * 1000));
        if (cancelled) break;

        const targetX = randPick(DRIFT_TARGETS);
        const targetRotate = SWAY.neutral - (targetX / SWAY.x) * SWAY.bankAngle;

        await animateEl(
          scope.current,
          { x: targetX, rotate: targetRotate },
          DRIFT_SPRING,
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [disableMotion, animateEl]);

  const wrapperClass = cn(thinkingSaucerVariants({ size, surface }), className);

  const svg = (
    <svg
      aria-hidden="true"
      {...props}
      viewBox="0 0 32 32"
      width="100%"
      height="100%"
      fill="none"
    >
      <SpaceshipMarkImage
        treatment={treatment}
        x="0"
        y="0"
        width="32"
        height="32"
      />
    </svg>
  );

  if (disableMotion) {
    return (
      <span className={wrapperClass}>
        <VisuallyHidden>Loading</VisuallyHidden>
        {svg}
      </span>
    );
  }

  return (
    <motion.span
      ref={scope}
      className={wrapperClass}
      style={{ willChange: "transform" }}
      initial={{ opacity: 0, x: 0, y: -BOB.y, rotate: SWAY.neutral }}
    >
      <VisuallyHidden>Loading</VisuallyHidden>
      {svg}
    </motion.span>
  );
}

// ━━━ Thinking — shimmer label with scramble and dots ━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Labels ───────────────────────────────────────────────────────────────────

const SCRAMBLE_LABELS = [
  "Thinking",
  "Launching",
  "Orbiting",
  "Navigating",
  "Charting",
  "Drifting",
  "Scanning",
  "Exploring",
] as const;

// ─── Scramble ─────────────────────────────────────────────────────────────────

const SCRAMBLE_CHARS = "▲△▼▽●○■□◆◇◈★☆◎⬡⬢";
const SCRAMBLE_DURATION = 900;

type ScrambleChar = { char: string; resolved: boolean };

function useTextScramble(target: string, active: boolean): ScrambleChar[] {
  const [chars, setChars] = useState<ScrambleChar[]>(() =>
    target.split("").map((char) => ({ char, resolved: true })),
  );
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startRef.current = null;

    function frame(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);

      setChars(
        target.split("").map((char, i) => {
          const resolveAt = (i + 1) / target.length;
          if (char === " " || progress >= resolveAt) {
            return { char, resolved: true };
          }
          return {
            char: SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ]!,
            resolved: false,
          };
        }),
      );

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, active]);

  if (!active) {
    return target.split("").map((char) => ({ char, resolved: true }));
  }
  return chars;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export const thinkingVariants = cva(
  [
    "inline-flex items-center gap-2",
    "[font-weight:var(--font-weight-semibold)]",
    "font-(family-name:--font-family-secondary)",
    "text-body",
  ],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "rounded-full shadow-(--shadow-border) px-2 py-0.5",
      },
    },
    defaultVariants: { surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ThinkingProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof thinkingVariants> {
  disableMotion?: boolean;
  /** Shimmer style applied to text and dots. Defaults to 'blob'. */
  shimmerVariant?: "blob" | "linear" | "subtle";
  /** Show animated dots after the label. Defaults to true. */
  dots?: boolean;
  /** Cycle through themed loading labels with a character-decode scramble every 3 s. Overrides children. Disabled when disableMotion is set. */
  textScramble?: boolean;
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Thinking({
  surface = "default",
  shimmerVariant = "blob",
  disableMotion = false,
  dots = true,
  textScramble = false,
  children = "Thinking",
  className,
  ...props
}: ThinkingProps) {
  const [labelIndex, setLabelIndex] = useState(0);
  const scrambleActive = textScramble && !disableMotion;
  const scrambleChars = useTextScramble(
    SCRAMBLE_LABELS[labelIndex]!,
    scrambleActive,
  );

  useEffect(() => {
    if (!scrambleActive) return;
    const id = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % SCRAMBLE_LABELS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [scrambleActive]);

  const iconEl = (
    <ThinkingOrb size="sm" label="" disableMotion={disableMotion} />
  );

  let content: ReactNode;

  if (scrambleActive) {
    content = (
      <>
        {iconEl}
        <ShimmerText
          variant={shimmerVariant}
          disableMotion={disableMotion}
          dots={dots}
        >
          {scrambleChars.map((c, i) => (
            <span key={i}>{c.char}</span>
          ))}
        </ShimmerText>
      </>
    );
  } else {
    content = (
      <>
        {iconEl}
        <ShimmerText
          variant={shimmerVariant}
          disableMotion={disableMotion}
          dots={dots}
        >
          {children}
        </ShimmerText>
      </>
    );
  }

  if (disableMotion) {
    return (
      <span className={cn(thinkingVariants({ surface }), className)} {...props}>
        {content}
      </span>
    );
  }

  return (
    <motion.span
      className={cn(thinkingVariants({ surface }), className)}
      {...(props as object)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springs.gentle}
    >
      {content}
    </motion.span>
  );
}
