"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { PanelResizeHandle } from "#/components/ds/ui";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

export interface TwoColumnLayoutProps {
  left: ReactNode;
  /**
   * The right column. Pass `null` (or omit) to render only `left`, centered
   * and widened to `soloMaxWidth`. Once a value is provided, the divider and
   * right column animate in and the layout settles into the normal
   * draggable split.
   */
  right?: ReactNode | null;
  /**
   * Initial width of the left column, as a percentage of the container.
   * @default 35
   */
  defaultLeftWidthPercent?: number;
  /**
   * Minimum width either column can be dragged to, as a percentage of the container.
   * @default 20
   */
  minWidthPercent?: number;
  /**
   * Minimum width of the left column in pixels. Takes priority over
   * `minWidthPercent` whenever the container is narrow enough that the
   * percentage-based minimum would compute to less than this — use it to
   * keep the left column from being dragged below content with its own
   * hard min-width (e.g. the chat input's `--sizing-chat-min`).
   */
  minLeftWidthPx?: number;
  /**
   * Max width of the centered `left` column while `right` is absent.
   * @default "42rem"
   */
  soloMaxWidth?: string;
  /** Place the resize grip on the artifact pane's edge without adding a gutter. */
  dividerAppearance?: "grip" | "border";
  disableMotion?: boolean;
  className?: string;
}

/**
 * Two-column layout with a draggable divider between the columns. Widths are
 * tracked as a percentage of the container so the split holds steady across
 * window resizes. When `right` is absent, `left` renders alone, centered and
 * widened — useful for a flow that starts single-column and grows a second
 * column once it has content to show.
 */
export function TwoColumnLayout({
  left,
  right,
  defaultLeftWidthPercent = 35,
  minWidthPercent = 20,
  minLeftWidthPx,
  soloMaxWidth = "42rem",
  dividerAppearance = "grip",
  disableMotion = false,
  className,
}: TwoColumnLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const capturedPointer = useRef<{
    target: Element;
    pointerId: number;
    userSelect: string;
    cursor: string;
  } | null>(null);
  const leftWidthPercent = useMotionValue<number | string>(
    defaultLeftWidthPercent,
  );
  const leftWidth = useTransform(leftWidthPercent, (percent) => `${percent}%`);
  const hasRight = right != null;

  const minLeftPercent = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !minLeftWidthPx) return minWidthPercent;
    return Math.max(minWidthPercent, (minLeftWidthPx / rect.width) * 100);
  };

  const clampLeftPercent = (percent: number) =>
    Math.min(100 - minWidthPercent, Math.max(minLeftPercent(), percent));

  // Without this, leftWidthPercent only gets clamped inside pointer handlers
  // — so a container that starts (or is resized) narrower than the minimum
  // renders under-width until the next drag, which then visibly snaps to the
  // floor. Reclamping on mount and on every container resize keeps the value
  // valid proactively instead of reactively.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasRight) return;

    const reclamp = () => {
      const current = leftWidthPercent.get();
      const currentPercent =
        typeof current === "number" ? current : defaultLeftWidthPercent;
      leftWidthPercent.set(clampLeftPercent(currentPercent));
    };

    reclamp();
    const observer = new ResizeObserver(reclamp);
    observer.observe(container);
    return () => observer.disconnect();
  }, [hasRight, minWidthPercent, minLeftWidthPx, defaultLeftWidthPercent]);

  // Pointer capture (set below) redirects subsequent pointermove/pointerup
  // events for this pointerId to the handle itself, so no document listeners
  // are needed — same idiom as `useResizablePanel`'s handleProps.
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !e.isPrimary) return;
    e.preventDefault();
    handlePointerEnd();
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.focus();
    capturedPointer.current = {
      target: e.currentTarget,
      pointerId: e.pointerId,
      userSelect: document.body.style.userSelect,
      cursor: document.body.style.cursor,
    };
    setIsResizing(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (
      !isResizing ||
      !container ||
      capturedPointer.current?.pointerId !== e.pointerId
    )
      return;
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      handlePointerEnd();
      return;
    }
    const rect = container.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    // Set directly on the motion value — no React re-render per pointermove,
    // so the panel tracks the cursor instead of chasing a layout animation.
    leftWidthPercent.set(clampLeftPercent(percent));
  };

  const handlePointerEnd = useCallback(() => {
    const capture = capturedPointer.current;
    capturedPointer.current = null;
    setIsResizing(false);
    if (!capture) return;
    if (capture.target.hasPointerCapture(capture.pointerId)) {
      capture.target.releasePointerCapture(capture.pointerId);
    }
    document.body.style.userSelect = capture.userSelect;
    document.body.style.cursor = capture.cursor;
  }, []);

  useEffect(() => handlePointerEnd, [handlePointerEnd, hasRight]);

  const handleNudge = (deltaPx: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const current = leftWidthPercent.get();
    const currentPercent = typeof current === "number" ? current : 0;
    const deltaPercent = (deltaPx / rect.width) * 100;
    leftWidthPercent.set(clampLeftPercent(currentPercent + deltaPercent));
  };

  const handleReset = () => {
    leftWidthPercent.set(clampLeftPercent(defaultLeftWidthPercent));
  };

  const leftTransition = disableMotion ? { duration: 0 } : springs.gentle;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full w-full",
        dividerAppearance === "border" && "isolate",
        !hasRight && "justify-center",
        className,
      )}
    >
      <motion.div
        layout={!isResizing}
        transition={leftTransition}
        // `min-h-0` keeps this column pinned at the container's own height
        // instead of growing to fit `left`'s content. Assumes `left` manages
        // its own internal scrolling if its content can overflow vertically
        // (e.g. a chat panel's message list) — this wrapper only needs to
        // stop being stretched taller by it.
        className={cn(
          "h-full min-w-0 min-h-0",
          dividerAppearance === "border" && "relative z-0",
        )}
        style={
          hasRight
            ? { width: leftWidth }
            : { width: "100%", maxWidth: soloMaxWidth }
        }
      >
        {left}
      </motion.div>

      <AnimatePresence>
        {hasRight
          ? [
              <motion.div
                key="divider"
                initial={disableMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={disableMotion ? undefined : { opacity: 0 }}
                transition={leftTransition}
                // The right column's own `px-1.5` padding (see below) pushes
                // its visible content 6px further from the divider than the
                // left column's edge, so the grip reads as off-center toward
                // the left. Nudge it right to compensate.
                // Border-mode panes contain their own stacking layers, keeping
                // preview overlays below the divider's centered resize target.
                className={
                  dividerAppearance === "border"
                    ? "relative z-10 h-full w-0 shrink-0"
                    : "h-full shrink-0 translate-x-1"
                }
              >
                <PanelResizeHandle
                  axis="width"
                  label="Resize columns"
                  className={
                    dividerAppearance === "border"
                      ? "absolute -left-2 top-0 h-full before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-(--border-subtle) hover:before:bg-(--border-brand-default) focus-visible:before:bg-(--border-brand-default) [&>span]:relative"
                      : undefined
                  }
                  valueMotion={leftWidthPercent}
                  min={minWidthPercent}
                  getMax={() => 100 - minWidthPercent}
                  onNudge={handleNudge}
                  onReset={handleReset}
                  disableMotion={disableMotion}
                  handleProps={{
                    onPointerDown: handlePointerDown,
                    onPointerMove: handlePointerMove,
                    onPointerUp: handlePointerEnd,
                    onPointerCancel: handlePointerEnd,
                  }}
                />
              </motion.div>,
              <motion.div
                key="right"
                layout={!isResizing}
                initial={disableMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={disableMotion ? undefined : { opacity: 0, x: 24 }}
                transition={leftTransition}
                // `min-h-0` stops this column from being stretched by
                // `right`'s content on a short viewport; `overflow-y-auto`
                // then lets that content scroll within the column's own
                // bounds instead of the overflow bubbling up to a page-level
                // scroll container (which would drag the full-height `left`
                // column along with it).
                //
                // Setting `overflow-y` forces `overflow-x` to compute to
                // `auto` too (per the CSS overflow spec), so this column
                // clips right at its own edges — cutting off the
                // `--shadow-border` box-shadow "border" (see Card.tsx) that
                // bleeds a few px outside a Card's box on all sides.
                // `px-1.5`/`pt-1.5` (6px) gives that shadow room to render in
                // full; `pb-0.5` (2px) covers the bottom edge.
                className={cn(
                  "h-full min-w-0 min-h-0 flex-1 overflow-y-auto",
                  dividerAppearance === "border" && "relative z-0",
                  dividerAppearance === "grip" && "px-1.5 pt-1.5 pb-0.5",
                )}
              >
                {right}
              </motion.div>,
            ]
          : null}
      </AnimatePresence>
    </div>
  );
}
