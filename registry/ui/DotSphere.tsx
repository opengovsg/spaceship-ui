import { cn } from "#/components/ds/lib/classnames";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SIZE = 156;
const DEFAULT_DOT_COUNT = 180;
/** View box is a fixed 100×100 square; `size` only scales the rendered SVG. */
const VIEW_BOX_SIZE = 100;
const SPHERE_RADIUS = 46;
const MIN_DOT_RADIUS = 0.55;
const MAX_DOT_RADIUS = 1.45;
const MIN_OPACITY = 0.15;
const MAX_OPACITY = 1;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SphereDot {
  cx: number;
  cy: number;
  r: number;
  opacity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Deterministic points on a sphere via a Fibonacci lattice, projected
 * orthographically (front hemisphere only — `z >= 0`) onto a 2D circle.
 * Deterministic (no `Math.random()`) so Storybook and SSR renders are stable.
 */
function computeSphereDots(count: number): SphereDot[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const dots: SphereDot[] = [];

  for (let i = 0; i < count; i++) {
    // Evenly spaced z in [-1, 1]; keep only the front-facing hemisphere.
    const z = 1 - (i / (count - 1)) * 2;
    if (z < 0) continue;

    const radiusAtZ = Math.sqrt(1 - z * z);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radiusAtZ;
    const y = Math.sin(theta) * radiusAtZ;

    // z drives both apparent size and opacity, so dots near the sphere's
    // silhouette edge recede and the shape reads as a sphere, not a disc.
    const depth = (z + 1) / 2; // 0 (edge) .. 1 (center-front)
    dots.push({
      cx: VIEW_BOX_SIZE / 2 + x * SPHERE_RADIUS,
      cy: VIEW_BOX_SIZE / 2 + y * SPHERE_RADIUS,
      r: MIN_DOT_RADIUS + depth * (MAX_DOT_RADIUS - MIN_DOT_RADIUS),
      opacity: MIN_OPACITY + depth * (MAX_OPACITY - MIN_OPACITY),
    });
  }

  return dots;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DotSphereProps {
  /** Rendered width and height in px. Default 156 (the landing hero size). */
  size?: number;
  /** Number of lattice points generated before back-hemisphere culling. Default 180. */
  dotCount?: number;
  className?: string;
}

// ─── DotSphere ────────────────────────────────────────────────────────────────

/** Decorative dotted-sphere illustration used above the proposer-flow landing heading. */
export function DotSphere({
  size = DEFAULT_SIZE,
  dotCount = DEFAULT_DOT_COUNT,
  className,
}: DotSphereProps) {
  const dots = computeSphereDots(dotCount);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
      className={cn("fill-(--text-primary)", className)}
      role="presentation"
      aria-hidden="true"
    >
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          opacity={dot.opacity}
        />
      ))}
    </svg>
  );
}
