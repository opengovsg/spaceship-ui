"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { iconTextWeightVariants } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";
import { springs, staggers } from "#/components/ds/lib/motion";

/** Container orchestrates stagger timing for child action buttons. */
const actionsContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggers.actions.staggerChildren,
      delayChildren: staggers.actions.delayChildren,
    },
  },
  exit: {
    transition: {
      staggerChildren: staggers.actions.exitStagger,
      staggerDirection: -1,
    },
  },
};

/** Each action button fades + scales in; GPU-composited properties only. */
const actionButtonVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.4 },
};

// ─── Context ──────────────────────────────────────────────────────────────────

type FolderTabsContextValue = {
  value: string;
  disableMotion: boolean;
  activeActions: ReactNode;
};

const FolderTabsContext = createContext<FolderTabsContextValue | null>(null);

function useFolderTabsContext() {
  const ctx = useContext(FolderTabsContext);
  if (!ctx) throw new Error("FolderTab must be used inside FolderTabs");
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const folderTabsVariants = cva(
  ["flex items-center w-full", "font-sans"],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "shadow-(--shadow-border)",
      },
    },
    defaultVariants: { surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FolderTabsProps extends VariantProps<
  typeof folderTabsVariants
> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disableMotion?: boolean;
  layoutId?: string;
  activeActions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface FolderTabProps {
  value: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function IconSlot({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span className="inline-flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
      {icon}
    </span>
  );
}

// ─── FolderTabs ───────────────────────────────────────────────────────────────

export function FolderTabs({
  value: controlledValue,
  defaultValue = "",
  onChange,
  disableMotion = false,
  surface,
  activeActions,
  children,
  className,
}: FolderTabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  function handleChange(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <FolderTabsContext.Provider value={{ value, disableMotion, activeActions }}>
      <TabsPrimitive.Root value={value} onValueChange={handleChange}>
        <LayoutGroup>
          <TabsPrimitive.List
            className={cn(folderTabsVariants({ surface }), className)}
          >
            {children}
          </TabsPrimitive.List>
        </LayoutGroup>
      </TabsPrimitive.Root>
    </FolderTabsContext.Provider>
  );
}

// ─── FolderTab ────────────────────────────────────────────────────────────────

export function FolderTab({
  value,
  disabled = false,
  leadingIcon,
  children,
  className,
}: FolderTabProps) {
  const {
    value: groupValue,
    disableMotion,
    activeActions,
  } = useFolderTabsContext();
  const isActive = groupValue === value;

  const wrapperClasses = cn(
    "self-stretch shrink-0 overflow-hidden border-r border-(--bg-surface-tertiary) last:border-r-0 flex items-stretch",
    isActive
      ? "bg-(--bg-surface-base) border-b border-(--bg-surface-tertiary)"
      : "bg-(--bg-surface-secondary) border-b border-(--bg-surface-tertiary)",
  );

  const buttonClasses = cn(
    "relative z-10 flex items-center gap-2 flex-1 h-full p-2",
    "font-sans text-body whitespace-nowrap",
    iconTextWeightVariants({ weight: "semibold" }),
    "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer select-none",
    isActive
      ? "text-(--text-primary)"
      : "text-(--text-secondary) hover:text-(--text-primary)",
    className,
  );

  const actionItems = React.Children.toArray(
    React.isValidElement(activeActions) && activeActions.type === React.Fragment
      ? (activeActions.props as { children: ReactNode }).children
      : activeActions,
  );

  const actionsContent = disableMotion ? (
    isActive && activeActions ? (
      <span className="flex items-center gap-2 shrink-0 p-2">
        {actionItems}
      </span>
    ) : null
  ) : (
    <AnimatePresence mode="popLayout">
      {isActive && activeActions ? (
        <motion.span
          key="actions"
          className="flex items-center gap-2 shrink-0 p-2"
          variants={actionsContainerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {actionItems.map((child, index) => (
            <motion.span
              key={index}
              variants={actionButtonVariants}
              transition={springs.layout}
              style={{ willChange: "transform" }}
            >
              {child}
            </motion.span>
          ))}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );

  // The wrapper div handles layout animation and contains both the Radix Trigger
  // (the clickable button) and the actionsContent slot (rendered alongside, not inside).
  const content = (
    <>
      <TabsPrimitive.Trigger value={value} disabled={disabled} asChild>
        <button type="button" className={buttonClasses}>
          <motion.span
            layout="position"
            className="flex items-center gap-1.5 px-2"
          >
            <IconSlot icon={leadingIcon} />
            {children}
          </motion.span>
        </button>
      </TabsPrimitive.Trigger>
      {actionsContent}
    </>
  );

  if (disableMotion) {
    return (
      <div className={cn(wrapperClasses, isActive && "flex-1")}>{content}</div>
    );
  }

  return (
    <motion.div
      layout
      transition={{ layout: springs.layout }}
      className={cn(wrapperClasses, isActive && "flex-1")}
      style={{ willChange: "transform" }}
    >
      {content}
    </motion.div>
  );
}
