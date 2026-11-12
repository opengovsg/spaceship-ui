"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

// ζ = 30 / (2 × √400) = 0.75 ✓
const MODAL_SPRING = springs.interactive;

const modalVariants = cva(
  [
    "flex flex-col bg-(--bg-surface-overlay)",
    "rounded-lg overflow-hidden",
    "w-full max-w-lg",
    "p-3",
    "gap-8",
  ],
  {
    variants: {
      surface: {
        default: "shadow-(--shadow-border)",
        "shadow-border":
          "shadow-(--shadow-border) transition-shadow duration-(--duration-base) ease-(--ease-in-out)",
      },
    },
    defaultVariants: {
      surface: "default",
    },
  },
);

export interface ModalProps extends VariantProps<typeof modalVariants> {
  size?: "md" | "lg" | "xl";
  closeOnBackdropClick?: boolean;
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  className?: string;
  disableMotion?: boolean;
  /** Used when the original opener was removed while the dialog was open. */
  returnFocusFallback?: () => HTMLElement | null;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

export function ModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2 p-1", className)} {...props} />
  );
}

export function ModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DialogPrimitive.Title asChild>
      <h2
        className={cn(
          "font-sans text-title font-semibold",
          "text-(--text-primary)",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Title>
  );
}

export function ModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <DialogPrimitive.Description asChild>
      <p
        className={cn(
          "font-sans text-body font-normal",
          "text-(--text-secondary)",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Description>
  );
}

export function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-end gap-3", className)}
      {...props}
    />
  );
}

export function Modal({
  open,
  size = "md",
  closeOnBackdropClick = true,
  onClose,
  children,
  className,
  surface,
  disableMotion = false,
  returnFocusFallback,
  "aria-labelledby": labelledby,
  "aria-describedby": describedby,
}: ModalProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open)
      returnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
  }, [open]);
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  key="modal-backdrop"
                  className="fixed inset-0 z-50 flex items-center justify-center px-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <div
                    className="absolute inset-0 bg-(--overlay-medium)"
                    aria-hidden="true"
                  />

                  {/* Dialog panel */}
                  <DialogPrimitive.Content
                    forceMount
                    onCloseAutoFocus={(event) => {
                      const target = returnFocus.current?.isConnected
                        ? returnFocus.current
                        : returnFocusFallback?.();
                      if (target?.isConnected) {
                        event.preventDefault();
                        target.focus();
                      }
                    }}
                    {...(labelledby ? { "aria-labelledby": labelledby } : {})}
                    aria-describedby={describedby}
                    onPointerDownOutside={(event) => {
                      if (!closeOnBackdropClick) event.preventDefault();
                    }}
                    className={cn(
                      "relative z-10 w-full outline-none",
                      { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[
                        size
                      ],
                    )}
                  >
                    <motion.div
                      className={cn(
                        modalVariants({ surface }),
                        "max-w-none max-h-[90dvh]",
                        className,
                      )}
                      style={{ willChange: "transform" }}
                      initial={disableMotion ? {} : { scale: 0.95, y: 8 }}
                      animate={disableMotion ? {} : { scale: 1, y: 0 }}
                      exit={disableMotion ? {} : { scale: 0.95, y: 8 }}
                      transition={MODAL_SPRING}
                    >
                      {children}
                    </motion.div>
                  </DialogPrimitive.Content>
                </motion.div>
              </DialogPrimitive.Overlay>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { modalVariants };
