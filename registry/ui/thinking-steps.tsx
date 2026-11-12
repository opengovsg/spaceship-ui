"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";
import { ShimmerText } from "./shimmer-text";
import { useSystemReducedMotion } from "./use-reduced-motion";

export interface ThinkingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "inactive";
}

export const thinkingStepsVariants = cva(
  ["min-w-0 text-body text-(--text-secondary)"],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border":
          "rounded-2xl bg-(--bg-surface-base) p-3 shadow-(--shadow-border)",
      },
    },
    defaultVariants: { surface: "default" },
  },
);

export interface ThinkingStepsProps extends VariantProps<
  typeof thinkingStepsVariants
> {
  steps: ThinkingStep[];
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disableMotion?: boolean;
  className?: string;
  leadingContent?: ReactNode;
  trailingContent?: ReactNode;
  stepColor?: string;
}

/** Displays observed work status. Callers own the activity and response association. */
export function ThinkingSteps({
  steps,
  label,
  open,
  onOpenChange,
  surface,
  disableMotion = false,
  className,
  leadingContent,
  trailingContent,
  stepColor,
}: ThinkingStepsProps) {
  const reducedMotion = useSystemReducedMotion() || disableMotion;
  const bodyRef = useRef<HTMLUListElement>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const firstPaint = useRef(true);
  const [hidden, setHidden] = useState(!open);
  const [height, setHeight] = useState(0);
  const visibleSteps = steps.filter((step) => step.status !== "pending");
  const active = visibleSteps.some((step) => step.status === "active");

  useEffect(() => {
    firstPaint.current = false;
  }, []);

  useLayoutEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body || hidden) return;
    const measure = () => setHeight(body.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [hidden, steps]);

  if (visibleSteps.length === 0) return null;

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={onOpenChange}
      className={cn(thinkingStepsVariants({ surface }), className)}
    >
      <span role="status" className="sr-only">
        {label}
      </span>
      <Collapsible.Trigger
        aria-label={label}
        className="flex max-w-full items-center gap-2 rounded py-1 text-left hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-input-focus)"
      >
        {leadingContent}
        <span aria-hidden className="inline-grid min-w-0">
          <span className="invisible col-start-1 row-start-1 font-semibold">
            {label}
          </span>
          <span
            className={cn(
              "col-start-1 row-start-1",
              open && "font-semibold text-(--text-primary)",
            )}
          >
            {active ? (
              <ShimmerText variant="subtle" disableMotion={reducedMotion}>
                {label}
              </ShimmerText>
            ) : (
              label
            )}
          </span>
        </span>
        {trailingContent}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ rotate: open ? 90 : 0 }}
          transition={reducedMotion ? { duration: 0 } : springs.interactive}
        >
          <ChevronRight className="size-3.5" />
        </motion.span>
      </Collapsible.Trigger>
      <Collapsible.Content forceMount asChild>
        <motion.div
          hidden={hidden}
          className="overflow-hidden"
          initial={false}
          animate={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
          transition={
            reducedMotion || firstPaint.current
              ? { duration: 0 }
              : springs.snappy
          }
          onAnimationComplete={() => {
            if (!openRef.current) setHidden(true);
          }}
        >
          <ul ref={bodyRef} className="space-y-3 py-3 pl-1">
            {visibleSteps.map((step, index) => (
              <li key={step.id} className="relative flex gap-2">
                {index < visibleSteps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-[6px] top-5 -mb-3 w-px bg-(--border-subtle)"
                  />
                )}
                <span
                  aria-hidden
                  style={stepColor ? { color: stepColor } : undefined}
                  className="flex h-5 w-3.5 shrink-0 items-center"
                >
                  {step.status === "complete" ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Circle className="size-3.5" />
                  )}
                </span>
                {step.status === "active" ? (
                  <ShimmerText variant="subtle" disableMotion={reducedMotion}>
                    {step.label}…
                  </ShimmerText>
                ) : (
                  <span>{step.label}</span>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
