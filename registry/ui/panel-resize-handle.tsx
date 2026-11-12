"use client";

import { useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { type MotionValue } from "framer-motion";
import { cn } from "#/components/ds/lib/classnames";
import type { PanelDragHandlers, ResizeAxis } from "./use-resizable-panel";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PanelResizeHandleProps {
  /** Which dimension the drag changes. Drives cursor, bar orientation, and ARIA. */
  axis: ResizeAxis;
  /** Accessible name — required, there is no visible text on a bare divider. */
  label: string;
  handleProps?: PanelDragHandlers;
  /** Live size source for aria-valuenow. Subscribed imperatively — never re-renders. */
  valueMotion?: MotionValue<number | string>;
  min?: number;
  getMax?: () => number;
  onNudge?: (delta: number) => void;
  onReset?: () => void;
  disabled?: boolean;
  surface?: "default" | "shadow-border";
  disableMotion?: boolean;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP = 16;
const SHIFT_STEP = 64;

/**
 * aria-orientation describes the separator BAR, not the dimension it resizes —
 * a width-resizer draws as a vertical bar, a height-resizer as a horizontal one.
 */
const ARIA_ORIENTATION: Record<ResizeAxis, "vertical" | "horizontal"> = {
  width: "vertical",
  height: "horizontal",
};

const ARROW_KEYS: Record<ResizeAxis, { increase: string; decrease: string }> = {
  width: { increase: "ArrowRight", decrease: "ArrowLeft" },
  height: { increase: "ArrowDown", decrease: "ArrowUp" },
};

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const panelResizeHandleVariants = cva(
  [
    "group relative flex shrink-0 items-center justify-center select-none touch-none",
    "rounded-sm focus-visible:outline-none",
  ],
  {
    variants: {
      axis: {
        width: "h-full w-4 cursor-col-resize",
        height: "h-4 w-full cursor-row-resize",
      },
      disabled: {
        true: "pointer-events-none cursor-default opacity-50",
        false: "",
      },
    },
    defaultVariants: { axis: "width", disabled: false },
  },
);

const gripVariants = cva(
  [
    "rounded-full bg-(--bg-resize-handle)",
    "group-hover:bg-(--bg-resize-handle-hover) group-focus-visible:bg-(--bg-resize-handle-hover)",
    "group-active:bg-(--bg-resize-handle-pressed)",
  ],
  {
    variants: {
      axis: {
        width: "h-8 w-1 group-hover:w-1.5 group-active:w-1.5",
        height: "h-1 w-8 group-hover:h-1.5 group-active:h-1.5",
      },
      surface: {
        default: "",
        "shadow-border": "shadow-(--shadow-border)",
      },
      disableMotion: {
        true: "",
        false:
          "transition-[background-color,width,height] duration-(--duration-fast) ease-(--ease-in-out)",
      },
    },
    compoundVariants: [
      {
        axis: "width",
        surface: "shadow-border",
        className: "w-1.5 group-hover:w-2 group-active:w-2",
      },
      {
        axis: "height",
        surface: "shadow-border",
        className: "h-1.5 group-hover:h-2 group-active:h-2",
      },
    ],
    defaultVariants: {
      axis: "width",
      surface: "default",
      disableMotion: false,
    },
  },
);

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A draggable divider between two panels — spread a `useResizablePanel` hook's
 * `bindings` onto this to wire it up. Every prop is independently optional so it
 * also renders standalone with static props (see the Storybook stories).
 *
 * Deliberately not a full-length line with a leading icon: both flanking panels
 * already carry `shadow-(--shadow-border)`, so a persistent rule would be a third
 * boundary crammed into a 16px gutter. Instead this reuses the pill-grip
 * convention from `approval-card.tsx`, rotated per axis and quiet until touched.
 */
export function PanelResizeHandle({
  axis,
  label,
  handleProps,
  valueMotion,
  min,
  getMax,
  onNudge,
  onReset,
  disabled = false,
  surface = "default",
  disableMotion = false,
  className,
}: PanelResizeHandleProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // aria-valuenow is written imperatively via the MotionValue subscription,
  // never through React state — piping it through useState here would re-render
  // both flanking panels on every pointermove frame, defeating the entire reason
  // the hook uses a MotionValue in the first place.
  useEffect(() => {
    if (!valueMotion) return;
    const write = (value: number | string) => {
      if (typeof value === "number") {
        rootRef.current?.setAttribute(
          "aria-valuenow",
          String(Math.round(value)),
        );
      } else {
        rootRef.current?.removeAttribute("aria-valuenow");
      }
    };
    write(valueMotion.get());
    return valueMotion.on("change", write);
  }, [valueMotion]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled || !onNudge) return;
    const keys = ARROW_KEYS[axis];
    const step = e.shiftKey ? SHIFT_STEP : STEP;

    if (e.key === keys.increase) {
      e.preventDefault();
      onNudge(step);
    } else if (e.key === keys.decrease) {
      e.preventDefault();
      onNudge(-step);
    } else if (e.key === "Home") {
      e.preventDefault();
      onNudge(-Infinity); // clamped to min by the hook
    } else if (e.key === "End") {
      e.preventDefault();
      onNudge(Infinity); // clamped to max by the hook
    }
  }

  // getMax() often reads a container ref (e.g. the artifacts column) that
  // hasn't committed to the DOM yet during the render that first evaluates
  // this prop — calling it synchronously in JSX would read a 0-height
  // container and permanently under-report aria-valuemax until some
  // unrelated re-render happens to refresh it. Recomputing in an effect runs
  // after commit, when every ref in this pass is guaranteed attached, so the
  // very first paint already reports the real ceiling.
  const [resolvedMax, setResolvedMax] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!getMax) {
      setResolvedMax(undefined);
      return;
    }
    // Floor to min the same way the hook's own resolveMax() does, so this is
    // never an invalid, inverted range even before layout has settled.
    setResolvedMax(min !== undefined ? Math.max(min, getMax()) : getMax());
  }, [getMax, min]);

  return (
    <div
      ref={rootRef}
      role="separator"
      aria-label={label}
      aria-orientation={ARIA_ORIENTATION[axis]}
      aria-valuemin={min}
      aria-valuemax={resolvedMax || undefined}
      tabIndex={disabled ? -1 : 0}
      className={cn(panelResizeHandleVariants({ axis, disabled }), className)}
      onKeyDown={handleKeyDown}
      onDoubleClick={disabled ? undefined : onReset}
      {...handleProps}
    >
      <span
        aria-hidden
        className={gripVariants({ axis, surface, disableMotion })}
      />
    </div>
  );
}
