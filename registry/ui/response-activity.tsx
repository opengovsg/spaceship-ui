"use client";

import { useEffect, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { resolveColor } from "#/components/ds/lib/resolve-color";
import { ThinkingSteps } from "./thinking-steps";
import { ThinkingOrb, type ThinkingOrbState } from "./thinking-orb";
import { useSystemReducedMotion } from "./use-reduced-motion";

export type ResponseActivityPhase =
  | "thinking"
  | "responding"
  | "completed"
  | "waiting"
  | "failed"
  | "interrupted"
  | "disconnected";

const shapes: ThinkingOrbState[] = [
  "searching",
  "solving",
  "listening",
  "connecting",
  "weaving",
  "composing",
  "breathing",
  "shaping",
];
const labels: Record<ResponseActivityPhase, string> = {
  thinking: "Thinking…",
  responding: "Responding…",
  completed: "Completed",
  waiting: "Waiting for your input",
  failed: "Failed",
  interrupted: "Interrupted",
  disconnected: "Connection lost",
};

export const responseActivityVariants = cva(["min-w-0"], {
  variants: {
    surface: {
      default: "",
      "shadow-border":
        "rounded-(--radius-inner) bg-(--bg-surface-base) p-3 shadow-(--shadow-border)",
    },
  },
  defaultVariants: { surface: "default" },
});

export interface ResponseActivityProps extends VariantProps<
  typeof responseActivityVariants
> {
  phase: ResponseActivityPhase;
  caption?: string;
  observed?: boolean;
  hasResponse?: boolean;
  startedAt?: number;
  stoppedAt?: number;
  disableMotion?: boolean;
  className?: string;
}

/** A response's observed lifecycle; no model reasoning or inferred historical duration. */
export function ResponseActivity({
  phase,
  caption,
  observed = false,
  hasResponse = false,
  startedAt,
  stoppedAt,
  disableMotion = false,
  surface,
  className,
}: ResponseActivityProps) {
  const reducedMotion = useSystemReducedMotion() || disableMotion;
  const active = phase === "thinking" || phase === "responding";
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [colors, setColors] = useState({ tint: "", canvas: "" });
  const completed = useRef(false);

  useEffect(() => {
    if (phase === "completed" && !completed.current) {
      setOpen(false);
      completed.current = true;
    }
    if (active) completed.current = false;
  }, [phase, active]);

  useEffect(() => {
    if (!active || reducedMotion) return;
    const timer = window.setInterval(() => setTick((value) => value + 1), 4000);
    return () => window.clearInterval(timer);
  }, [active, reducedMotion]);

  useEffect(() => {
    if (!active || startedAt == null) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active, startedAt]);

  useEffect(() => {
    const update = () =>
      setColors({
        tint: resolveColor(
          `--activity-tint-${((reducedMotion ? 0 : tick) % 5) + 1}`,
        ),
        canvas: resolveColor("--color-canvas"),
      });
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [tick, reducedMotion]);

  const elapsed =
    startedAt == null
      ? undefined
      : Math.max(0, Math.floor(((stoppedAt ?? now) - startedAt) / 1000));
  const success = phase === "completed";
  const steps =
    observed && hasResponse
      ? [
          {
            id: "processing",
            label: "Processing request",
            status: "complete" as const,
          },
          {
            id: "response",
            label: success
              ? "Response completed"
              : active
                ? "Responding"
                : labels[phase],
            status: success
              ? ("complete" as const)
              : active
                ? ("active" as const)
                : ("inactive" as const),
          },
        ]
      : [
          {
            id: "request",
            label: success
              ? "Response completed"
              : active
                ? "Processing request"
                : labels[phase],
            status: success
              ? ("complete" as const)
              : active
                ? ("active" as const)
                : ("inactive" as const),
          },
        ];

  return (
    <div
      data-testid={active ? "agent-thinking" : undefined}
      className={cn(responseActivityVariants({ surface }), className)}
    >
      <ThinkingSteps
        label={
          active && caption ? `${labels[phase]} ${caption}` : labels[phase]
        }
        open={open}
        onOpenChange={setOpen}
        disableMotion={reducedMotion}
        leadingContent={
          active ? (
            <ThinkingOrb
              size="sm"
              state={shapes[(reducedMotion ? 0 : tick) % shapes.length]}
              label=""
              color={colors.tint || undefined}
              canvasColor={colors.canvas || undefined}
              disableMotion={reducedMotion}
            />
          ) : undefined
        }
        trailingContent={
          elapsed == null || (success && stoppedAt == null) ? undefined : (
            <span
              aria-hidden
              className="text-caption tabular-nums text-(--text-tertiary)"
            >
              {success ? `in ${elapsed}s` : `${elapsed}s`}
            </span>
          )
        }
        stepColor={colors.tint || undefined}
        steps={steps}
      />
    </div>
  );
}
