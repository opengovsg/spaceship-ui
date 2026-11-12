"use client";

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";

// ─── CVA ──────────────────────────────────────────────────────────────────────

/**
 * One shell for every canvas card kind — Figma's `CanvasCards` component has
 * no per-kind fill variant, just a single soft-depth shadow standing in for
 * a border (`--shadow-border`, already an exact match for the Figma effect).
 */
export const nodeFrameVariants = cva([
  "h-[200px] w-full box-border overflow-hidden rounded-(--radius-2xl) bg-(--bg-surface-primary) font-sans shadow-(--shadow-border)",
]);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface NodeFrameProps {
  title: string;
  /** Rendered on the right of the title row, e.g. a <StatusBadge>. Omit for the centered "not yet reachable" header. */
  badge?: ReactNode;
  /**
   * Multiple pills on the title row, e.g. `[BUILT]` + `[TESTED]`. Takes
   * precedence over `badge` when both are given.
   */
  badges?: ReactNode[];
  children: ReactNode;
  className?: string;
  titleClassName?: string;
}

// ─── NodeFrame ────────────────────────────────────────────────────────────────

/**
 * Card shell shared by flowchart nodes: a fixed 200px height and 46px title row — either
 * left-aligned with a status badge, or centered with none, via `titleClassName`
 * — over arbitrary content below. Any hover affordance over the content itself
 * (e.g. an edit CTA) belongs to that content's own component (see
 * `CardContentSlot`'s `hoverCta`) so it can be scoped to the content's own
 * box, not this shell's full-bleed children slot.
 */
export function NodeFrame({
  title,
  badge,
  badges,
  children,
  className,
  titleClassName,
}: NodeFrameProps) {
  return (
    <div className={cn(nodeFrameVariants(), className)}>
      <div className="flex h-[46px] items-center justify-between gap-3 px-4 pt-4 pb-2">
        <span
          className={cn(
            "min-w-0 truncate text-caption [font-weight:var(--font-weight-bold)] text-(--text-secondary) normal-case",
            titleClassName,
          )}
        >
          {title}
        </span>
        {badges && badges.length > 0 ? (
          <span className="flex shrink-0 items-center gap-1">
            {badges.map((item, index) => (
              <span key={index}>{item}</span>
            ))}
          </span>
        ) : (
          badge
        )}
      </div>
      {children}
    </div>
  );
}
