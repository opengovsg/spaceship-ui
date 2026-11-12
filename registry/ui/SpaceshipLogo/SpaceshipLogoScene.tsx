"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SpaceshipLogoV2 } from "./SpaceshipLogoV2";
import { SpaceshipPlanet } from "./SpaceshipPlanet";
import { SpaceshipStar } from "./SpaceshipStar";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SceneDecoration {
  /** Any React node — typically <SpaceshipPlanet /> or <SpaceshipStar /> */
  element: React.ReactNode;
  /** Absolute position offsets relative to the logo container (scaled with width) */
  position: { top?: number; right?: number; bottom?: number; left?: number };
  /** If true, renders behind the logo (z-index 5 vs 15). Default: true */
  behind?: boolean;
  /** Degrees to spin when cursor is near. Default: 180 (stars). Use 90 for planets. */
  fleeRotation?: number;
}

export interface SpaceshipLogoSceneProps {
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
  decorations?: SceneDecoration[];
  className?: string;
}

// ── Default decorations (authored at width=180) ───────────────────────────────

const DEFAULT_DECORATIONS: SceneDecoration[] = [
  // Two stars — above the saucer, behind (default fleeRotation: 180)
  {
    element: <SpaceshipStar size={20} />,
    position: { top: -16, left: 58 },
    behind: true,
  },
  {
    element: <SpaceshipStar size={14} />,
    position: { top: 0, left: 78 },
    behind: true,
  },
  // Lilac planet — bottom-left, large, behind saucer
  {
    element: <SpaceshipPlanet color="#C3A8FF" size={32} />,
    position: { top: 72, left: -40 },
    behind: true,
    fleeRotation: 90,
  },
  // Mint planet — far right, further out to the side
  {
    element: <SpaceshipPlanet color="#26E6B5" size={20} />,
    position: { top: 6, right: -48 },
    behind: true,
    fleeRotation: 90,
  },
];

// ── SpaceshipLogoScene ────────────────────────────────────────────────────────

export function SpaceshipLogoScene({
  width = 180,
  treatment,
  interactive = true,
  fleeRadius: fleeRadiusProp,
  maxDisplacement = 100,
  disableMotion = false,
  decorations = DEFAULT_DECORATIONS,
  className,
}: SpaceshipLogoSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResting, setIsResting] = useState(true);
  const isRestingRef = useRef(true);

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
  const fleeRadius = fleeRadiusProp ?? width * 0.5;

  const totalH = (width * 380) / 405;

  // Position scale — all decoration offsets authored at width=180
  const ps = width / 180;

  // Mouse-flee and decoration scatter
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
        if (isRestingRef.current) {
          isRestingRef.current = false;
          setIsResting(false);
        }
      } else {
        rawX.set(0);
        rawY.set(0);
        if (!isRestingRef.current) {
          isRestingRef.current = true;
          setIsResting(true);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, disableMotion, fleeRadius, maxDisplacement, rawX, rawY]);

  const behindDecorations = decorations.filter((d) => d.behind !== false);
  const frontDecorations = decorations.filter((d) => d.behind === false);

  // Compute a scatter vector pointing away from the logo center for a decoration
  const logoCenterX = width / 2;
  const logoCenterY = totalH / 2;

  function getScatterOffset(pos: SceneDecoration["position"]) {
    const decX =
      pos.left !== undefined ? pos.left * ps : width - (pos.right ?? 0) * ps;
    const decY =
      pos.top !== undefined ? pos.top * ps : totalH - (pos.bottom ?? 0) * ps;
    const dx = decX - logoCenterX;
    const dy = decY - logoCenterY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const scatterDist = 30 * ps; // 30px at reference scale
    return { x: (dx / len) * scatterDist, y: (dy / len) * scatterDist };
  }

  function renderDecoration(
    d: SceneDecoration,
    i: number,
    zIndex: number,
    animated: boolean,
  ) {
    const pos = d.position;
    const originY = pos.bottom !== undefined ? "bottom" : "top";
    const originX = pos.right !== undefined ? "right" : "left";
    const posStyle = {
      position: "absolute" as const,
      zIndex,
      top: pos.top !== undefined ? pos.top * ps : undefined,
      right: pos.right !== undefined ? pos.right * ps : undefined,
      bottom: pos.bottom !== undefined ? pos.bottom * ps : undefined,
      left: pos.left !== undefined ? pos.left * ps : undefined,
    };

    const scaledElement = (
      <div
        style={{
          transform: `scale(${ps})`,
          transformOrigin: `${originY} ${originX}`,
        }}
      >
        {d.element}
      </div>
    );

    if (!animated) {
      return (
        <div key={i} style={posStyle}>
          {scaledElement}
        </div>
      );
    }

    const scatter = getScatterOffset(pos);
    const isScattered = !isResting;

    return (
      <motion.div
        key={i}
        style={posStyle}
        animate={{
          x: isScattered ? scatter.x : 0,
          y: isScattered ? scatter.y : 0,
          rotate: isScattered ? (d.fleeRotation ?? 180) : 0,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        {scaledElement}
      </motion.div>
    );
  }

  if (disableMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width,
          height: totalH,
          position: "relative",
          overflow: "visible",
        }}
      >
        {behindDecorations.map((d, i) => renderDecoration(d, i, 5, false))}
        <div style={{ position: "relative", zIndex: 10 }}>
          <SpaceshipLogoV2
            width={width}
            treatment={treatment}
            interactive={false}
            disableMotion
          />
        </div>
        {frontDecorations.map((d, i) => renderDecoration(d, i, 15, false))}
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className={className}
      style={{
        x,
        y,
        width,
        height: totalH,
        position: "relative",
        overflow: "visible",
      }}
    >
      {behindDecorations.map((d, i) => renderDecoration(d, i, 5, true))}
      <motion.div style={{ rotate, position: "absolute", inset: 0, zIndex: 6 }}>
        <div style={{ position: "relative", zIndex: 10 }}>
          <SpaceshipLogoV2
            width={width}
            treatment={treatment}
            interactive={false}
          />
        </div>
      </motion.div>
      {frontDecorations.map((d, i) => renderDecoration(d, i, 15, true))}
    </motion.div>
  );
}
