import { cva } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { SpaceshipMark, type SpaceshipMarkTreatment } from "./SpaceshipMark";

import "./SpaceshipWordmark.css";

export const spaceshipWordmarkVariants = cva(
  ["spaceship-wordmark font-display text-title font-bold"],
  {
    variants: {
      markPosition: {
        inline: "inline-flex items-center gap-[0.5em]",
        hanging:
          "relative inline-block [&>.spaceship-mark]:absolute [&>.spaceship-mark]:top-1/2 [&>.spaceship-mark]:right-[calc(100%+0.5em)] [&>.spaceship-mark]:-translate-y-1/2",
      },
    },
    defaultVariants: { markPosition: "inline" },
  },
);

export interface SpaceshipWordmarkProps {
  /** Omit to follow the application's data-theme setting. */
  treatment?: SpaceshipMarkTreatment;
  /**
   * `inline` lays the mark out beside the word. `hanging` positions the mark
   * absolutely to the left so the word alone sets the width, which keeps the
   * word optically centred in centred layouts.
   */
  markPosition?: "inline" | "hanging";
  /** Override the type size here (e.g. `text-display`); the mark scales with it. */
  className?: string;
}

/**
 * Brand lockup: planet mark + "Spaceship" in Syne Bold.
 * The mark is as tall as the title line height (22px / 16px = 1.375em) and
 * is centred vertically on the word.
 */
export function SpaceshipWordmark({
  treatment,
  markPosition = "inline",
  className,
}: SpaceshipWordmarkProps) {
  return (
    <span
      role="img"
      aria-label="Spaceship"
      data-treatment={treatment}
      className={cn(spaceshipWordmarkVariants({ markPosition }), className)}
    >
      <SpaceshipMark
        treatment={treatment}
        className="size-[1.375em] shrink-0"
      />
      <span aria-hidden="true">Spaceship</span>
    </span>
  );
}
