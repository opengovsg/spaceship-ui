"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "framer-motion";
import { springs, type SpringPreset } from "#/components/ds/lib/motion";
import { useSystemReducedMotion } from "./use-reduced-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResizeAxis = "width" | "height";

export interface PanelDragHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
}

export interface UseResizablePanelConfig {
  /** Which dimension the drag controls. */
  axis: ResizeAxis;
  /** Starting size in px, or "auto" to size to content until the first drag/nudge. */
  initial: number | "auto";
  min: number;
  /** Re-evaluated at drag start, on keyboard nudge, and whenever the container resizes. */
  getMax: () => number;
  /** Observed so the panel re-clamps if the surrounding layout shrinks mid-session. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Spring used only by `reset()` — live dragging is direct manipulation, no spring. */
  spring?: SpringPreset;
  /** When false, pointer/keyboard handlers are no-ops. Default true. */
  enabled?: boolean;
  /** OR'd with the user's system reduced-motion preference to gate `reset()`'s animation. */
  disableMotion?: boolean;
}

export interface UseResizablePanelReturn {
  panelRef: React.RefObject<HTMLDivElement | null>;
  size: MotionValue<number | string>;
  isDragging: React.RefObject<boolean>;
  handleProps: PanelDragHandlers;
  nudge: (delta: number) => void;
  setSize: (next: number) => void;
  reset: () => void;
  /** The exact subset of props `PanelResizeHandle` expects — spread it directly. */
  bindings: {
    axis: ResizeAxis;
    handleProps: PanelDragHandlers;
    valueMotion: MotionValue<number | string>;
    min: number;
    getMax: () => number;
    onNudge: (delta: number) => void;
    onReset: () => void;
    disabled: boolean;
  };
}

// ─── useResizablePanel ────────────────────────────────────────────────────────

/**
 * Drives one panel's explicit size (width or height) from a drag handle, while its
 * sibling stays `flex-1`/`min-h-0` and absorbs whatever remains. Unlike
 * `use-drag-resize` (built for a card expanding against a fixed ceiling, with a
 * snap-to-natural-or-max release), this panel is freely resizable within
 * `[min, max]` and simply stays wherever the user drops it — no snap-back.
 */
export function useResizablePanel({
  axis,
  initial,
  min,
  getMax,
  containerRef,
  spring = springs.snappy,
  enabled = true,
  disableMotion = false,
}: UseResizablePanelConfig): UseResizablePanelReturn {
  const panelRef = useRef<HTMLDivElement>(null);
  const size = useMotionValue<number | string>(initial);
  const isDragging = useRef(false);
  const startCoord = useRef(0);
  const dragStartSize = useRef(0);
  const maxAtDragStart = useRef(0);

  const reduceMotion = useSystemReducedMotion() || disableMotion;

  function measure() {
    const el = panelRef.current;
    if (!el) return 0;
    return axis === "width" ? el.offsetWidth : el.offsetHeight;
  }

  function resolveCurrent() {
    const current = size.get();
    return typeof current === "number" ? current : measure();
  }

  function resolveMax() {
    // Never invert the clamp range — on a short viewport getMax() can dip below
    // min, and Math.min/Math.max on an inverted range silently produces garbage.
    return Math.max(min, getMax());
  }

  function clampTo(value: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  // ── Container re-clamp ──────────────────────────────────────────────────────
  // Without this, dragging a panel large and then shrinking the window (or its
  // sibling growing) would leave the other panel permanently crushed — nothing
  // else re-evaluates the ceiling once a drag ends.
  //
  // Deliberately no dependency array: `containerRef` is a stable `useRef`
  // object, so keying off it would only attach once. When the container mounts
  // conditionally (e.g. an artifacts column that only appears once the officer
  // has answered enough to have artifacts), `.current` is still null on that
  // first pass — running after every render lets the very next render pick up
  // the real node once it exists, self-healing instead of observing nothing.
  useEffect(() => {
    const target = containerRef?.current;
    if (!target) return;

    const reclamp = () => {
      const current = size.get();
      if (typeof current !== "number") return;
      const clamped = clampTo(current, resolveMax());
      if (clamped !== current) size.set(clamped);
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(reclamp);
      observer.observe(target);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
  });

  // ── Pointer drag ─────────────────────────────────────────────────────────────

  function endDrag() {
    if (!enabled || !isDragging.current) return;
    isDragging.current = false;
    if (panelRef.current) panelRef.current.style.willChange = "";
  }

  const handleProps: PanelDragHandlers = {
    onPointerDown(e) {
      if (!enabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      // Suppresses text selection in the neighbouring prose panels for the
      // duration of the drag.
      e.preventDefault();
      isDragging.current = true;
      startCoord.current = axis === "width" ? e.clientX : e.clientY;
      // First interaction on an "auto" panel measures its current rendered size
      // once and uses that as the drag baseline — from here the panel is
      // user-controlled and never reverts to "auto" except via reset().
      dragStartSize.current = resolveCurrent();
      maxAtDragStart.current = resolveMax();
      size.set(clampTo(dragStartSize.current, maxAtDragStart.current));
      // Toggled only for the drag's duration — see the perf note in
      // panel-resize-handle.tsx for why this isn't a permanent style prop.
      if (panelRef.current) panelRef.current.style.willChange = axis;
    },
    onPointerMove(e) {
      if (!enabled || !isDragging.current) return;
      const coord = axis === "width" ? e.clientX : e.clientY;
      const delta = coord - startCoord.current;
      size.set(clampTo(dragStartSize.current + delta, maxAtDragStart.current));
    },
    // Fires on a normal release. No spring/snap — the size stays exactly where
    // the pointer let go.
    onPointerUp: endDrag,
    // Fires when the pointer stream is interrupted (browser gesture, context
    // menu, touch cancel) instead of a normal release. Without this,
    // isDragging would stay true forever.
    onPointerCancel: endDrag,
  };

  // ── Keyboard + reset ─────────────────────────────────────────────────────────

  function nudge(delta: number) {
    if (!enabled) return;
    size.set(clampTo(resolveCurrent() + delta, resolveMax()));
  }

  function setSize(next: number) {
    if (!enabled) return;
    size.set(clampTo(next, resolveMax()));
  }

  function reset() {
    if (!enabled) return;
    if (initial !== "auto") {
      if (reduceMotion) size.set(initial);
      else void animate(size, initial, spring);
      return;
    }

    // Replay use-drag-resize's animateToContent trick: measure the natural
    // content size, then animate to it and land back on "auto" so the panel
    // resumes tracking content growth afterwards.
    const el = panelRef.current;
    if (!el) {
      size.set("auto");
      return;
    }
    const property = axis === "width" ? "width" : "height";
    const prevStyle = el.style[property];
    el.style[property] = "auto";
    const natural = measure();
    el.style[property] = prevStyle;

    if (reduceMotion) {
      size.set("auto");
      return;
    }
    void animate(size, natural, spring).then(() => size.set("auto"));
  }

  return {
    panelRef,
    size,
    isDragging,
    handleProps,
    nudge,
    setSize,
    reset,
    bindings: {
      axis,
      handleProps,
      valueMotion: size,
      min,
      getMax,
      onNudge: nudge,
      onReset: reset,
      disabled: !enabled,
    },
  };
}
