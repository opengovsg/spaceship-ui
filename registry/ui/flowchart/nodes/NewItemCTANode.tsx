"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "#/components/ds/lib/classnames";
import { springs, scales } from "#/components/ds/lib/motion";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface NewItemCTANodeProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disableMotion?: boolean;
  className?: string;
}

// ─── NewItemCTANode ───────────────────────────────────────────────────────────

/** Clickable card prompting creation of a new item (e.g. "Create a new prototype"). */
export function NewItemCTANode({
  icon,
  label,
  onClick,
  disableMotion = false,
  className,
}: NewItemCTANodeProps) {
  const classes = cn(
    "flex h-[138px] w-full box-border flex-col items-center justify-center gap-2 rounded-(--radius-lg) border border-dashed p-4 font-sans",
    "border-(--border-brand-subtle) bg-(--bg-surface-brand-subtle) text-(--text-interactive-primary)",
    "cursor-pointer transition-colors duration-(--duration-base) ease-(--ease-in-out)",
    "hover:bg-(--bg-surface-brand-secondary)",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--border-input-focus)",
    className,
  );

  if (disableMotion) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        <span className="text-caption">{label}</span>
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      className={classes}
      style={{ willChange: "transform" }}
      onClick={onClick}
      variants={{
        idle: { scale: 1 },
        hover: { scale: scales.subtle.hover },
        tap: { scale: scales.subtle.tap },
      }}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      transition={springs.interactive}
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <span className="text-caption">{label}</span>
    </motion.button>
  );
}
