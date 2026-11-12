"use client";

import { type ReactNode } from "react";
import { cn } from "#/components/ds/lib/classnames";

interface PageFrameProps {
  /** Whether the adjacent sidebar is open. Geometry stays constant in both states. */
  isFramed: boolean;
  /** @deprecated The flush workspace does not animate its geometry. */
  disableMotion?: boolean;
  /** Whether to show the subtle boundary around the workspace. */
  showBoundary?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Stable, edge-to-edge workspace. Inner content owns scrolling and its fades. */
export function PageFrame({
  className,
  children,
  showBoundary = true,
}: PageFrameProps) {
  return (
    <div
      className={cn(
        "relative h-full min-w-0 flex-1 box-border rounded-tl-xl",
        showBoundary &&
          "before:pointer-events-none before:absolute before:inset-0 before:z-41 before:rounded-[inherit] before:shadow-(--shadow-border) before:content-['']",
      )}
    >
      <div
        className={cn(
          "relative h-full min-w-0 overflow-hidden rounded-[inherit] bg-(--bg-surface-subtle)",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
