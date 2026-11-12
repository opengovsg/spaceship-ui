"use client";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — ApprovalCard
 *
 * Idle state
 *   Approve row:   hover/tap → bg color instant (useAnimation.set)
 *   Reject row:    hover/tap → bg color instant (useAnimation.set)
 *
 * "Request Changes" open  (family-dialog pattern)
 *     0ms   actions block expands via layout animation (spring: snappy, ζ = 1.0)
 *     0ms   button morphs from full-width trigger → compact submit via layout
 *     0ms   label slides to new position (layout="position", no text stretch)
 *     0ms   textarea reveals top-down (height: 0 → 104, spring: snappy)
 *
 * "Request Changes" close (cancel / submit)
 *     0ms   textarea collapses (height: 104 → 0, spring: snappy)
 *     0ms   button morphs from compact submit → full-width trigger via layout
 *     0ms   actions block collapses via layout animation
 *
 * Drag resize
 *   drag    → live height tracking (no spring)
 *   release → snap to naturalH or maxH (spring: snappy, ζ = 1.0)
 * ───────────────────────────────────────────────────────── */

import {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import {
  motion,
  useAnimation,
  AnimatePresence,
  MotionConfig,
} from "framer-motion";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle, ChevronsUpDown, Pencil } from "lucide-react";
import { iconTextWeightVariants } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";
import { resolveColor } from "#/components/ds/lib/resolve-color";
import { springs } from "#/components/ds/lib/motion";
import { Button } from "./button";
import { useDragResize } from "./use-drag-resize";

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const approvalCardVariants = cva(
  [
    "flex flex-col overflow-hidden",
    "w-full",
    "min-w-(--sizing-chat-min)",
    "max-w-(--sizing-chat-max)",
    "font-sans",
    "bg-(--bg-surface-base)",
  ],
  {
    variants: {
      surface: {
        default: "rounded-2xl",
        "shadow-border": "rounded-2xl shadow-(--shadow-border)",
        /** Flush against the bottom of a chat panel — square, hairline on top only. */
        docked:
          "rounded-none border-t border-(--border-subtle) bg-(--bg-surface-base)",
      },
    },
    defaultVariants: { surface: "shadow-border" },
  },
);

const actionRowVariants = cva(
  [
    "flex items-center justify-between w-full",
    "p-3 gap-1",
    // 4px — matches the numeric radius the reject row's `layout` animation needs.
    "rounded",
    "cursor-pointer select-none",
    "font-sans",
    iconTextWeightVariants({ weight: "semibold" }),
    "text-body",
    "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      intent: {
        approve: [
          "bg-(--bg-interactive-success-default)",
          "text-(--text-inverse)",
        ],
        reject: ["bg-(--bg-surface-base)", "text-(--text-primary)"],
      },
      hasShadow: {
        true: "shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)",
        false: "",
      },
    },
    defaultVariants: { hasShadow: true },
  },
);

// ─── Color animation tokens ───────────────────────────────────────────────────

const APPROVE_TOKENS = {
  default: "--bg-interactive-success-default",
  hover: "--bg-interactive-success-hover",
  pressed: "--bg-interactive-success-pressed",
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ApprovalCardProps extends VariantProps<
  typeof approvalCardVariants
> {
  children: React.ReactNode;
  /** Title displayed in the header bar. */
  title?: string;
  onApprove?: () => void;
  /** Called when the user submits change feedback. Receives optional message text. */
  onReject?: (message?: string) => void;
  approveLabel?: string;
  rejectLabel?: string;
  /** Placeholder for the change-request textarea. */
  rejectPlaceholder?: string;
  /** Adds a header toggle that collapses the card down to its title bar. */
  collapsible?: boolean;
  /** Starts collapsed. Only meaningful with `collapsible`. */
  defaultCollapsed?: boolean;
  disableMotion?: boolean;
  /** Returns the max pixel height the card may expand to. Used by ChatPanel to stop at the header. */
  getMaxHeight?: () => number;
  className?: string;
}

// ─── ApprovalCard ─────────────────────────────────────────────────────────────

export function ApprovalCard({
  children,
  title = "Implementation Plan",
  onApprove,
  onReject,
  approveLabel = "Approve Plan",
  rejectLabel = "Request Changes",
  rejectPlaceholder = "Explain the changes you want to make...",
  collapsible = false,
  defaultCollapsed = false,
  disableMotion = false,
  getMaxHeight,
  surface,
  className,
}: ApprovalCardProps) {
  const [collapsed, setCollapsed] = useState(collapsible && defaultCollapsed);
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Docked cards have no shadow of their own, but the inner "Request Changes"
  // row keeps its hairline in every other surface.
  const hasShadow = (surface ?? "shadow-border") !== "default";
  const actionsRef = useRef<HTMLDivElement>(null);
  const approveColorControls = useAnimation();

  /** Room the plan text gets before the card stops growing on its own. */
  const CONTENT_NATURAL_CAP = 400;

  // ── Card resize (drag handle) ──────────────────────────────────────────────
  // The actions now live inside the card, so there is nothing left to
  // subtract — the ceiling ChatPanel hands down is the ceiling for the whole card.
  const cardMaxHeight = useCallback(
    () => getMaxHeight?.() ?? window.innerHeight * 0.85,
    [getMaxHeight],
  );

  // The natural cap grows by exactly what moved inside, so the plan text
  // keeps the same ~400px it had when the actions were a sibling.
  const naturalCap = useCallback(
    () => CONTENT_NATURAL_CAP + (actionsRef.current?.offsetHeight ?? 0),
    [],
  );

  const { cardRef, cardHeight, handleProps, animateToContent } = useDragResize({
    disableMotion,
    maxNaturalHeight: naturalCap,
    getMaxHeight: cardMaxHeight,
  });

  // Measure initial natural height so drag floor is set correctly.
  // oxlint-disable-next-line react/exhaustive-deps
  useLayoutEffect(() => {
    animateToContent();
  }, []);

  // Auto-focus the textarea when the request-changes panel opens.
  useEffect(() => {
    if (requestChangesOpen) textareaRef.current?.focus();
  }, [requestChangesOpen]);

  // Re-measure on expand: the content was unmounted while collapsed, so the
  // drag-resize floor is stale until it is measured again.
  useEffect(() => {
    if (!collapsed) animateToContent();
  }, [collapsed]);

  // ── Approve row color animation ───────────────────────────────────────────
  const colorMountedRef = useRef(false);

  useEffect(() => {
    colorMountedRef.current = true;
    approveColorControls.set({
      backgroundColor: resolveColor(APPROVE_TOKENS.default),
    });
    return () => {
      colorMountedRef.current = false;
    };
    // oxlint-disable-next-line react/exhaustive-deps
  }, []);

  function handleOpenRequestChanges() {
    setRequestChangesOpen(true);
  }

  function handleCancel() {
    setRequestChangesOpen(false);
    setChangeMessage("");
  }

  function handleSubmit() {
    onReject?.(changeMessage || undefined);
    setRequestChangesOpen(false);
    setChangeMessage("");
  }

  return (
    <motion.div
      ref={cardRef}
      // Collapsed, the card is header-only and sizes to content; the drag
      // handle's height MotionValue would otherwise hold it open.
      style={
        collapsed
          ? { height: "auto" }
          : { height: cardHeight, willChange: "height" }
      }
      className={cn(approvalCardVariants({ surface }), className)}
    >
      {/* Drag handle — nothing to resize while collapsed */}
      {!collapsed && (
        <div
          {...handleProps}
          className="flex shrink-0 justify-center py-2 bg-(--bg-surface-secondary) cursor-grab touch-none select-none"
        >
          <div className="w-8 h-1 rounded-full bg-(--bg-surface-tertiary)" />
        </div>
      )}

      {/* Header */}
      <div className="shrink-0 bg-(--bg-surface-secondary) border-b border-(--bg-surface-tertiary) px-3 py-2">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!collapsed}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between gap-2 text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)",
            )}
          >
            <h3 className="font-(family-name:--font-family-secondary) font-semibold text-body text-(--text-primary) whitespace-nowrap">
              {title}
            </h3>
            <ChevronsUpDown
              aria-hidden="true"
              className="size-4 shrink-0 text-(--text-tertiary)"
            />
          </button>
        ) : (
          <h3 className="font-(family-name:--font-family-secondary) font-semibold text-body text-(--text-primary) whitespace-nowrap">
            {title}
          </h3>
        )}
      </div>

      {/* Scrollable content */}
      {!collapsed && (
        <ScrollAreaPrimitive.Root className="flex-1 min-h-0 overflow-hidden">
          <ScrollAreaPrimitive.Viewport className="h-full w-full">
            <div className="p-4">{children}</div>
          </ScrollAreaPrimitive.Viewport>
          <ScrollAreaPrimitive.Scrollbar
            orientation="vertical"
            className="flex w-2 touch-none select-none transition-colors px-0.5 py-2"
          >
            <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-(--bg-surface-tertiary)" />
          </ScrollAreaPrimitive.Scrollbar>
        </ScrollAreaPrimitive.Root>
      )}

      {/* ── Action rows — inside the card, always rendered so they stay visible while collapsed ── */}
      {disableMotion ? (
        <div ref={actionsRef} className="flex shrink-0 flex-col gap-3 p-4">
          {/* Approve */}
          <button
            type="button"
            onClick={onApprove}
            className={cn(
              actionRowVariants({ intent: "approve", hasShadow }),
              "transition-colors duration-(--duration-base) ease-in-out hover:bg-(--bg-interactive-success-hover) active:bg-(--bg-interactive-success-pressed)",
            )}
          >
            <span>{approveLabel}</span>
            <CheckCircle aria-hidden="true" />
          </button>

          {/* Request Changes — instant swap when disableMotion */}
          {!requestChangesOpen ? (
            <button
              type="button"
              onClick={() => setRequestChangesOpen(true)}
              className={cn(
                actionRowVariants({ intent: "reject", hasShadow }),
                "transition-colors duration-(--duration-base) ease-in-out hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)",
              )}
            >
              <span>{rejectLabel}</span>
              <Pencil aria-hidden="true" />
            </button>
          ) : (
            <div
              className={cn(
                "bg-(--bg-surface-base) rounded p-3 flex flex-col gap-3 overflow-hidden",
                hasShadow && "shadow-(--shadow-border)",
              )}
            >
              <textarea
                ref={textareaRef}
                value={changeMessage}
                onChange={(e) => setChangeMessage(e.target.value)}
                placeholder={rejectPlaceholder}
                aria-label={rejectLabel}
                rows={3}
                className={cn(
                  "w-full resize-none p-1",
                  "font-(family-name:--font-family-secondary)",
                  "text-body",
                  "text-(--text-primary) placeholder:text-(--text-placeholder)",
                  "bg-transparent outline-none",
                )}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  surface="flat"
                  onClick={handleCancel}
                  disableMotion
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disableMotion>
                  {rejectLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <MotionConfig transition={springs.snappy}>
          <div
            ref={actionsRef}
            className="relative flex shrink-0 flex-col gap-3 p-4"
          >
            {/* Approve */}
            <motion.button
              type="button"
              onClick={onApprove}
              className={actionRowVariants({ intent: "approve", hasShadow })}
              animate={approveColorControls}
              transition={springs.interactive}
              onHoverStart={() => {
                if (colorMountedRef.current)
                  approveColorControls.set({
                    backgroundColor: resolveColor(APPROVE_TOKENS.hover),
                  });
              }}
              onHoverEnd={() => {
                if (colorMountedRef.current)
                  approveColorControls.set({
                    backgroundColor: resolveColor(APPROVE_TOKENS.default),
                  });
              }}
              onTapStart={() => {
                if (colorMountedRef.current)
                  approveColorControls.set({
                    backgroundColor: resolveColor(APPROVE_TOKENS.pressed),
                  });
              }}
              onTap={() => {
                if (colorMountedRef.current)
                  approveColorControls.set({
                    backgroundColor: resolveColor(APPROVE_TOKENS.hover),
                  });
              }}
              onTapCancel={() => {
                if (colorMountedRef.current)
                  approveColorControls.set({
                    backgroundColor: resolveColor(APPROVE_TOKENS.default),
                  });
              }}
            >
              <span>{approveLabel}</span>
              <CheckCircle aria-hidden="true" />
            </motion.button>

            {/* Request Changes — always-mounted button pattern (same as FeedbackForm).
             * !open → button owns surface (bg + shadow + rounded).
             *  open → container owns surface; overflow-hidden clips the textarea. */}
            <div
              className={cn(
                requestChangesOpen && [
                  "flex flex-col rounded overflow-hidden",
                  "bg-(--bg-surface-base)",
                  hasShadow && "shadow-(--shadow-border)",
                ],
              )}
            >
              {/* ── Textarea — enters/exits via height animation ── */}
              <AnimatePresence initial={false}>
                {requestChangesOpen && (
                  <motion.div
                    key="textarea"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-3 pt-3 pb-2">
                      <textarea
                        ref={textareaRef}
                        value={changeMessage}
                        onChange={(e) => setChangeMessage(e.target.value)}
                        placeholder={rejectPlaceholder}
                        aria-label={rejectLabel}
                        rows={3}
                        className={cn(
                          "w-full resize-none p-1",
                          "font-(family-name:--font-family-secondary)",
                          "text-body",
                          "text-(--text-primary) placeholder:text-(--text-placeholder)",
                          "bg-transparent outline-none",
                        )}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Button row — relative scopes popLayout's absolute exit ── */}
              <div
                className={cn(
                  "relative flex items-center gap-2",
                  requestChangesOpen && "px-3 pb-3",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {requestChangesOpen && (
                    <motion.div
                      key="cancel"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      <Button
                        variant="secondary"
                        surface="flat"
                        onClick={handleCancel}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main button — always mounted, repositions via layout.
                 * Neutral when collapsed → primary-blue when open.
                 * CSS transition-colors handles the color shift smoothly (no snap)
                 * because the button stays mounted throughout. */}
                <motion.button
                  type="button"
                  layout
                  onClick={
                    requestChangesOpen ? handleSubmit : handleOpenRequestChanges
                  }
                  className={cn(
                    actionRowVariants({
                      intent: "reject",
                      hasShadow: !requestChangesOpen && hasShadow,
                    }),
                    "transition-colors duration-(--duration-base)",
                    !requestChangesOpen
                      ? [
                          "w-full rounded",
                          "hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)",
                          hasShadow &&
                            "hover:shadow-(--shadow-border-hover) transition-shadow ease-(--ease-in-out)",
                        ]
                      : [
                          "flex-1 justify-center",
                          "bg-(--bg-interactive-primary-default) text-(--text-inverse)",
                          "hover:bg-(--bg-interactive-primary-hover) active:bg-(--bg-interactive-primary-pressed)",
                        ],
                  )}
                  style={{ willChange: "transform", borderRadius: 4 }}
                >
                  <motion.span layout="position">{rejectLabel}</motion.span>
                  {!requestChangesOpen && <Pencil aria-hidden="true" />}
                </motion.button>
              </div>
            </div>
          </div>
        </MotionConfig>
      )}
    </motion.div>
  );
}
