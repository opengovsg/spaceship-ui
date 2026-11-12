"use client";

import { type ReactNode, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const ICON_CLASSES: Record<"default", string> = {
  default: "[&>svg]:size-4",
};

function IconSlot({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        ICON_CLASSES.default,
      )}
    >
      {icon}
    </span>
  );
}

export const segmentedControlVariants = cva(
  ["relative flex w-full rounded-lg bg-(--bg-segmented-track) p-1"],
  {
    variants: {
      surface: { default: "", shadow: "shadow-(--shadow-border)" },
      gap: { none: "", sm: "gap-1" },
    },
    defaultVariants: { surface: "default", gap: "none" },
  },
);

export interface SegmentedControlProps extends VariantProps<
  typeof segmentedControlVariants
> {
  value: string;
  options: readonly {
    value: string;
    label: string;
    leadingIcon?: ReactNode;
    badge?: ReactNode;
    tooltip?: string;
    disabled?: boolean;
    disabledReason?: string;
  }[];
  onChange: (value: string) => void;
  /** Where the pill starts when navigation remounts the control. */
  initialValue?: string;
  label: string;
  disableMotion?: boolean;
  className?: string;
}

/** Equal-width navigation choices with a raised, spring-driven selection pill. */
export function SegmentedControl({
  value,
  options,
  onChange,
  initialValue = value,
  label,
  disableMotion = false,
  surface,
  gap = "none",
  className,
}: SegmentedControlProps) {
  const gapRem = gap === "sm" ? 0.25 : 0;
  const indicatorWidth = gapRem
    ? `calc((100% - ${(options.length - 1) * gapRem}rem) / ${options.length})`
    : `${100 / options.length}%`;
  const indicatorX = (index: number) =>
    gapRem ? `calc(${index * 100}% + ${index * gapRem}rem)` : `${index * 100}%`;
  const descriptionId = useId();
  const reducedMotion = useReducedMotion();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const initialIndex = useRef(
    Math.max(
      0,
      options.findIndex((option) => option.value === initialValue),
    ),
  ).current;
  const preview = hovered ?? focused ?? selected;
  const previewing = preview !== selected;
  const transition =
    disableMotion || reducedMotion ? { duration: 0 } : springs.snappy;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(segmentedControlVariants({ surface, gap }), className)}
      onPointerMove={(event) => {
        if (event.pointerType === "touch") return;
        let index = 0;
        let nearestDistance = Infinity;
        buttons.current.forEach((button, candidate) => {
          if (!button) return;
          const rect = button.getBoundingClientRect();
          const distance = Math.abs(
            event.clientX - (rect.left + rect.width / 2),
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
            index = candidate;
          }
        });
        setHovered(options[index]?.disabled ? null : index);
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-1">
        <motion.div
          data-segmented-indicator=""
          className="absolute inset-y-0 left-0 rounded-md bg-(--bg-segmented-selected) shadow-(--shadow-border)"
          style={{ width: indicatorWidth }}
          initial={
            disableMotion || reducedMotion
              ? false
              : { x: indicatorX(initialIndex) }
          }
          animate={{ x: indicatorX(selected), opacity: previewing ? 0.85 : 1 }}
          transition={transition}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-md bg-(--bg-segmented-selected)"
          style={{ width: indicatorWidth }}
          initial={{ x: indicatorX(initialIndex), opacity: 0 }}
          animate={{ x: indicatorX(preview), opacity: previewing ? 0.4 : 0 }}
          transition={transition}
        />
      </div>
      {options.map((option, index) => {
        const disabledReason =
          option.disabledReason ?? `${option.label} is unavailable.`;
        const description = option.disabled
          ? [disabledReason, option.tooltip].filter(Boolean).join(" ")
          : option.tooltip;
        const reasonId = `${descriptionId}-${index}`;
        const button = (
          <button
            key={option.value}
            type="button"
            ref={(node) => {
              buttons.current[index] = node;
            }}
            disabled={option.disabled}
            aria-describedby={option.disabled ? reasonId : undefined}
            aria-pressed={option.value === value}
            tabIndex={index === selected ? 0 : -1}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            onClick={() => {
              if (option.value !== value) onChange(option.value);
            }}
            onKeyDown={(event) => {
              const direction =
                event.key === "ArrowRight"
                  ? 1
                  : event.key === "ArrowLeft"
                    ? -1
                    : 0;
              if (!direction && event.key !== "Home" && event.key !== "End")
                return;
              event.preventDefault();
              const enabled = options
                .map((entry, i) => (entry.disabled ? -1 : i))
                .filter((i) => i !== -1);
              const next =
                event.key === "Home"
                  ? enabled[0]
                  : event.key === "End"
                    ? enabled[enabled.length - 1]
                    : enabled[
                        (enabled.indexOf(index) + direction + enabled.length) %
                          enabled.length
                      ];
              if (next === undefined) return;
              buttons.current[next]?.focus();
              const nextOption = options[next];
              if (nextOption && next !== selected) onChange(nextOption.value);
            }}
            className={cn(
              "relative z-10 flex h-7 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-md px-1 font-sans text-body",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus) disabled:pointer-events-none disabled:opacity-50",
              "transition-colors duration-(--duration-fast)",
              index === selected || index === preview
                ? "text-(--text-primary)"
                : "text-(--text-secondary)",
            )}
          >
            <IconSlot icon={option.leadingIcon} />
            <span className="inline-grid">
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1 font-semibold"
              >
                {option.label}
              </span>
              <span
                className={cn(
                  "col-start-1 row-start-1",
                  index === selected ? "font-semibold" : "font-normal",
                )}
              >
                {option.label}
              </span>
            </span>
            {option.badge && (
              <span className="inline-flex">{option.badge}</span>
            )}
          </button>
        );
        if (!description) {
          return (
            <span
              key={option.value}
              className="relative z-10 flex min-w-0 flex-1"
            >
              {button}
            </span>
          );
        }
        return (
          <span
            key={option.value}
            className="relative z-10 flex min-w-0 flex-1"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {option.disabled ? (
                    <span
                      tabIndex={0}
                      aria-label={option.label}
                      className="relative z-10 flex min-w-0 flex-1 cursor-[url('/locked-cursor.svg')_8_8,not-allowed] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)"
                    >
                      {button}
                    </span>
                  ) : (
                    button
                  )}
                </TooltipTrigger>
                <TooltipContent side="right" align="start" className="max-w-64">
                  {description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {option.disabled && (
              <span id={reasonId} className="sr-only">
                {description}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
