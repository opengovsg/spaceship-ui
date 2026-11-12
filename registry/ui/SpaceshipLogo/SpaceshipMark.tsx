import type { SVGProps } from "react";
import { cn } from "#/components/ds/lib/classnames";
import "./SpaceshipMark.css";

export type SpaceshipMarkTreatment = "graphite" | "silver";

export interface SpaceshipMarkProps {
  /** Omit to follow the application's data-theme setting. */
  treatment?: SpaceshipMarkTreatment;
  className?: string;
}

/** Decorative brand artwork; the containing control supplies its accessible name. */
export function SpaceshipMark({ treatment, className }: SpaceshipMarkProps) {
  return (
    <span
      aria-hidden="true"
      data-treatment={treatment}
      className={cn("spaceship-mark inline-block", className)}
    >
      <img
        src="/branding/spaceship-graphite.svg"
        alt=""
        draggable={false}
        width={100}
        height={100}
        className="spaceship-mark-graphite block h-full w-full object-contain"
      />
      <img
        src="/branding/spaceship-silver.svg"
        alt=""
        draggable={false}
        width={100}
        height={100}
        className="spaceship-mark-silver block h-full w-full object-contain"
      />
    </span>
  );
}

export interface SpaceshipMarkImageProps extends SVGProps<SVGImageElement> {
  /** Omit to follow the application's data-theme setting. */
  treatment?: SpaceshipMarkTreatment;
}

/** The same themed artwork inside an SVG animation viewport. */
export function SpaceshipMarkImage({
  treatment,
  className,
  ...props
}: SpaceshipMarkImageProps) {
  return (
    <g aria-hidden="true" data-treatment={treatment} className="spaceship-mark">
      <image
        {...props}
        href="/branding/spaceship-graphite.svg"
        preserveAspectRatio="xMidYMid meet"
        className={cn("spaceship-mark-graphite", className)}
      />
      <image
        {...props}
        href="/branding/spaceship-silver.svg"
        preserveAspectRatio="xMidYMid meet"
        className={cn("spaceship-mark-silver", className)}
      />
    </g>
  );
}
