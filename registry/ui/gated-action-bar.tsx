"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Lock } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCALE = { hover: 1.01, tap: 0.99 };

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const gatedActionBarVariants = cva(
  [
    "flex w-full items-center justify-between gap-2",
    "p-4 rounded-lg",
    "font-sans text-body [font-weight:var(--font-weight-semibold)]",
    "transition-colors duration-(--duration-base) ease-(--ease-in-out)",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
    "focus-visible:ring-(--border-input-focus)",
  ],
  {
    variants: {
      state: {
        locked: [
          "border border-dashed border-(--border-default) bg-(--bg-surface-tertiary)",
          "text-(--text-interactive-disabled) cursor-not-allowed",
        ],
        unlocked: [
          "bg-(--bg-interactive-primary-default) text-(--text-inverse)",
          "hover:bg-(--bg-interactive-primary-hover)",
          "active:bg-(--bg-interactive-primary-pressed)",
          "cursor-pointer",
        ],
      },
      surface: {
        default: "",
        "shadow-border": "",
      },
    },
    compoundVariants: [
      // Only the unlocked bar reads as raised; a locked one stays flat so the
      // dashed border remains the thing that signals "not yet".
      {
        state: "unlocked",
        surface: "shadow-border",
        className: "shadow-(--shadow-border)",
      },
    ],
    defaultVariants: { state: "locked", surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GatedActionBarProps
  extends
    Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof gatedActionBarVariants> {
  children?: ReactNode;
  /** Overrides the state's default trailing icon (`Lock` / `ArrowRight`). */
  trailingIcon?: ReactNode;
  disableMotion?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GatedActionBar = forwardRef<
  HTMLButtonElement,
  GatedActionBarProps
>(function GatedActionBar(
  {
    state = "locked",
    surface,
    trailingIcon,
    disableMotion = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const isLocked = state === "locked";
  const classes = cn(gatedActionBarVariants({ state, surface }), className);
  const content = (
    <>
      <span className="text-left">{children}</span>
      <span className="inline-flex shrink-0 items-center justify-center [&>svg]:size-5">
        {trailingIcon ?? (isLocked ? <Lock /> : <ArrowRight />)}
      </span>
    </>
  );

  // A locked bar is a real disabled button — it must not be focusable as an
  // action, and it must not animate.
  if (isLocked || disableMotion) {
    return (
      <button
        ref={ref}
        type="button"
        aria-disabled={isLocked || undefined}
        tabIndex={isLocked ? -1 : undefined}
        className={classes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        onClick={isLocked ? undefined : props.onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      className={classes}
      {...props}
      whileHover={{ scale: SCALE.hover }}
      whileTap={{ scale: SCALE.tap }}
      transition={springs.interactive}
      style={{ willChange: "transform" }}
    >
      {content}
    </motion.button>
  );
});
