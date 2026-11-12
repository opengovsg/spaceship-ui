"use client";

import type { HTMLAttributes } from "react";
import { ThinkingOrb as LibraryOrb, type OrbState } from "thinking-orbs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { useSystemReducedMotion } from "./use-reduced-motion";

export type ThinkingOrbState = OrbState;

export const thinkingOrbVariants = cva(
  ["inline-flex shrink-0 items-center justify-center"],
  {
    variants: {
      size: {
        sm: "size-5",
        md: "size-8",
        lg: "size-12",
        xl: "size-16",
        "2xl": "size-40",
      },
      surface: {
        default: "",
        "shadow-border": "rounded-full shadow-(--shadow-border)",
      },
    },
    defaultVariants: { size: "lg", surface: "default" },
  },
);

export interface ThinkingOrbProps
  extends
    HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof thinkingOrbVariants> {
  state?: ThinkingOrbState;
  /** Accessible description. Use an empty label beside an existing status label. */
  label?: string;
  disableMotion?: boolean;
  color?: string;
  canvasColor?: string;
}

/** Libraries.dev orb, with Spaceship sizing and accessibility conventions. */
export function ThinkingOrb({
  state = "searching",
  label = "Loading",
  disableMotion = false,
  size = "lg",
  surface,
  className,
  color,
  canvasColor,
  ...props
}: ThinkingOrbProps) {
  const reducedMotion = useSystemReducedMotion();
  // Inline and compact presets have their own particle density; larger sizes
  // use the library's avatar preset, scaled into the existing DS size slots.
  const preset = size === "sm" ? 20 : size === "md" ? 32 : 64;

  return (
    <span
      {...props}
      className={cn(thinkingOrbVariants({ size, surface }), className)}
    >
      {label && <VisuallyHidden>{label}</VisuallyHidden>}
      <LibraryOrb
        state={state}
        color={color}
        size={preset}
        theme="auto"
        paused={disableMotion || reducedMotion}
        aria-hidden="true"
        style={{ width: "100%", height: "100%", backgroundColor: canvasColor }}
      />
    </span>
  );
}
