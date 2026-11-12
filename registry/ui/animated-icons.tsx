import { motion, useReducedMotion, type SVGMotionProps } from "framer-motion";
import { cn } from "#/components/ds/lib/classnames";

/** Lucide Animated adaptations; see animated-icons.LICENSE.md for provenance. */
export interface AnimatedIconProps extends Omit<
  SVGMotionProps<SVGSVGElement>,
  "animate" | "children"
> {
  /** Controlled by the containing action's hover and focus states. */
  animate?: boolean;
  disableMotion?: boolean;
}

const REFRESH_TRANSITION = {
  type: "spring" as const,
  stiffness: 250,
  damping: 25,
};
// Damping raised from upstream's 17 to meet the DS damping ratio of at least 0.7.
const COPY_TRANSITION = {
  type: "spring" as const,
  stiffness: 160,
  damping: 18,
  mass: 1,
};
const STILL_TRANSITION = { duration: 0 };

/** Decorative icon: label the containing action instead of the SVG. */
export function AnimatedRefreshCwIcon({
  animate = false,
  disableMotion = false,
  className,
  width = "1em",
  height = "1em",
  ...props
}: AnimatedIconProps) {
  const reducedMotion = useReducedMotion();
  const motionDisabled = disableMotion || reducedMotion !== false;

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn("lucide lucide-refresh-cw", className)}
      aria-hidden="true"
      focusable="false"
      initial={false}
      animate={animate && !motionDisabled ? "animate" : "normal"}
      variants={{ normal: { rotate: "0deg" }, animate: { rotate: "50deg" } }}
      transition={motionDisabled ? STILL_TRANSITION : REFRESH_TRANSITION}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </motion.svg>
  );
}

/** Decorative icon: label the containing action instead of the SVG. */
export function AnimatedCopyIcon({
  animate = false,
  disableMotion = false,
  className,
  width = "1em",
  height = "1em",
  ...props
}: AnimatedIconProps) {
  const reducedMotion = useReducedMotion();
  const motionDisabled = disableMotion || reducedMotion !== false;
  const transition = motionDisabled ? STILL_TRANSITION : COPY_TRANSITION;

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      className={cn("lucide lucide-copy", className)}
      aria-hidden="true"
      focusable="false"
      initial={false}
      animate={animate && !motionDisabled ? "animate" : "normal"}
    >
      <motion.rect
        x="8"
        y="8"
        width="14"
        height="14"
        rx="2"
        ry="2"
        variants={{
          normal: { translateY: 0, translateX: 0 },
          animate: { translateY: -3, translateX: -3 },
        }}
        transition={transition}
      />
      <motion.path
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        variants={{ normal: { x: 0, y: 0 }, animate: { x: 3, y: 3 } }}
        transition={transition}
      />
    </motion.svg>
  );
}
