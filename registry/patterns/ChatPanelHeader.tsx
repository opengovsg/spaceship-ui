"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "#/components/ds/ui";
import { cn } from "#/components/ds/lib/classnames";

export interface ChatPanelHeaderProps {
  /** Rendered in Sora + sentence case and centred, e.g. `PROBLEM CRAFTER`. */
  title: string;
  /** Renders a left-arrow button before the title that returns to the canvas. */
  onCollapse?: () => void;
  /** Right-aligned slot for additional actions. */
  actions?: ReactNode;
  className?: string;
}

/**
 * The static counterpart to `EditableTitle`. The proposer flow names its chat
 * surfaces after the agent doing the work (`PROBLEM CRAFTER`, `PROTOTYPE
 * REFINER`), which the user does not rename, so there is nothing to edit.
 */
export function ChatPanelHeader({
  title,
  onCollapse,
  actions,
  className,
}: ChatPanelHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-2 pb-2", className)}
    >
      {/*
        Reference pattern for small shadow-surface icon buttons in this flow:
        pass the glyph via `icon=`, never as `children` — only `icon` /
        `leadingIcon` / `trailingIcon` route through Button's `IconSlot`,
        which is what applies the size-appropriate `[&>svg]` sizing (14px at
        icon-sm). Bare children skip that and render lucide's 24px default
        inside the 32px button. `EditableTitle` and `ProposerShell`'s own
        toggle button already follow this — match them here.
      */}
      <div className="flex w-8 shrink-0 justify-start">
        {onCollapse && (
          <Button
            variant="secondary"
            surface="ghost"
            size="icon"
            icon={<ArrowLeft />}
            aria-label="Return to project"
            tooltip="Return to project"
            onClick={onCollapse}
          />
        )}
      </div>

      <h2 className="min-w-0 truncate text-center font-sans normal-case text-body [font-weight:var(--font-weight-semibold)] text-(--text-secondary)">
        {title}
      </h2>

      <div className="flex min-w-8 shrink-0 items-center justify-end gap-1">
        {actions}
      </div>
    </div>
  );
}
