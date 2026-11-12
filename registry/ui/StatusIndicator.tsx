import { cn } from "#/components/ds/lib/classnames";
import { useState } from "react";
import { useBoolean, useInterval } from "usehooks-ts";

interface StatusIndicatorProps {
  /** The status label to show. Do not include ellipses in the label. */
  label: string;

  /** The speed (in ms) at which ellipses will be animated. */
  ellipsesSpeed?: number;

  /** The maximum number of ellipses that should be shown. */
  maxEllipses?: number;

  /** The speed (in ms) at which the label should fade in and out. */
  pulseSpeed?: number;
}

/**
 * An animated text label that indicates a task is in progress, e.g. "Spaceship is building..."
 */
export const StatusIndicator = ({
  label,
  ellipsesSpeed = 500,
  maxEllipses = 3,
  pulseSpeed = 1500,
}: StatusIndicatorProps) => {
  const [ellipses, setEllipses] = useState(".");
  const { value: visible, toggle } = useBoolean(false);

  useInterval(() => {
    if (ellipses.length >= maxEllipses) {
      setEllipses(".");
    } else {
      setEllipses(ellipses + ".");
    }
  }, ellipsesSpeed);

  useInterval(() => {
    toggle();
  }, pulseSpeed);

  return (
    <span
      className={cn(
        "opacity-50 transition-opacity ease-in-out",
        visible && "opacity-100",
      )}
      style={{ transitionDuration: `${pulseSpeed}ms` }}
    >
      {label}
      {ellipses}
    </span>
  );
};
