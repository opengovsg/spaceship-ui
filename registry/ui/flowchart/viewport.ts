import type { PositionedNode } from "./layout";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The pan/zoom camera. `screen = translate + scale · world` — see the
 * transform on the content layer in `FlowchartCanvas`, which applies
 * `translate3d(x, y, 0) scale(scale)` with `transformOrigin: "0 0"`.
 */
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ContentBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default upper zoom bound (100%). */
export const MAX_SCALE = 1;
/** Absolute floor so a pathological (near-empty) board can't compute a runaway scale. */
export const MIN_SCALE_FLOOR = 0.05;
/** Default breathing room, in px, between the fitted board and the viewport edge. */
export const DEFAULT_FIT_PADDING = 48;
/** Wheel-to-zoom multiplier: factor = exp(-clampedDeltaPx * ZOOM_SENSITIVITY). */
export const ZOOM_SENSITIVITY = 0.01;
/** Caps a single wheel event's delta so one mouse notch can't teleport the scale. */
export const MAX_WHEEL_DELTA_PX = 50;
/** Below this, two viewports are treated as identical (avoids float-jitter re-renders). */
export const VIEWPORT_EPSILON = 0.01;

const LINE_HEIGHT_PX = 16;

export const EMPTY_BOUNDS: ContentBounds = {
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0,
  width: 0,
  height: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

/**
 * Real bounding box of the laid-out nodes. Does NOT assume the top-left is
 * `(0, 0)` — `computeLayout` leaves an empty column with no nodes, so the
 * first column can be empty and `minX` can be positive.
 */
export function computeContentBounds(
  positioned: PositionedNode[],
): ContentBounds {
  if (positioned.length === 0) return EMPTY_BOUNDS;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of positioned) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + p.width);
    maxY = Math.max(maxY, p.y + p.height);
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Keeps the leading content edge visible when panning toward either viewport edge. */
export function constrainViewportToContent(
  viewport: Viewport,
  bounds: ContentBounds,
  container: Size,
  padding = DEFAULT_FIT_PADDING,
): Viewport {
  if (
    bounds.width <= 0 ||
    bounds.height <= 0 ||
    container.width <= 0 ||
    container.height <= 0
  )
    return viewport;
  const insetX = Math.min(padding, container.width / 2);
  const insetY = Math.min(padding, container.height / 2);
  const x = clamp(
    viewport.x,
    insetX - bounds.maxX * viewport.scale,
    container.width - insetX - bounds.minX * viewport.scale,
  );
  const y = clamp(
    viewport.y,
    insetY - bounds.maxY * viewport.scale,
    container.height - insetY - bounds.minY * viewport.scale,
  );
  return x === viewport.x && y === viewport.y
    ? viewport
    : { ...viewport, x, y };
}

/** The scale that fits `bounds` entirely inside `container`, minus `padding` on every side. */
export function computeFitScale(
  bounds: ContentBounds,
  container: Size,
  padding: number,
  maxScale: number,
): number {
  if (bounds.width <= 0 || bounds.height <= 0) return maxScale;
  if (container.width <= 0 || container.height <= 0) return maxScale;
  const availW = Math.max(1, container.width - padding * 2);
  const availH = Math.max(1, container.height - padding * 2);
  const raw = Math.min(availW / bounds.width, availH / bounds.height);
  return clamp(raw, MIN_SCALE_FLOOR, maxScale);
}

/** The viewport that centers `bounds` in `container` at the given `scale`. */
export function computeFitViewport(
  bounds: ContentBounds,
  container: Size,
  scale: number,
): Viewport {
  return {
    scale,
    x: (container.width - bounds.width * scale) / 2 - bounds.minX * scale,
    y: (container.height - bounds.height * scale) / 2 - bounds.minY * scale,
  };
}

/**
 * Resolves the one-shot `initialView="column"` starting viewport — centered
 * on `target`'s column at `scale`, computed only once real content exists.
 *
 * Returns `null` while there isn't yet enough information to center
 * correctly: `target`'s column has no positioned nodes at all (the data
 * this board renders is still loading), or any of its nodes are still sized
 * off `ESTIMATED_NODE_HEIGHT` (not yet reported by a `ResizeObserver`).
 * Callers that lock in the first non-null result forever (as
 * `FlowchartCanvas` does) must not lock in on a `null` — the board would be
 * stuck off-center once the real data/heights land, since this only ever
 * runs once.
 *
 * A `target` of `undefined` (no columns configured at all) resolves
 * immediately to the plain origin — there's no column content to wait for.
 */
export function resolveInitialColumnViewport(
  target: string | undefined,
  positioned: PositionedNode[],
  measuredHeights: Record<string, number>,
  container: Size,
  scale: number,
): Viewport | null {
  if (!target) return { x: 0, y: 0, scale };

  const targetNodes = positioned.filter((p) => p.spec.column === target);
  if (targetNodes.length === 0) return null;
  const heightsMeasured = targetNodes.every(
    (p) => measuredHeights[p.spec.id] !== undefined,
  );
  if (!heightsMeasured) return null;

  const bounds = computeContentBounds(targetNodes);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return {
    scale,
    x: container.width / 2 - scale * centerX,
    y: container.height / 2 - scale * centerY,
  };
}

export function isSameViewport(a: Viewport, b: Viewport): boolean {
  return (
    Math.abs(a.x - b.x) < VIEWPORT_EPSILON &&
    Math.abs(a.y - b.y) < VIEWPORT_EPSILON &&
    Math.abs(a.scale - b.scale) < VIEWPORT_EPSILON
  );
}

/**
 * Zooms `v` to `requestedScale` (clamped to `[minScale, maxScale]`) while
 * keeping the world point under screen point `(px, py)` fixed. Returns `v`
 * itself (same reference) when the clamped scale doesn't change, so calling
 * this at the clamp boundary — e.g. holding a pinch at the floor — never
 * produces a new object and never triggers a re-render.
 */
export function zoomAbout(
  v: Viewport,
  requestedScale: number,
  px: number,
  py: number,
  minScale: number,
  maxScale: number,
): Viewport {
  const scale = clamp(requestedScale, minScale, maxScale);
  if (scale === v.scale) return v;
  const k = scale / v.scale;
  return {
    scale,
    x: px - k * (px - v.x),
    y: py - k * (py - v.y),
  };
}

/**
 * Normalizes a wheel event's vertical delta into a zoom factor. Trackpad
 * pinch on macOS arrives as `wheel` with `ctrlKey: true` and a small
 * `deltaY`; a physical mouse wheel with ctrl held delivers a much larger
 * one. Exponential response makes zooming in and back out exact inverses
 * and keeps the result always positive.
 */
export function wheelZoomFactor(
  e: Pick<WheelEvent, "deltaY" | "deltaMode">,
  viewportHeight: number,
): number {
  const px =
    e.deltaMode === 1
      ? e.deltaY * LINE_HEIGHT_PX
      : e.deltaMode === 2
        ? e.deltaY * viewportHeight
        : e.deltaY;
  const clamped = clamp(px, -MAX_WHEEL_DELTA_PX, MAX_WHEEL_DELTA_PX);
  return Math.exp(-clamped * ZOOM_SENSITIVITY);
}
