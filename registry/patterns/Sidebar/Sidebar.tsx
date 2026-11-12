"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

export const SIDEBAR_WIDTH = 240;

interface SidebarProps {
  isOpen: boolean;
  disableMotion?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Collapsible left navigation rail — width slides between 0 and a fixed
 * content width. Pass the same `isOpen` flag driving the adjacent PageFrame
 * so the two animate in lockstep.
 */
export function Sidebar({
  isOpen,
  disableMotion = false,
  className,
  children,
}: SidebarProps) {
  return (
    <motion.div
      className={cn(
        "h-full shrink-0 overflow-clip bg-(--bg-sidebar)",
        className,
      )}
      initial={false}
      animate={{ width: isOpen ? SIDEBAR_WIDTH : 0 }}
      transition={disableMotion ? { duration: 0 } : springs.interactive}
    >
      <div
        inert={!isOpen}
        className="flex h-full flex-col p-4 pr-1"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {children}
      </div>
    </motion.div>
  );
}
