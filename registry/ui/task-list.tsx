"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const taskListVariants = cva(
  [
    "font-sans flex flex-col rounded-(--radius-inner) overflow-hidden",
    "border border-(--border-subtle) bg-(--bg-surface-primary)",
  ],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "",
      },
    },
    defaultVariants: { surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TaskListProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof taskListVariants> {
  items: string[];
  completedCount?: number;
  isActive?: boolean;
  updatedAt?: string;
  defaultExpanded?: boolean;
  /**
   * External expand/collapse signal — e.g. `ChatThread`'s `onNearBottomChange`,
   * so the list auto-collapses while the user reads back through the thread
   * and auto-expands on return to the bottom. Syncs into the internal
   * expanded state on change rather than driving it directly, so a header
   * click still toggles the list independently in between signal changes
   * (mirrors v1's `TasksAccordion` `expand` prop).
   */
  expand?: boolean;
  disableMotion?: boolean;
  /** Hide the header's fill bar — for a completed plan shown as a static summary, where a full bar reads as redundant. */
  showProgressBar?: boolean;
  /** Show a collapsible summary header. Without it, every task stays visible. */
  showHeader?: boolean;
}

// ─── TaskList ─────────────────────────────────────────────────────────────────

export function TaskList({
  items,
  completedCount = 0,
  isActive,
  updatedAt,
  defaultExpanded = true,
  expand,
  disableMotion = false,
  showProgressBar = true,
  showHeader = true,
  surface,
  className,
  ...props
}: TaskListProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (expand != null) setExpanded(expand);
  }, [expand]);

  // isActive defaults to true when not all tasks are done
  const active = isActive ?? completedCount < items.length;
  const progressPct =
    items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div className={cn(taskListVariants({ surface }), className)} {...props}>
      <CollapsiblePrimitive.Root
        open={!showHeader || expanded}
        onOpenChange={setExpanded}
      >
        {/* ── Header ── */}
        {showHeader && (
          <CollapsiblePrimitive.Trigger asChild>
            <button
              type="button"
              className="relative flex items-center justify-between px-4 py-3 overflow-hidden bg-(--bg-surface-primary) border-b border-(--border-subtle) cursor-pointer w-full text-left"
            >
              {/* Progress fill — absolute, behind content; scaleX from left (compositor-only) */}
              {showProgressBar && (
                <ProgressPrimitive.Root
                  value={progressPct}
                  max={100}
                  className="absolute inset-y-0 left-0 w-full overflow-hidden"
                >
                  <ProgressPrimitive.Indicator
                    className="h-full bg-(--bg-surface-success-base) transition-transform duration-500 ease-out origin-left"
                    style={{ transform: `scaleX(${progressPct / 100})` }}
                  >
                    {!disableMotion && progressPct > 0 && (
                      <motion.span
                        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{
                          duration: 1.5,
                          ease: "linear",
                          repeat: Infinity,
                          repeatDelay: 0.75,
                        }}
                        style={{ willChange: "transform" }}
                      />
                    )}
                  </ProgressPrimitive.Indicator>
                </ProgressPrimitive.Root>
              )}

              {/* Left: icon + count */}
              <span className="relative z-10 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 shrink-0 text-(--text-primary)" />
                <span className="font-sans text-body [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
                  {completedCount}/{items.length} tasks completed
                </span>
              </span>

              {/* Right: timestamp + chevron */}
              <span className="relative z-10 flex items-center gap-2 shrink-0">
                {updatedAt && (
                  <span className="font-sans text-caption [font-weight:var(--font-weight-semibold)] text-(--text-tertiary)">
                    {updatedAt}
                  </span>
                )}
                <ChevronIcon className="h-4 w-4 text-(--text-tertiary)" />
              </span>
            </button>
          </CollapsiblePrimitive.Trigger>
        )}

        {/* ── Body — slides open/closed via height, not a static block that
            pops in/out behind a fading mask ── */}
        <CollapsiblePrimitive.Content forceMount>
          <AnimatePresence initial={false}>
            {(!showHeader || expanded) && (
              <motion.div
                key="body"
                initial={
                  disableMotion || !showHeader
                    ? false
                    : { height: 0, opacity: 0 }
                }
                animate={{ height: "auto", opacity: 1 }}
                exit={disableMotion ? undefined : { height: 0, opacity: 0 }}
                transition={springs.interactive}
                style={{ overflow: "hidden" }}
                className="bg-(--bg-surface-primary)"
              >
                {/* Collapsible lists cap their body; inline rows use thread scrolling. */}
                <ol
                  aria-label="Tasks"
                  className={cn(
                    "flex flex-col gap-3 p-3 list-none",
                    showHeader && "max-h-[14.5rem] overflow-y-auto",
                  )}
                >
                  {items.map((task, i) => {
                    const isCompleted = i < completedCount;
                    const isInProgress = active && i === completedCount;

                    let textClass: string;
                    let icon: React.ReactNode;

                    if (isCompleted) {
                      textClass = "text-(--text-primary)";
                      icon = (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-(--bg-interactive-success-default)" />
                      );
                    } else if (isInProgress) {
                      textClass = "text-(--text-secondary)";
                      icon = (
                        <Loader2 className="h-4 w-4 shrink-0 text-(--text-secondary) animate-spin" />
                      );
                    } else {
                      textClass = "text-(--text-placeholder)";
                      icon = (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-(--text-placeholder) opacity-40" />
                      );
                    }

                    return (
                      <li key={task} className="flex items-center gap-3">
                        <span className="font-sans text-body [font-weight:var(--font-weight-semibold)] text-(--text-tertiary) w-4 shrink-0 text-center tabular-nums">
                          {i + 1}
                        </span>
                        <span
                          className={cn(
                            "flex-1 font-sans text-body",
                            textClass,
                          )}
                        >
                          {task}
                        </span>
                        <span className="sr-only">
                          {isCompleted
                            ? "Completed"
                            : isInProgress
                              ? "In progress"
                              : "Pending"}
                        </span>
                        {disableMotion ? (
                          <span className="shrink-0" aria-hidden="true">
                            {icon}
                          </span>
                        ) : (
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={
                                isCompleted
                                  ? "done"
                                  : isInProgress
                                    ? "progress"
                                    : "pending"
                              }
                              className="shrink-0 block"
                              aria-hidden="true"
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.6, opacity: 0 }}
                              transition={springs.interactive}
                              style={{ willChange: "transform" }}
                            >
                              {icon}
                            </motion.span>
                          </AnimatePresence>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsiblePrimitive.Content>
      </CollapsiblePrimitive.Root>
    </div>
  );
}
