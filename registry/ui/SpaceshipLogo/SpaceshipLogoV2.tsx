"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SpaceshipMark } from "./SpaceshipMark";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SpaceshipLogoV2Props {
  width?: number;
  /** Omit to follow the application theme. */
  treatment?: "graphite" | "silver";
  interactive?: boolean;
  fleeRadius?: number;
  maxDisplacement?: number;
  /** @deprecated The current logo has no beam. */
  beamDuration?: number;
  /** @deprecated The current logo has no beam. */
  beamSkewRange?: number;
  disableMotion?: boolean;
  /** @deprecated The current logo has no beam. */
  showBeam?: boolean;
  className?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
}

// ── SpaceshipLogoV2 ───────────────────────────────────────────────────────────

export function SpaceshipLogoV2({
  width = 180,
  treatment,
  interactive = true,
  fleeRadius = 300,
  maxDisplacement = 100,
  disableMotion = false,
  className,
  onMouseEnter,
}: SpaceshipLogoV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for flee physics
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 80, damping: 18 });
  const y = useSpring(rawY, { stiffness: 80, damping: 18 });
  const rotate = useTransform(
    x,
    [-maxDisplacement, maxDisplacement],
    [-30, 30],
  );

  // Mouse-flee logic
  useEffect(() => {
    if (!interactive || disableMotion) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < fleeRadius) {
        const strength = (fleeRadius - dist) / fleeRadius;
        const fleeX = -(dx / dist) * strength * maxDisplacement;
        const fleeY = -(dy / dist) * strength * maxDisplacement;
        rawX.set(Math.max(-maxDisplacement, Math.min(maxDisplacement, fleeX)));
        rawY.set(Math.max(-maxDisplacement, Math.min(maxDisplacement, fleeY)));
      } else {
        rawX.set(0);
        rawY.set(0);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, disableMotion, fleeRadius, maxDisplacement, rawX, rawY]);

  const mark = <SpaceshipMark treatment={treatment} className="block w-full" />;

  if (disableMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{ width }}
        onMouseEnter={onMouseEnter}
      >
        {mark}
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{ x, y, rotate, width }}
      onMouseEnter={onMouseEnter}
    >
      {mark}
    </motion.div>
  );
}
