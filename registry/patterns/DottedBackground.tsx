import { type CSSProperties, type ReactNode } from "react";
import { cn } from "#/components/ds/lib/classnames";

const DOT_COLOR = "#D0D4DA";
const DOT_SIZE = 2;
const DOT_SPACING = 24;

const dotPatternStyle: CSSProperties = {
  backgroundImage: `radial-gradient(circle, ${DOT_COLOR} ${DOT_SIZE / 2}px, transparent ${DOT_SIZE / 2}px)`,
  backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
};

interface DottedBackgroundProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Surface backdrop tiled with a fixed-size dot grid. Wrap a full-height
 * container (e.g. a route layout) to apply it behind the content.
 */
export function DottedBackground({
  className,
  children,
}: DottedBackgroundProps) {
  return (
    <div
      className={cn("bg-(--bg-surface-base)", className)}
      style={dotPatternStyle}
    >
      {children}
    </div>
  );
}
