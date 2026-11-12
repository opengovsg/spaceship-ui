"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, Lock, Pencil } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import type { CardContentState, NodeHoverCta } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CardContentSlotProps {
  state: CardContentState;
  /** `filled` — the document's heading. Ignored when `children` is given. */
  documentTitle?: string;
  /** `filled` — body copy, faded out at the bottom rather than truncated. Ignored when `children` is given. */
  documentBody?: string;
  /** `locked` and `cta` — the single line of copy. */
  label?: string;
  /** Overrides the state's default icon (`Lock` for locked, `Pencil` for cta). */
  icon?: ReactNode;
  /** `cta` — makes the slot a button. */
  onClick?: () => void;
  /** `filled` — reveals the shared Open affordance; callback may open an editor. */
  onEdit?: () => void;
  /**
   * `filled` — reveals a frosted-glass hover CTA over the content box, with
   * the shared Open icon/label. The supplied label names the button for assistive technology. Scoped to this
   * box (not the outer card shell), so its margins match the content it's
   * editing/viewing. Takes precedence over `onEdit` if both are given.
   */
  hoverCta?: NodeHoverCta;
  /**
   * `filled` — arbitrary content in place of `documentTitle`/`documentBody`,
   * e.g. a structured lead/body line list. Gets the identical box (padding,
   * radius, border, background) either way.
   */
  children?: ReactNode;
  className?: string;
}

// ─── CardContentSlot ──────────────────────────────────────────────────────────

/**
 * The body of a canvas card, in the three states the board uses: not yet
 * reachable (`locked`), an invitation to create (`cta`), or a document preview
 * (`filled`) — optionally with a hover affordance to edit it.
 *
 * Extracted so every node kind renders these identically; the difference between
 * a problem card and a prototype card is the header, not the body. Every state
 * shares the same 8px gap between the card's outer edge and its own box —
 * matching the Figma `Card Content` component, which wraps every variant in
 * that padding rather than baking it into the outer card shell.
 */
export function CardContentSlot({
  state,
  documentTitle,
  documentBody,
  label,
  icon,
  onClick,
  onEdit,
  hoverCta,
  children,
  className,
}: CardContentSlotProps) {
  const cta: NodeHoverCta | undefined =
    hoverCta ??
    (onEdit ? { icon: <Pencil />, label: "Edit", onClick: onEdit } : undefined);
  if (state === "locked") {
    return (
      <div className={cn("p-2", className)}>
        <div className="flex h-[138px] w-full flex-col items-center justify-center gap-3 rounded-(--radius-lg) border border-dashed border-(--border-default) bg-(--bg-surface-brand-subtle) text-(--text-placeholder)">
          <span
            aria-hidden
            className="inline-flex shrink-0 items-center justify-center [&>svg]:size-5"
          >
            {icon ?? <Lock />}
          </span>
          {label && (
            <span className="px-4 text-center text-caption">{label}</span>
          )}
        </div>
      </div>
    );
  }

  if (state === "cta") {
    return (
      <div className={cn("p-2", className)}>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex h-[138px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-(--radius-lg) border border-dashed p-4",
            "border-(--border-brand-default) bg-(--bg-surface-brand-subtle) text-(--text-interactive-primary)",
            "transition-colors duration-(--duration-base) ease-(--ease-in-out)",
            // Figma's hover/pressed border is a darker blue with no matching
            // semantic token yet — only the fill deepens across states.
            "hover:bg-(--bg-interactive-primary-subtle-hover)",
            "active:bg-(--bg-interactive-primary-subtle-pressed)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
          )}
        >
          <span
            aria-hidden
            className="inline-flex shrink-0 items-center justify-center [&>svg]:size-5"
          >
            {icon ?? <Pencil />}
          </span>
          {label && <span className="text-center text-caption">{label}</span>}
        </button>
      </div>
    );
  }

  return (
    <div className={cn("p-2", className)}>
      <div className="group relative h-[138px] overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--bg-surface-base) p-4">
        {/* Fixed viewport keeps short and long previews the same size. */}
        <div className="h-[104px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent_100%)]">
          {children ?? (
            <>
              {documentTitle && (
                <p className="m-0 mb-1.5 text-caption [font-weight:var(--font-weight-bold)] text-(--text-primary)">
                  {documentTitle}
                </p>
              )}
              {documentBody && (
                <p className="m-0 text-caption text-(--text-tertiary)">
                  {documentBody}
                </p>
              )}
            </>
          )}
        </div>

        {cta && (
          <button
            type="button"
            onClick={cta.onClick}
            aria-label={`Open: ${cta.label}`}
            className={cn(
              "absolute inset-0 flex cursor-pointer items-center justify-center gap-1.5",
              "rounded-(--radius-lg) border border-dashed border-(--border-brand-subtle)",
              "bg-(--bg-surface-primary)/75 text-(--text-interactive-primary) opacity-0 backdrop-blur-[10px]",
              "transition-opacity duration-(--duration-fast) ease-(--ease-in-out)",
              "group-hover:opacity-100 focus-visible:opacity-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
            )}
          >
            <span
              aria-hidden
              className="inline-flex shrink-0 [&>svg]:h-5 [&>svg]:w-5"
            >
              <ArrowUpRight strokeWidth={1.5} />
            </span>
            <span className="text-caption">Open</span>
          </button>
        )}
      </div>
    </div>
  );
}
