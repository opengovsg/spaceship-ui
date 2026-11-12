"use client";

/* ─────────────────────────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD — FeedbackForm
 *
 * Springs used
 *   snappy  visualDuration: 0.2s, bounce: 0  (ζ = 1.0)  — all animations
 *
 * Surface treatment ownership
 *   Collapsed  →  button owns bg + shadow + rounded-sm (container is invisible)
 *   Open       →  container owns bg + shadow + rounded-sm (button has neither)
 *   The handoff is instant on state flip; no visual pop because both are bg-surface-base.
 *
 * ─── Idle (collapsed) ────────────────────────────────────────────────────────
 *   Button is full-width, carries its own shadow-border + rounded-sm.
 *   hover  → bg: surface-base → surface-primary  (CSS transition-colors, 200ms)
 *   press  → bg: surface-base → surface-secondary (CSS transition-colors, 200ms)
 *
 * ─── Open (click trigger) ────────────────────────────────────────────────────
 *   Textarea enter  (AnimatePresence)
 *     0 → ~200ms  height 0 → auto, opacity 0 → 1  (spring: snappy)
 *
 *   Cancel enter  (AnimatePresence mode="popLayout")
 *     0 → ~200ms  opacity 0 → 1  (spring: snappy)
 *     Takes flex-1, immediately shrinking the main button's layout width.
 *
 *   Main button resize  (motion.button layout)
 *     0 → ~200ms  w-full → flex-1  (spring: snappy)
 *     Button stays mounted — no unmount/remount, no ghost copy.
 *
 *   Label reposition  (layout="position")
 *     0 → ~200ms  xy only, no text stretch  (spring: snappy)
 *
 *   Icon hidden, button turns primary-blue, label centers  (instant via transition-colors)
 *   Textarea auto-focused via useEffect.
 *
 * ─── Close (cancel or submit) ────────────────────────────────────────────────
 *   Textarea exit  (AnimatePresence)
 *     0 → ~200ms  height auto → 0, opacity 1 → 0  (spring: snappy)
 *
 *   Cancel exit  (AnimatePresence mode="popLayout")
 *     0ms         popped to position:absolute (freed from layout flow)
 *     0 → ~200ms  opacity 1 → 0  (spring: snappy)
 *
 *   Main button resize  (motion.button layout, reverse)
 *     0 → ~200ms  flex-1 → w-full  (spring: snappy)
 *
 *   Button returns to neutral bg + Pencil icon  (transition-colors)
 * ───────────────────────────────────────────────────────────────────────────── */

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { Pencil } from "lucide-react";
import { iconTextWeightVariants } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";
import { Button } from "./button";
import { springs } from "#/components/ds/lib/motion";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Shape + color classes shared by the button in both states. */
const BUTTON_SHAPE = [
  "flex items-center justify-between",
  "p-3 gap-1",
  "cursor-pointer select-none",
  "font-sans",
  iconTextWeightVariants({ weight: "semibold" }),
  "text-body",
  "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
  "text-(--text-primary)",
  "bg-(--bg-surface-base)",
  "hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)",
  "transition-colors duration-(--duration-base)",
];

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const feedbackFormVariants = cva(
  ["flex flex-col", "w-full", "font-sans"],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "",
      },
    },
    defaultVariants: { surface: "shadow-border" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FeedbackFormProps extends VariantProps<
  typeof feedbackFormVariants
> {
  onSubmit?: (message?: string) => void;
  onCancel?: () => void;
  /** Label for the trigger button and submit button. Default: 'Request Changes' */
  submitLabel?: string;
  /** Textarea placeholder text. Default: "Describe the changes you'd like..." */
  placeholder?: string;
  disableMotion?: boolean;
  className?: string;
}

// ─── FeedbackForm ─────────────────────────────────────────────────────────────

export function FeedbackForm({
  onSubmit,
  onCancel,
  submitLabel = "Request Changes",
  placeholder = "Describe the changes you'd like...",
  disableMotion = false,
  surface,
  className,
}: FeedbackFormProps) {
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasShadow = (surface ?? "shadow-border") === "shadow-border";

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  function handleCancel() {
    setOpen(false);
    onCancel?.();
  }

  function handleSubmit() {
    const message = textareaRef.current?.value;
    onSubmit?.(message || undefined);
    setOpen(false);
  }

  const textareaClasses = cn(
    "w-full resize-none p-1",
    "font-(family-name:--font-family-secondary)",
    "text-body leading-6",
    "text-(--text-primary) placeholder:text-(--text-placeholder)",
    "bg-transparent outline-none",
  );

  // ── Static path ───────────────────────────────────────────────────────────
  if (disableMotion) {
    if (!open) {
      return (
        <div className={cn(feedbackFormVariants({ surface }), className)}>
          <button
            onClick={() => setOpen(true)}
            className={cn(
              BUTTON_SHAPE,
              "w-full rounded-sm",
              hasShadow && "shadow-(--shadow-border)",
            )}
          >
            <span>{submitLabel}</span>
            <Pencil aria-hidden="true" />
          </button>
        </div>
      );
    }
    return (
      <div className={cn(feedbackFormVariants({ surface }), className)}>
        <div
          className={cn(
            "flex flex-col rounded-sm overflow-hidden",
            "bg-(--bg-surface-base)",
            hasShadow && "shadow-(--shadow-border)",
          )}
        >
          <div className="px-3 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              placeholder={placeholder}
              rows={3}
              className={textareaClasses}
            />
          </div>
          <div className="flex items-center gap-1 px-3 pb-3">
            <Button
              variant="secondary"
              surface="flat"
              onClick={handleCancel}
              disableMotion
              className="flex-1"
            >
              Cancel
            </Button>
            <button
              onClick={handleSubmit}
              className={cn(
                BUTTON_SHAPE,
                "flex-1 justify-center",
                "bg-(--bg-interactive-primary-default) text-(--text-inverse)",
                "hover:bg-(--bg-interactive-primary-hover) active:bg-(--bg-interactive-primary-pressed)",
              )}
            >
              <span>{submitLabel}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Motion path ───────────────────────────────────────────────────────────
  // Surface treatment ownership:
  //   !open → button is full-width and owns rounded + shadow
  //    open → container owns rounded + shadow; overflow-hidden clips the textarea
  return (
    <div className={cn(feedbackFormVariants({ surface }), className)}>
      <MotionConfig transition={springs.snappy}>
        <div
          className={cn(
            open && [
              "flex flex-col rounded-sm overflow-hidden",
              "bg-(--bg-surface-base)",
              hasShadow && "shadow-(--shadow-border)",
            ],
          )}
        >
          {/* ── Textarea — enters/exits via height animation ── */}
          <AnimatePresence initial={false}>
            {open && (
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
                    placeholder={placeholder}
                    rows={3}
                    className={textareaClasses}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Button row — relative scopes popLayout's absolute exit ── */}
          <div
            className={cn(
              "relative flex items-center gap-1",
              open && "px-3 pb-3",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {open && (
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
             * Neutral when collapsed → primary-blue when open, centered with no icon. */}
            <motion.button
              layout
              onClick={open ? handleSubmit : () => setOpen(true)}
              className={cn(
                BUTTON_SHAPE,
                "transition-colors duration-(--duration-base)",
                !open
                  ? [
                      "w-full rounded-sm",
                      hasShadow &&
                        "shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow ease-(--ease-in-out)",
                    ]
                  : [
                      "flex-1 justify-center",
                      "bg-(--bg-interactive-primary-default) text-(--text-inverse)",
                      "hover:bg-(--bg-interactive-primary-hover) active:bg-(--bg-interactive-primary-pressed)",
                    ],
              )}
              style={{ willChange: "transform" }}
            >
              <motion.span layout="position">{submitLabel}</motion.span>
              {!open && <Pencil aria-hidden="true" />}
            </motion.button>
          </div>
        </div>
      </MotionConfig>
    </div>
  );
}
