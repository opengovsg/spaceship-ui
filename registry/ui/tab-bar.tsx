"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ReactNode,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { iconTextWeightVariants } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

// ─── Context ──────────────────────────────────────────────────────────────────

type TabBarContextValue = {
  value: string;
  disableMotion: boolean;
  layoutId: string;
};

const TabBarContext = createContext<TabBarContextValue | null>(null);

function useTabBarContext() {
  const ctx = useContext(TabBarContext);
  if (!ctx) throw new Error("TabBarItem must be used inside TabBar");
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const tabBarVariants = cva(
  [
    "flex items-center gap-0.5",
    "bg-(--bg-surface-secondary)",
    "rounded-lg",
    "p-1",
  ],
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

export interface TabBarProps extends VariantProps<typeof tabBarVariants> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disableMotion?: boolean;
  layoutId?: string;
  children: ReactNode;
  className?: string;
}

export interface TabBarItemProps {
  value: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function IconSlot({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span className="inline-flex shrink-0 items-center justify-center [&>svg]:size-4">
      {icon}
    </span>
  );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────

export function TabBar({
  value: controlledValue,
  defaultValue = "",
  onChange,
  disableMotion = false,
  layoutId: layoutIdProp,
  surface,
  children,
  className,
}: TabBarProps) {
  const autoId = useId();
  const layoutId = layoutIdProp ?? autoId;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  function handleChange(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <TabBarContext.Provider value={{ value, disableMotion, layoutId }}>
      <TabsPrimitive.Root value={value} onValueChange={handleChange}>
        <TabsPrimitive.List
          className={cn(tabBarVariants({ surface }), className)}
        >
          {children}
        </TabsPrimitive.List>
      </TabsPrimitive.Root>
    </TabBarContext.Provider>
  );
}

// ─── TabBarItem ───────────────────────────────────────────────────────────────

export function TabBarItem({
  value,
  disabled = false,
  leadingIcon,
  trailingIcon,
  badge,
  children,
  className,
}: TabBarItemProps) {
  const { value: groupValue, disableMotion, layoutId } = useTabBarContext();
  const isActive = groupValue === value;

  return (
    <div className="relative">
      {isActive &&
        (disableMotion ? (
          <div className="absolute inset-0 rounded-md bg-(--bg-surface-base) shadow-(--shadow-border)" />
        ) : (
          <motion.div
            layoutId={layoutId}
            className="absolute inset-0 rounded-md bg-(--bg-surface-base) shadow-(--shadow-border)"
            transition={springs.interactive}
            style={{ willChange: "transform" }}
          />
        ))}
      <TabsPrimitive.Trigger value={value} disabled={disabled} asChild>
        <button
          type="button"
          className={cn(
            "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer",
            "font-sans text-body whitespace-nowrap",
            iconTextWeightVariants({ weight: "semibold" }),
            "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
            "disabled:pointer-events-none disabled:opacity-50",
            isActive
              ? "text-(--text-primary)"
              : "text-(--text-tertiary) hover:text-(--text-secondary)",
            className,
          )}
        >
          <IconSlot icon={leadingIcon} />
          {children}
          <IconSlot icon={trailingIcon} />
          {badge}
        </button>
      </TabsPrimitive.Trigger>
    </div>
  );
}
