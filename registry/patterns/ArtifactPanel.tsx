"use client";

import { type ReactNode } from "react";
import { cn } from "#/components/ds/lib/classnames";
import { ScrollFade } from "#/components/ds/ui";

export interface ArtifactPanelProps {
  /** Rendered in Sora + sentence case, e.g. `PROBLEM STATEMENT`. Omit for tabs with no title (e.g. the
   *  Prototype Refiner's Impl-Plan/Prototype/Testing tabs). */
  title?: string;
  /** Header slot. `headerAlign` decides whether it sits opposite the title or right after it. */
  headerActions?: ReactNode;
  /** `"split"` (default) keeps the title left / actions right layout. `"start"` left-aligns
   *  everything — the Prototype Refiner tabs that have actions but no title. */
  headerAlign?: "split" | "start";
  /** Override for the header row's own classes (e.g. padding). */
  headerClassName?: string;
  /** Override for the title `<h2>`'s classes. */
  titleClassName?: string;
  /** Full-width row rendered under the header, above the scrollable body — e.g. the Prototype
   *  tab's URL bar. Sits on the shell background, not inside the inner content card. */
  headerBelow?: ReactNode;
  /** `"plain"` (default) presents a full document. `"card"` is retained for
   *  callers that explicitly need a separate inner card. */
  contentSurface?: "card" | "plain";
  /** Override for the inner card's classes when `contentSurface="card"`. */
  contentClassName?: string;
  /** Pinned below the scroll area. The proposer flow puts its gate bar here. */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Retained for caller compatibility; scroll fades follow the viewport without animation. */
  disableMotion?: boolean;
}

/**
 * The shell every artifact in the proposer flow is presented in — problem
 * statement, rubrics, implementation plan, report. It owns the frame, the
 * header row and the scroll boundary; the artifact itself is `children`.
 *
 * The header uses its own surface above a divider; the body
 * owns scrolling. Documents use one continuous surface without a nested card.
 */
export function ArtifactPanel({
  title,
  headerActions,
  headerAlign = "split",
  headerClassName,
  titleClassName,
  headerBelow,
  contentSurface = "plain",
  contentClassName,
  footer,
  children,
  className,
}: ArtifactPanelProps) {
  const hasHeader = Boolean(title || headerActions || headerBelow);
  return (
    <div
      className={cn(
        "flex size-full min-h-0 min-w-0 flex-col overflow-clip rounded-(--radius-inner)",
        "bg-(--bg-surface-base) shadow-(--shadow-border)",
        className,
      )}
    >
      {hasHeader && (
        <div className="flex shrink-0 flex-col gap-2 border-b border-(--border-subtle) bg-(--bg-artifact-header)">
          {(title || headerActions) && (
            <div
              className={cn(
                "flex flex-wrap items-center gap-3",
                headerAlign === "split" ? "justify-between" : "justify-start",
                headerClassName ?? "min-h-14 px-4 py-2",
              )}
            >
              {title && (
                <h2
                  className={cn(
                    "font-sans normal-case text-body [font-weight:var(--font-weight-semibold)] text-(--text-secondary)",
                    titleClassName,
                  )}
                >
                  {title}
                </h2>
              )}
              {headerActions && (
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  {headerActions}
                </div>
              )}
            </div>
          )}
          {headerBelow && <div className="px-4 pb-3">{headerBelow}</div>}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <ScrollFade
          className={cn(
            "min-h-0 flex-1",
            contentSurface === "card" &&
              "rounded-(--radius-inner) bg-(--bg-surface-base) shadow-(--shadow-border)",
          )}
          viewportClassName={cn(
            "p-4",
            contentSurface === "card" && "rounded-(--radius-inner)",
          )}
          contentClassName={cn("h-full min-h-max", contentClassName)}
        >
          {children}
        </ScrollFade>

        {footer && (
          <div className="shrink-0 border-t border-(--border-subtle) p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
