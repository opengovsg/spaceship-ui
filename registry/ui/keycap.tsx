"use client";

import React, { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";

// ─── CVA ─────────────────────────────────────────────────────────────────────

export const keycapVariants = cva(
  [
    "inline-flex items-center justify-center",
    "min-w-[26px] h-[22px] px-1.5",
    "rounded-sm",
    "font-sans text-caption [font-weight:var(--font-weight-semibold)]",
    "leading-none",
    "select-none",
  ],
  {
    variants: {
      variant: {
        default: "bg-(--bg-surface-base) text-(--text-tertiary)",
        lit: "bg-(--bg-status-warning) text-(--text-status-warning)",
      },
      surface: {
        default: "",
        "shadow-border": "",
      },
    },
    defaultVariants: {
      variant: "default",
      surface: "default",
    },
  },
);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KeycapProps
  extends HTMLMotionProps<"kbd">, VariantProps<typeof keycapVariants> {
  /** Programmatic press state — use to sync with actual keydown events. */
  pressed?: boolean;
  disableMotion?: boolean;
  children?: ReactNode;
}

export type KeycapVariant = NonNullable<
  VariantProps<typeof keycapVariants>["variant"]
>;

// ━━━ Keycap ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Fast snap spring — ζ = 80 / (2 × √2000) ≈ 0.89, no oscillation. */
const PRESS_SPRING = { type: "spring", stiffness: 2000, damping: 80 } as const;

export function Keycap({
  className,
  variant,
  surface,
  pressed = false,
  disableMotion = false,
  children,
  ...props
}: KeycapProps) {
  return (
    <motion.kbd
      {...props}
      animate={{ y: pressed ? 1 : 0 }}
      transition={disableMotion ? { duration: 0 } : PRESS_SPRING}
      style={{ willChange: "transform" }}
      className={cn(
        keycapVariants({ variant, surface }),
        "shadow-keycap",
        "hover:shadow-keycap-hover",
        "[transition:box-shadow_80ms_ease]",
        pressed && "shadow-keycap-pressed",
        !pressed && "active:shadow-keycap-pressed",
        className,
      )}
    >
      {children}
    </motion.kbd>
  );
}

// ━━━ KeyCombo — renders multiple keycaps with separator ━━━━━━━━━━━━━━━━━━━━━

export interface KeyComboProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Separator rendered between keys. Defaults to "+". */
  separator?: ReactNode;
  surface?: VariantProps<typeof keycapVariants>["surface"];
  children?: ReactNode;
}

export function KeyCombo({
  className,
  separator = "+",
  surface,
  children,
  ...props
}: KeyComboProps) {
  const keys = React.Children.toArray(children);
  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {keys.map((child, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span
              aria-hidden="true"
              className="text-caption [font-weight:var(--font-weight-semibold)] text-(--text-tertiary) font-sans select-none"
            >
              {separator}
            </span>
          )}
          {typeof child === "string" ? (
            <Keycap surface={surface}>{child}</Keycap>
          ) : (
            child
          )}
        </React.Fragment>
      ))}
    </span>
  );
}
