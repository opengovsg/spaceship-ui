"use client";

import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";
import { useSystemReducedMotion } from "../use-reduced-motion";
import { nodeTypes } from "./nodes";
import { bottomBranchPath, BRANCH_INSET } from "./edge-path";
import { computeLayout } from "./layout";
import {
  clamp,
  computeContentBounds,
  constrainViewportToContent,
  computeFitScale,
  computeFitViewport,
  DEFAULT_FIT_PADDING,
  isSameViewport,
  MAX_SCALE,
  resolveInitialColumnViewport,
  VIEWPORT_EPSILON,
  wheelZoomFactor,
  zoomAbout,
  type Size,
  type Viewport,
} from "./viewport";
import type {
  ColumnConfig,
  ColumnId,
  FlowchartCanvasHandle,
  FlowchartEdgeSpec,
  FlowchartNodeSpec,
} from "./types";
import type { LayoutOptions } from "./layout";

// ─── Constants ────────────────────────────────────────────────────────────────

const cubicEaseOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Drag movement below this, in screen px, doesn't count as "the user touched the view". */
const DRAG_INTERACTION_THRESHOLD_PX = 3;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

// --- Node/edge entrance ---
// A new card grows rightward out of the point where its connector arrives, so
// the board reads as each column having produced the next. Delays cascade left
// to right — the direction generation actually flows.

/** Delay added per column index, in seconds. */
const ENTRANCE_COLUMN_STAGGER_S = 0.09;
/** Delay added per row within a column, in seconds. */
const ENTRANCE_ROW_STAGGER_S = 0.06;
/** How far behind its incoming edge a card lands, in seconds. */
const ENTRANCE_NODE_OFFSET_S = 0.12;
/** How long a solid connector takes to draw itself, in seconds. */
const ENTRANCE_EDGE_DURATION_S = 0.4;
/** How far left of its resting place a card starts, in px. */
const ENTRANCE_SLIDE_PX = 56;
const ENTRANCE_SCALE_FROM = 0.72;

// --- Solid-connector pulse ---
// A sliver runs source-to-target along every solid connector, so the board reads
// as still flowing toward each child after the entrance settles. Dotted connectors stand
// for steps that don't exist yet, so nothing flows down them.

/** Fraction of a connector's travel-axis span the sliver covers. */
const PULSE_LENGTH = 0.14;
/** Floor on the sliver's length in px, so a short connector still shows one. */
const MIN_PULSE_LENGTH_PX = 16;
/** How long one sliver takes to cross a connector, in seconds. */
const PULSE_DURATION_S = 1.4;
/** Quiet gap between slivers, in seconds. Short enough that a glance at the
 *  board almost always catches a connector mid-pulse. */
const PULSE_GAP_S = 0.4;
/** Padding around connector bounds so reveal/pulse clips include the whole
 *  stroke, including the horizontal entry at the end of a vertical branch. */
const EDGE_CLIP_PADDING_PX = 12;

// --- Dotted connectors ---
// Dash and gap are resolved against the screen CTM (see `non-scaling-stroke`
// below), so these are effectively screen px and hold their rhythm at any zoom.
// The round linecap adds half a stroke width to each end of every dash, so a
// dash of 8 at 2px reads as ~10 long and the gap as ~2 shorter than stated.

/** Length of one dash on a dotted connector. */
const DOTTED_DASH = 8;
/** Gap between dashes on a dotted connector. */
const DOTTED_GAP = 8;
const DOTTED_PATTERN = `${DOTTED_DASH} ${DOTTED_GAP}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

type EdgeClip = {
  axis: "x" | "y";
  start: number;
  end: number;
  crossStart: number;
  crossSize: number;
};

/**
 * The travelling sliver on one solid connector: a plain, undashed copy of the
 * connector's own stroke, revealed only inside a `<rect>` that slides from
 * source to target.
 *
 * A `clipPath` rect, not a `pathLength`/`stroke-dasharray` trick (framer's own
 * mechanism for animating a moving dash along an SVG path): Chromium's
 * arc-length approximation for a `pathLength`-normalized dash pattern
 * measurably diverges from the true stroke geometry on a curved path — the
 * connector showed a visible gap at the bend, and the travelling sliver
 * appeared to stall there. Clipping is pure rect-vs-path geometry, so it
 * can't hit that bug. The one tradeoff: the rect slides along the routing axis
 * (x for pipeline edges, y for hierarchy branches), not by arc length. This
 * keeps a long vertical trunk from flashing all at once through a narrow
 * horizontal clip. Padded cross-bounds include the rounded turn and entry.
 *
 * Its own component so the loop can be driven by an imperative `animate` on a
 * motion value instead of the `animate` prop. Boards like the proposer flow
 * re-render constantly, and each re-render restarts a prop-driven animation
 * from wherever it had reached — so once the sliver had run out to the target
 * end, every restart was a no-op and the repeat died silently. A motion value
 * is owned by the element, not by React, so the loop survives re-renders.
 */
function EdgePulse({
  d,
  clip,
  clipId,
  delay,
}: {
  d: string;
  clip: EdgeClip;
  clipId: string;
  delay: number;
}) {
  const { axis, start, end, crossStart, crossSize } = clip;
  const pulseLength = Math.max(
    MIN_PULSE_LENGTH_PX,
    Math.abs(end - start) * PULSE_LENGTH,
  );
  // Travel beyond both anchors so the full stroke enters and leaves the clip,
  // including the horizontal segment at a vertical branch's final y position.
  const travelPadding = axis === "y" ? EDGE_CLIP_PADDING_PX : 0;
  const forward = end >= start;
  const from = forward
    ? start - pulseLength - travelPadding
    : start + travelPadding;
  const to = forward ? end + travelPadding : end - pulseLength - travelPadding;
  const clipPosition = useMotionValue(from);

  useEffect(() => {
    clipPosition.set(from);
    const controls = animate(clipPosition, to, {
      duration: PULSE_DURATION_S,
      ease: "linear",
      repeat: Infinity,
      repeatDelay: PULSE_GAP_S,
      delay,
    });
    return () => controls.stop();
  }, [clipPosition, delay, from, to]);

  return (
    <>
      <clipPath id={clipId}>
        <motion.rect
          {...(axis === "x"
            ? {
                x: clipPosition,
                y: crossStart,
                width: pulseLength,
                height: crossSize,
              }
            : {
                x: crossStart,
                y: clipPosition,
                width: crossSize,
                height: pulseLength,
              })}
        />
      </clipPath>
      <path
        d={d}
        fill="none"
        // Deliberately louder than the line it rides on: at the neutral border
        // tokens the sliver and the connector sit at near-identical luminance and
        // the pulse reads as a faint hue shift rather than movement.
        className="stroke-(--text-interactive-primary)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        clipPath={`url(#${clipId})`}
      />
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FlowchartCanvasProps {
  columns: ColumnConfig[];
  nodes: FlowchartNodeSpec[];
  edges: FlowchartEdgeSpec[];
  /** Horizontal gap between columns, in px. Defaults to `DEFAULT_COLUMN_GAP_X` (110). */
  columnGap?: number;
  /** Shared row ordering, including rows absent from a column. */
  rowOrder?: string[];
  /**
   * `false` makes the board a static picture: scaled to fit and centered,
   * re-fitting on every resize, with no pan, zoom or drag. Nodes stay
   * clickable. Defaults to `true`.
   */
  interactive?: boolean;
  /** Disable canvas zoom and automatic scaling; keep cards at 100% with panning. */
  zoomEnabled?: boolean;
  /** Stop panning before the outermost node edges leave the viewport. */
  constrainPan?: boolean;
  /**
   * `"fit"` (default) opens zoomed out far enough to show the whole board.
   * `"column"` is the legacy behavior: 100% scale, centered on
   * `initialFocusColumn`.
   */
  initialView?: "fit" | "column";
  /**
   * @deprecated Only honored when `initialView === "column"`. The fit-all
   * default makes an initial focus column redundant — use the imperative
   * `focusColumn` handle to move the view after mount instead.
   */
  initialFocusColumn?: ColumnId;
  /** Px of breathing room between the board and the viewport edge when fitting. Default 48. */
  fitPadding?: number;
  /** Upper zoom bound. Default 1 (100%). The lower bound is always the fit scale. */
  maxScale?: number;
  /** Skips fit/focus tweens. Also implied by `prefers-reduced-motion`. */
  disableMotion?: boolean;
  className?: string;
}

// ─── FlowchartCanvas ──────────────────────────────────────────────────────────

/**
 * Flowchart canvas: fixed, non-overlapping column layout with custom
 * card-style nodes and decorative bezier edges (dotted into a `futureStep` or
 * `newItemCta` node, solid into everything else).
 *
 * Two modes, set by `interactive`:
 * - **Interactive** (default) opens zoomed out to fit the whole board, then
 *   lets the user pan (pointer drag, wheel/trackpad scroll) and zoom in
 *   (ctrl/cmd + wheel, trackpad pinch) up to `maxScale`. It can never be
 *   zoomed out past fit.
 * - **Static** (`interactive={false}`) is a picture: always scaled to fit and
 *   centered, re-fitting on every resize. No pan, zoom or drag — nodes stay
 *   clickable.
 *
 * @throws nothing — an unresolvable node/edge reference is silently skipped
 * by `computeLayout` rather than thrown.
 */
export const FlowchartCanvas = forwardRef<
  FlowchartCanvasHandle,
  FlowchartCanvasProps
>(
  (
    {
      columns,
      nodes: nodeSpecs,
      edges: edgeSpecs,
      columnGap,
      rowOrder,
      interactive = true,
      zoomEnabled = true,
      constrainPan = false,
      initialView = "fit",
      initialFocusColumn,
      fitPadding = DEFAULT_FIT_PADDING,
      maxScale: requestedMaxScale = MAX_SCALE,
      disableMotion = false,
      className,
    },
    ref,
  ) => {
    // Namespaces this instance's edge clipPath ids, so two boards rendered on
    // the same page (e.g. a docs page with multiple stories) can't collide
    // via a shared `url(#...)` fragment reference. `useId()`'s raw output
    // (e.g. `:r0:`) contains colons, which break `url(#...)` fragment
    // references — strip them, matching thinking-orb.tsx's `gradId`.
    const maxScale = zoomEnabled ? requestedMaxScale : 1;
    const canvasId = useId().replace(/:/g, "");

    // --- Pan surface element + its measured size ---
    const [surfaceEl, setSurfaceEl] = useState<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState<Size>({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      if (!surfaceEl) return;
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        // contentRect is LAYOUT space (pre-transform); the pan surface itself
        // is never transformed, so this is safe regardless of content scale.
        const { width, height } = entry.contentRect;
        setContainerSize((prev) =>
          prev.width === width && prev.height === height
            ? prev
            : { width, height },
        );
      });
      observer.observe(surfaceEl);
      return () => observer.disconnect();
    }, [surfaceEl]);

    // --- Node height measurement (widths are fixed per column; heights depend on content) ---
    const heightsRef = useRef<Record<string, number>>({});
    const observersRef = useRef<Record<string, ResizeObserver>>({});
    const [heightsVersion, setHeightsVersion] = useState(0);

    const registerNodeEl = useCallback(
      (id: string, el: HTMLDivElement | null) => {
        const existing = observersRef.current[id];
        if (existing) {
          existing.disconnect();
          delete observersRef.current[id];
        }
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          // contentRect is LAYOUT space (pre-transform). Do NOT switch this to
          // getBoundingClientRect(): the content layer is CSS-scaled, so a
          // screen-space height would feed back into computeLayout →
          // contentBounds → fitScale → scale → height, and oscillate.
          const h = entry.contentRect.height;
          if (Math.abs((heightsRef.current[id] ?? 0) - h) > 0.5) {
            heightsRef.current[id] = h;
            setHeightsVersion((v) => v + 1);
          }
        });
        observer.observe(el);
        observersRef.current[id] = observer;
      },
      [],
    );

    useEffect(
      () => () => {
        Object.values(observersRef.current).forEach((o) => o.disconnect());
      },
      [],
    );

    // A fresh arrow per node per render would tear down and rebuild that
    // node's ResizeObserver every render (worse under drag, which re-renders
    // at 60fps) — cache one stable callback per node id instead.
    const nodeRefCallbacksRef = useRef(
      new Map<string, (el: HTMLDivElement | null) => void>(),
    );
    const getNodeRef = useCallback(
      (id: string) => {
        const cache = nodeRefCallbacksRef.current;
        let fn = cache.get(id);
        if (!fn) {
          fn = (el: HTMLDivElement | null) => registerNodeEl(id, el);
          cache.set(id, fn);
        }
        return fn;
      },
      [registerNodeEl],
    );
    useEffect(() => {
      const ids = new Set(nodeSpecs.map((s) => s.id));
      for (const id of nodeRefCallbacksRef.current.keys()) {
        if (!ids.has(id)) nodeRefCallbacksRef.current.delete(id);
      }
    }, [nodeSpecs]);

    // --- Layout ---
    const layoutOptions = useMemo<LayoutOptions>(
      () => ({ columnGap, rowOrder }),
      [columnGap, rowOrder],
    );

    const positioned = useMemo(
      () =>
        computeLayout(nodeSpecs, columns, heightsRef.current, layoutOptions),
      // heightsRef is read through heightsVersion on purpose; see registerNodeEl.
      // oxlint-disable-next-line react/exhaustive-deps
      [nodeSpecs, columns, layoutOptions, heightsVersion],
    );

    const positionById = useMemo(() => {
      const map = new Map<string, (typeof positioned)[number]>();
      for (const p of positioned) map.set(p.spec.id, p);
      return map;
    }, [positioned]);

    const contentBounds = useMemo(
      () => computeContentBounds(positioned),
      [positioned],
    );

    // --- Entrance cascade ---
    const reduceMotion = useSystemReducedMotion() || disableMotion;

    /** Targets of at least one edge — i.e. nodes that were produced by something. */
    const nodesWithParent = useMemo(
      () => new Set(edgeSpecs.map((e) => e.target)),
      [edgeSpecs],
    );

    const columnIndex = useMemo(() => {
      const m = new Map<ColumnId, number>();
      columns.forEach((c, i) => m.set(c.id, i));
      return m;
    }, [columns]);

    /** Row position within a column, read off the already column-major `positioned`. */
    const rowIndexById = useMemo(() => {
      const rows = new Map<string, number>();
      const counters = new Map<ColumnId, number>();
      for (const p of positioned) {
        const n = counters.get(p.spec.column) ?? 0;
        rows.set(p.spec.id, n);
        counters.set(p.spec.column, n + 1);
      }
      return rows;
    }, [positioned]);

    const entranceDelay = useCallback(
      (spec: FlowchartNodeSpec) =>
        (columnIndex.get(spec.column) ?? 0) * ENTRANCE_COLUMN_STAGGER_S +
        (rowIndexById.get(spec.id) ?? 0) * ENTRANCE_ROW_STAGGER_S,
      [columnIndex, rowIndexById],
    );

    const columnCenter = useCallback(
      (columnId: ColumnId) => {
        const cols = positioned.filter((p) => p.spec.column === columnId);
        if (cols.length === 0) return null;
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const p of cols) {
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x + p.width);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y + p.height);
        }
        return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
      },
      [positioned],
    );

    // --- Fit scale/viewport (derived) ---
    const fitScale = useMemo(
      () =>
        zoomEnabled
          ? computeFitScale(contentBounds, containerSize, fitPadding, maxScale)
          : 1,
      [contentBounds, containerSize, fitPadding, maxScale, zoomEnabled],
    );
    const minScaleRef = useRef(fitScale);
    useEffect(() => {
      minScaleRef.current = fitScale;
    }, [fitScale]);

    const fitViewport = useMemo(
      () => computeFitViewport(contentBounds, containerSize, fitScale),
      [contentBounds, containerSize, fitScale],
    );

    // --- Pan/zoom viewport ---
    const [requestedViewport, setRequestedViewport] = useState<Viewport>({
      x: 0,
      y: 0,
      scale: 1,
    });
    const constrainViewport = useCallback(
      (value: Viewport) =>
        constrainPan
          ? constrainViewportToContent(value, contentBounds, containerSize)
          : value,
      [constrainPan, contentBounds, containerSize],
    );
    const viewport = constrainViewport(requestedViewport);
    const setViewport = useCallback(
      (update: SetStateAction<Viewport>) => {
        setRequestedViewport((previous) => {
          const current = constrainViewport(previous);
          return constrainViewport(
            typeof update === "function" ? update(current) : update,
          );
        });
      },
      [constrainViewport],
    );

    const viewportRef = useRef<Viewport>(viewport);
    useEffect(() => {
      viewportRef.current = viewport;
    }, [viewport]);

    // True once the user has explicitly moved the camera (drag, wheel pan/zoom,
    // or an imperative focusColumn/zoomTo). Gates whether an interactive board
    // keeps auto-fitting on resize. A ref, not state — it must never itself
    // trigger a render.
    const hasInteractedRef = useRef(false);
    const markInteracted = useCallback(() => {
      hasInteractedRef.current = true;
    }, []);

    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef({
      pointerX: 0,
      pointerY: 0,
      lastPointerX: 0,
      lastPointerY: 0,
    });
    const rafRef = useRef<number | null>(null);

    const cancelAnim = useCallback(() => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }, []);
    useEffect(() => cancelAnim, [cancelAnim]);

    const animateViewportTo = useCallback(
      (target: Viewport, duration: number) => {
        cancelAnim();
        if (duration <= 0 || disableMotion || prefersReducedMotion()) {
          setViewport(target);
          return;
        }
        const start = viewportRef.current;
        const startTime = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - startTime) / duration);
          const e = cubicEaseOut(t);
          const ratio = target.scale / start.scale;
          setViewport({
            x: start.x + (target.x - start.x) * e,
            y: start.y + (target.y - start.y) * e,
            // Lerped geometrically, not linearly, so the zoom reads at a
            // constant rate rather than rushing at low scale.
            scale: start.scale * Math.pow(ratio, e),
          });
          if (t < 1) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
      },
      [disableMotion, cancelAnim, setViewport],
    );

    // --- Pointer drag ---
    // Drag deltas are screen px and map 1:1 to translate, regardless of
    // scale — true only because the transform is `translate3d(...) scale(s)`
    // (translate applied before scale) with `transformOrigin: 0 0`. Under
    // `scale(s) translate(...)` the translate would live in scaled space and
    // need `/ s`. Don't "fix" this without re-deriving the transform math.
    const onPointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        // Let interactive controls inside a node (e.g. the CTA node's button)
        // handle their own click instead of being hijacked as a drag gesture.
        if (
          (e.target as HTMLElement).closest(
            "button, a, input, textarea, select, [role='button']",
          )
        ) {
          return;
        }
        cancelAnim();
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
        dragStartRef.current = {
          pointerX: e.clientX,
          pointerY: e.clientY,
          lastPointerX: e.clientX,
          lastPointerY: e.clientY,
        };
      },
      [interactive, cancelAnim],
    );

    const onPointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!interactive) return;
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const { pointerX, pointerY, lastPointerX, lastPointerY } =
          dragStartRef.current;
        if (
          Math.abs(e.clientX - pointerX) > DRAG_INTERACTION_THRESHOLD_PX ||
          Math.abs(e.clientY - pointerY) > DRAG_INTERACTION_THRESHOLD_PX
        ) {
          markInteracted();
        }
        // Discard movement beyond a boundary so reversing responds immediately.
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - lastPointerY;
        dragStartRef.current.lastPointerX = e.clientX;
        dragStartRef.current.lastPointerY = e.clientY;
        setViewport((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      },
      [interactive, markInteracted, setViewport],
    );

    const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      setDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }, []);

    // --- Wheel: pan, or zoom about the pointer with ctrl/cmd held ---
    // (macOS trackpad pinch arrives as `wheel` with `ctrlKey: true`.)
    //
    // Attached as a native, non-passive listener rather than React's onWheel:
    // React registers wheel listeners as passive by default, which silently
    // ignores preventDefault() and lets the page scroll/zoom underneath.
    useEffect(() => {
      if (!surfaceEl || !interactive) return;
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        cancelAnim();

        if (e.ctrlKey || e.metaKey) {
          if (!zoomEnabled) return;
          const rect = surfaceEl.getBoundingClientRect();
          const px = e.clientX - rect.left;
          const py = e.clientY - rect.top;
          const factor = wheelZoomFactor(e, rect.height);
          setViewport((prev) => {
            const next = zoomAbout(
              prev,
              prev.scale * factor,
              px,
              py,
              minScaleRef.current,
              maxScale,
            );
            if (next !== prev) markInteracted();
            return next;
          });
          return;
        }

        markInteracted();
        setViewport((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      };
      surfaceEl.addEventListener("wheel", handleWheel, { passive: false });
      return () => surfaceEl.removeEventListener("wheel", handleWheel);
    }, [
      surfaceEl,
      interactive,
      zoomEnabled,
      maxScale,
      cancelAnim,
      markInteracted,
      setViewport,
    ]);

    // --- Imperative handle ---
    const focusColumn = useCallback(
      (columnId: ColumnId, options?: { duration?: number; scale?: number }) => {
        const center = columnCenter(columnId);
        if (!center) return;
        const cw = containerSize.width || surfaceEl?.clientWidth || 0;
        const ch = containerSize.height || surfaceEl?.clientHeight || 0;
        const scale = clamp(
          options?.scale ?? viewportRef.current.scale,
          minScaleRef.current,
          maxScale,
        );
        markInteracted();
        animateViewportTo(
          { scale, x: cw / 2 - scale * center.x, y: ch / 2 - scale * center.y },
          options?.duration ?? 450,
        );
      },
      [
        columnCenter,
        containerSize,
        surfaceEl,
        maxScale,
        animateViewportTo,
        markInteracted,
      ],
    );

    const fitToContent = useCallback(
      (options?: { duration?: number }) => {
        // Re-arm auto-fit so a later resize keeps tracking the board, rather
        // than freezing at this explicit view like a user-driven zoom would.
        hasInteractedRef.current = false;
        animateViewportTo(fitViewport, options?.duration ?? 450);
      },
      [fitViewport, animateViewportTo],
    );

    const zoomTo = useCallback(
      (scale: number, options?: { duration?: number }) => {
        const cw = containerSize.width || surfaceEl?.clientWidth || 0;
        const ch = containerSize.height || surfaceEl?.clientHeight || 0;
        markInteracted();
        const target = zoomAbout(
          viewportRef.current,
          scale,
          cw / 2,
          ch / 2,
          minScaleRef.current,
          maxScale,
        );
        animateViewportTo(target, options?.duration ?? 450);
      },
      [containerSize, surfaceEl, maxScale, markInteracted, animateViewportTo],
    );

    const getViewport = useCallback(() => viewportRef.current, []);

    useImperativeHandle(
      ref,
      () => ({ focusColumn, fitToContent, zoomTo, getViewport }),
      [focusColumn, fitToContent, zoomTo, getViewport],
    );

    // --- Initial view ---
    // `"column"` is the legacy behavior, preserved as an opt-in: pan (no
    // zoom, 100% scale) to a single column, once — see
    // `resolveInitialColumnViewport`'s doc comment for why this waits for
    // real, measured content instead of firing on the first non-zero
    // container measurement (which could lock the board off-center, e.g.
    // the problem-statement column pinned to the top or bottom edge).
    const didInitialColumnViewRef = useRef(false);
    useEffect(() => {
      if (initialView !== "column") return;
      if (didInitialColumnViewRef.current) return;
      if (containerSize.width === 0 && containerSize.height === 0) return;

      const target = initialFocusColumn ?? columns[0]?.id;
      const viewport = resolveInitialColumnViewport(
        target,
        positioned,
        heightsRef.current,
        containerSize,
        maxScale,
      );
      if (!viewport) return;
      didInitialColumnViewRef.current = true;
      setViewport(viewport);
    }, [
      initialView,
      containerSize,
      positioned,
      initialFocusColumn,
      columns,
      setViewport,
      maxScale,
    ]);

    // Fit-to-content: runs whenever the board is static, or is interactive
    // but the user hasn't touched the camera yet — this is what makes an
    // untouched board converge as node heights land, then re-fit on resize.
    // Once touched, only clamp scale back up if a resize pushed the fit
    // floor above the user's current zoom.
    useEffect(() => {
      if (initialView !== "fit") return;
      if (containerSize.width <= 0 || containerSize.height <= 0) return;
      if (contentBounds.width <= 0 || contentBounds.height <= 0) return;

      if (!interactive || !hasInteractedRef.current) {
        setViewport((prev) =>
          isSameViewport(prev, fitViewport) ? prev : fitViewport,
        );
        return;
      }

      setViewport((prev) =>
        prev.scale >= fitScale - VIEWPORT_EPSILON
          ? prev
          : zoomAbout(
              prev,
              fitScale,
              containerSize.width / 2,
              containerSize.height / 2,
              fitScale,
              maxScale,
            ),
      );
    }, [
      initialView,
      setViewport,
      interactive,
      fitViewport,
      fitScale,
      contentBounds.width,
      contentBounds.height,
      containerSize.width,
      containerSize.height,
      maxScale,
    ]);

    return (
      <div
        ref={setSurfaceEl}
        className={cn(
          "relative h-full w-full overflow-hidden bg-transparent",
          interactive && "touch-none select-none",
          interactive && (dragging ? "cursor-grabbing" : "cursor-grab"),
          className,
        )}
        {...(interactive
          ? {
              onPointerDown,
              onPointerMove,
              onPointerUp,
              onPointerCancel: onPointerUp,
            }
          : {})}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <svg
            width={contentBounds.maxX}
            height={contentBounds.maxY}
            className="pointer-events-none absolute top-0 left-0 overflow-visible"
          >
            {edgeSpecs.map((edge) => {
              const source = positionById.get(edge.source);
              const target = positionById.get(edge.target);
              if (!source || !target) return null;
              const isBranch = edge.routing === "bottom-left";
              const x1 = isBranch
                ? source.x + BRANCH_INSET
                : source.x + source.width;
              const y1 = isBranch
                ? source.y + source.height
                : source.y + source.height / 2;
              const x2 = target.x;
              const y2 = target.y + target.height / 2;
              // Both routes use the same reveal/pulse rendering. Branches sweep
              // vertically; pipeline S-curves retain their horizontal sweep.
              const midX = (x1 + x2) / 2;
              const d = isBranch
                ? bottomBranchPath(source, target)
                : `M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
              const vertical = isBranch && y1 !== y2;
              const clip: EdgeClip = {
                axis: vertical ? "y" : "x",
                start: vertical ? y1 : x1,
                end: vertical ? y2 : x2,
                crossStart:
                  Math.min(vertical ? x1 : y1, vertical ? x2 : y2) -
                  EDGE_CLIP_PADDING_PX,
                crossSize:
                  Math.abs(vertical ? x2 - x1 : y2 - y1) +
                  2 * EDGE_CLIP_PADDING_PX,
              };
              // An explicit `variant` wins; absent one, infer from the target —
              // dotted into anything that doesn't exist yet (a locked future step
              // or a "create one" affordance), solid into everything else — so
              // boards written before `variant` existed are unaffected.
              const isDotted =
                edge.variant !== undefined
                  ? edge.variant === "dotted"
                  : target.spec.kind === "futureStep" ||
                    target.spec.kind === "newItemCta";
              const drawDelay = reduceMotion ? 0 : entranceDelay(target.spec);
              // Both curves stay within their endpoint bounds. Padding also
              // protects the final horizontal stroke of a vertical branch.
              const revealClipId = `flowchart-edge-reveal-${canvasId}-${edge.id}`;
              const pulseClipId = `flowchart-edge-pulse-${canvasId}-${edge.id}`;
              const travelPadding = vertical ? EDGE_CLIP_PADDING_PX : 0;
              const revealStart =
                Math.min(clip.start, clip.end) - travelPadding;
              const revealLength =
                Math.abs(clip.end - clip.start) + 2 * travelPadding;
              return (
                <Fragment key={edge.id}>
                  {/* Reveals each solid connector toward its target on entrance —
                      a growing clip rect, not `pathLength`/`stroke-dasharray`
                      (see EdgePulse's comment for why: that trick breaks down
                      on a curved path in a way plain rect-clipping can't). */}
                  {!isDotted && (
                    <clipPath id={revealClipId}>
                      {reduceMotion ? (
                        <rect
                          {...(clip.axis === "x"
                            ? {
                                x: revealStart,
                                y: clip.crossStart,
                                width: revealLength,
                                height: clip.crossSize,
                              }
                            : {
                                x: clip.crossStart,
                                y: revealStart,
                                width: clip.crossSize,
                                height: revealLength,
                              })}
                        />
                      ) : (
                        <motion.rect
                          {...(clip.axis === "x"
                            ? { y: clip.crossStart, height: clip.crossSize }
                            : { x: clip.crossStart, width: clip.crossSize })}
                          initial={
                            clip.axis === "x"
                              ? { x: clip.start, width: 0 }
                              : { y: clip.start, height: 0 }
                          }
                          animate={
                            clip.axis === "x"
                              ? { x: revealStart, width: revealLength }
                              : { y: revealStart, height: revealLength }
                          }
                          transition={{
                            duration: ENTRANCE_EDGE_DURATION_S,
                            delay: drawDelay,
                          }}
                        />
                      )}
                    </clipPath>
                  )}
                  <motion.path
                    d={d}
                    fill="none"
                    className="stroke-(--border-default)"
                    strokeWidth={2}
                    // Stroke width and dash lengths are resolved against the
                    // screen CTM, so hairlines and the dotted pattern stay
                    // legible at fit scale instead of thinning to near-invisible.
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap={isDotted ? "round" : undefined}
                    strokeDasharray={isDotted ? DOTTED_PATTERN : undefined}
                    clipPath={isDotted ? undefined : `url(#${revealClipId})`}
                    // A step that doesn't exist yet shouldn't look like it's
                    // being built, so dotted edges merely fade in; solid
                    // connectors are always fully opaque and rely on the
                    // clip rect above for their draw-on reveal instead.
                    initial={
                      reduceMotion
                        ? false
                        : isDotted
                          ? { opacity: 0 }
                          : { opacity: 1 }
                    }
                    animate={{ opacity: 1 }}
                    // Delayed by the TARGET's slot with no node offset, so the
                    // line sets off first and the card lands as it arrives.
                    transition={{
                      duration: ENTRANCE_EDGE_DURATION_S,
                      delay: drawDelay,
                    }}
                  />
                  {/* Waits for its own line to have faded in; the per-edge
                      entrance delays then stagger the pulses for free. */}
                  {!isDotted && !reduceMotion && (
                    <EdgePulse
                      d={d}
                      clip={clip}
                      clipId={pulseClipId}
                      delay={drawDelay + ENTRANCE_EDGE_DURATION_S}
                    />
                  )}
                </Fragment>
              );
            })}
          </svg>

          {positioned.map(({ spec, x, y, width }) => {
            const NodeComponent = nodeTypes[spec.kind] as (props: {
              data: typeof spec.data;
              disableMotion?: boolean;
            }) => React.ReactElement;
            return (
              <motion.div
                key={spec.id}
                ref={getNodeRef(spec.id)}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  width,
                  // Growing from the left edge puts the card's origin where its
                  // connector arrives, which is what reads as "sprouted from".
                  transformOrigin: "left center",
                  willChange: "transform",
                }}
                // Only `transform`/`opacity` are animated. The per-node
                // ResizeObserver reads pre-transform layout space, so this
                // cannot feed back into computeLayout → fitScale and oscillate;
                // animating height/padding/margin here would.
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: ENTRANCE_SCALE_FROM,
                        // A node nothing points at — the first column — has
                        // nowhere to emerge from, so it just fades in place.
                        x: nodesWithParent.has(spec.id)
                          ? -ENTRANCE_SLIDE_PX
                          : 0,
                      }
                }
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{
                  ...springs.gentle,
                  delay: reduceMotion
                    ? 0
                    : entranceDelay(spec) + ENTRANCE_NODE_OFFSET_S,
                }}
              >
                <NodeComponent data={spec.data} disableMotion={disableMotion} />
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  },
);
FlowchartCanvas.displayName = "FlowchartCanvas";
