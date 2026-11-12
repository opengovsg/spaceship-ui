"use client";

import { useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import { Button } from "./button";
import {
  clarificationCardVariants,
  type ClarificationCardBaseProps,
} from "./clarification-card-shared";
import { useDragResize } from "./use-drag-resize";

export interface SolutionBriefCardProps extends ClarificationCardBaseProps {
  /** Seeds the editable textarea with the agent's originally-drafted brief. */
  starterDescription: string;
  /** Called with the (possibly edited) text when the user clicks Send. */
  onSend: (content: string) => void;
  disabled?: boolean;
  /**
   * When provided, renders a "Discard" button to the left of Send — the
   * caller owns the confirmation modal and the actual delete; this only
   * fires the click. Omit to hide the button entirely.
   */
  onDiscard?: () => void;
  discardDisabled?: boolean;
  disableMotion?: boolean;
  /** Returns the max pixel height the card may expand to, e.g. when docked in a ChatPanel. */
  getMaxHeight?: () => number;
  className?: string;
}

/**
 * Docked card surfacing an auto-generated solution brief before the
 * user has acted on it: a label, an editable textarea seeded from the
 * brief, and a single Send action. Narrower than `ClarificationCard` — one
 * field, one action, no pagination or approve/reject branching — so it's
 * its own component rather than a `ClarificationCard` configuration, though
 * it reuses the same card chrome (including the drag-to-resize handle, via
 * `useDragResize`) since a `starterDescription` can run long enough to need
 * more room than the default seeded view gives it.
 */
export function SolutionBriefCard({
  starterDescription,
  onSend,
  disabled = false,
  onDiscard,
  discardDisabled = false,
  disableMotion = false,
  getMaxHeight,
  surface,
  weight,
  className,
}: SolutionBriefCardProps) {
  const [value, setValue] = useState(starterDescription);
  const canSend = !disabled && value.trim().length > 0;

  const { cardRef, cardHeight, handleProps, animateToContent } = useDragResize({
    disableMotion,
    getMaxHeight,
  });

  // Measures the seeded starterDescription's natural height once on mount —
  // there's no later content change to react to (unlike ClarificationCard's
  // per-question remeasure), just the one initial seed.
  // oxlint-disable-next-line react/exhaustive-deps
  useLayoutEffect(() => {
    animateToContent();
  }, []);

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(clarificationCardVariants({ surface, weight }), className)}
      style={{ height: cardHeight, willChange: "height" }}
    >
      {/* Drag handle */}
      <div
        {...handleProps}
        className="flex shrink-0 justify-center py-2 cursor-grab touch-none select-none"
      >
        <div className="w-8 h-1 rounded-full bg-(--bg-surface-tertiary)" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-2">
        <p className="shrink-0 font-sans normal-case text-caption [font-weight:var(--font-weight-bold)] text-(--text-tertiary)">
          Suggested solution
        </p>
        <textarea
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.shiftKey) return;
            e.preventDefault();
            submit();
          }}
          aria-label="Suggested solution brief"
          className={cn(
            "w-full min-h-0 flex-1 resize-none rounded outline-none",
            "text-body",
            "text-(--text-primary) placeholder:text-(--text-placeholder)",
          )}
        />
      </div>
      <div className="flex shrink-0 items-center justify-between p-3">
        {onDiscard ? (
          <Button
            variant="destructive"
            surface="ghost"
            disabled={discardDisabled}
            onClick={onDiscard}
          >
            Discard
          </Button>
        ) : (
          <span />
        )}
        <Button
          variant="primary"
          trailingIcon={<ArrowUp />}
          disabled={!canSend}
          onClick={submit}
        >
          Start building
        </Button>
      </div>
    </motion.div>
  );
}
