"use client";

import { useRef } from "react";
import { useMotionValue, animate, type MotionValue } from "framer-motion";
import { springs, type SpringPreset } from "#/components/ds/lib/motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseDragResizeConfig {
  /** Max height as a fraction of viewport height. Default 0.85. */
  maxHeightRatio?: number;
  /**
   * Caps the card's natural (content) height on initial mount and after content changes.
   * Drag-to-expand still allows growing beyond this value.
   * Useful when content may be taller than the desired default view.
   * Pass a function when the cap depends on measured DOM (e.g. an inner actions block).
   */
  maxNaturalHeight?: number | (() => number);
  /**
   * Called at drag start to compute the max allowed height dynamically.
   * Takes precedence over maxHeightRatio when provided.
   * Use this when the ceiling is determined by surrounding layout (e.g. a sticky header).
   */
  getMaxHeight?: () => number;
  /** Spring transition for snap animations. Default: springs.snappy (zero bounce). */
  spring?: SpringPreset;
  /** Whether drag is enabled. When false, pointer handlers are no-ops. Default true. */
  enabled?: boolean;
  /** When true, skips the spring animation in animateToContent. */
  disableMotion?: boolean;
}

export interface UseDragResizeReturn {
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardHeight: MotionValue<number | string>;
  /** Whether a drag is currently in progress — read in animateToContent to suppress transitions. */
  isDragging: React.RefObject<boolean>;
  /** Spread onto the drag handle touch-target element. */
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
  };
  /**
   * Animate the card to its natural content height.
   * Call from a useLayoutEffect whenever content changes.
   * Suppressed automatically when a drag is in progress.
   */
  animateToContent: () => void;
}

// ─── useDragResize ────────────────────────────────────────────────────────────

export function useDragResize({
  maxHeightRatio = 0.85,
  maxNaturalHeight,
  getMaxHeight,
  spring = springs.snappy,
  enabled = true,
  disableMotion = false,
}: UseDragResizeConfig = {}): UseDragResizeReturn {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardH = useMotionValue<number | string>("auto");
  const naturalH = useRef(0);
  const maxH = useRef(0);
  const dragStartH = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const prevContentH = useRef(0);

  function animateToContent() {
    if (isDragging.current) return;
    const el = cardRef.current;
    if (!el) return;

    const currentStyle = el.style.height;
    el.style.height = "auto";
    const newH = el.offsetHeight;
    const ceiling = getMaxHeight
      ? getMaxHeight()
      : window.innerHeight * maxHeightRatio;
    const naturalCap =
      typeof maxNaturalHeight === "function"
        ? maxNaturalHeight()
        : maxNaturalHeight;
    const cappedH = Math.min(
      newH,
      ceiling,
      ...(naturalCap ? [naturalCap] : []),
    );

    const oldH = prevContentH.current;
    prevContentH.current = cappedH;
    naturalH.current = cappedH;

    if (oldH === 0) {
      // Initial render — record height, restore, no animation.
      // If content exceeds the cap (maxNaturalHeight or viewport ceiling), freeze at cappedH.
      if (newH > cappedH) {
        el.style.height = `${cappedH}px`;
        cardH.set(cappedH);
      } else {
        el.style.height = currentStyle;
      }
      return;
    }

    if (!disableMotion && Math.abs(oldH - cappedH) > 2) {
      // Freeze at old height before paint, then spring to new height.
      el.style.height = `${oldH}px`;
      cardH.set(oldH);
      void animate(cardH, cappedH, spring).then(() => {
        if (cappedH === naturalH.current) cardH.set("auto");
      });
    } else {
      el.style.height = currentStyle;
    }
  }

  const handleProps = {
    onPointerDown(e: React.PointerEvent) {
      if (!enabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDragging.current = true;
      startY.current = e.clientY;
      dragStartH.current = cardRef.current?.offsetHeight ?? 0;
      // Only update naturalH when at auto height; when expanded, offsetHeight === scrollHeight.
      if (cardH.get() === "auto") naturalH.current = dragStartH.current;
      maxH.current = getMaxHeight
        ? getMaxHeight()
        : window.innerHeight * maxHeightRatio;
      cardH.set(dragStartH.current);
    },
    onPointerMove(e: React.PointerEvent) {
      if (!enabled || !isDragging.current) return;
      const dy = startY.current - e.clientY; // positive = dragged up = expand
      const floor = Math.min(naturalH.current, maxH.current);
      const newH = Math.max(
        floor,
        Math.min(maxH.current, dragStartH.current + dy),
      );
      cardH.set(newH);
    },
    onPointerUp: handlePointerEnd,
    // Fires when the pointer stream is interrupted (browser gesture, context menu,
    // touch cancel) instead of a normal release. Without this, isDragging would stay
    // true forever and permanently no-op animateToContent().
    onPointerCancel: handlePointerEnd,
  };

  function handlePointerEnd() {
    if (!enabled || !isDragging.current) return;
    isDragging.current = false;
    const h = cardH.get() as number;
    const snapFull = h > (maxH.current + naturalH.current) / 2;
    const target = snapFull ? maxH.current : naturalH.current;
    // Keep animateToContent()'s "did content actually change size" comparison
    // honest — without this, the next content change can see the pre-drag
    // height as "unchanged" and silently restore this drag's stale pixel
    // value instead of sizing to the new content.
    prevContentH.current = target;
    void animate(cardH, target, spring).then(() => {
      if (!snapFull) cardH.set("auto");
    });
  }

  return {
    cardRef,
    cardHeight: cardH,
    isDragging,
    handleProps,
    animateToContent,
  };
}
