"use client";

import * as React from "react";
import { useState, createContext, useContext } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "#/components/ds/lib/classnames";

// ━━━ Open state context ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Shared open state so TooltipContent can animate entry/exit via AnimatePresence. */
const TooltipOpenContext = createContext(false);

// ━━━ TooltipProvider ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Re-exported directly — wrap once near the app root to share hover-intent
 *  timing across multiple tooltips, or per-instance for a standalone one. */
export const TooltipProvider = TooltipPrimitive.Provider;

// ━━━ Tooltip — root ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type TooltipRootProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Root
>;

/**
 * Root provider — tracks open state internally and exposes it via context so
 * TooltipContent can run Motion exit animations via AnimatePresence. Supports
 * both controlled (`open` + `onOpenChange`) and uncontrolled usage.
 */
export function Tooltip({
  open,
  onOpenChange,
  defaultOpen,
  children,
  ...props
}: TooltipRootProps) {
  const isControlled = open !== undefined;
  const [localOpen, setLocalOpen] = useState(defaultOpen ?? false);
  const isOpen = isControlled ? (open ?? false) : localOpen;

  function handleOpenChange(v: boolean) {
    if (!isControlled) setLocalOpen(v);
    onOpenChange?.(v);
  }

  return (
    <TooltipOpenContext.Provider value={isOpen}>
      <TooltipPrimitive.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipOpenContext.Provider>
  );
}

// ━━━ TooltipTrigger ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Trigger element. Use `asChild` to compose with a DS component — the child
 *  must forward its ref (e.g. via `forwardRef`) for positioning to work. */
export const TooltipTrigger = TooltipPrimitive.Trigger;

// ━━━ TooltipContent ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Props for TooltipContent */
export interface TooltipContentProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> {
  className?: string;
}

/**
 * Floating label rendered in a portal. Uses Motion AnimatePresence for a
 * fade+scale enter/exit, transform origin tracking Radix's computed anchor
 * point via CSS variable — same treatment as `DropdownMenuContent`.
 */
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, children, ...props }, ref) => {
  const isOpen = useContext(TooltipOpenContext);
  const reducedMotion = useReducedMotion();
  return (
    <TooltipPrimitive.Portal forceMount>
      <AnimatePresence>
        {isOpen && (
          <TooltipPrimitive.Content
            ref={ref}
            forceMount
            sideOffset={sideOffset}
            {...props}
            className="z-50 outline-none"
          >
            <motion.div
              className={cn(
                "max-w-64 rounded-md px-2.5 py-1.5",
                "bg-(--bg-surface-popover) shadow-(--shadow-border)",
                "font-sans text-body text-(--text-primary)",
                className,
              )}
              style={{
                transformOrigin:
                  "var(--radix-tooltip-content-transform-origin)",
                willChange: "transform",
              }}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                transition: {
                  duration: reducedMotion ? 0 : 0.08,
                  ease: "easeIn",
                },
              }}
              transition={{
                duration: reducedMotion ? 0 : 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {children}
            </motion.div>
          </TooltipPrimitive.Content>
        )}
      </AnimatePresence>
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
