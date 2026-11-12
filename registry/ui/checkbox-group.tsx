"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

// ─── Context ──────────────────────────────────────────────────────────────────

type CheckboxGroupContextValue = {
  value: string[];
  onToggle: (value: string) => void;
  disableMotion: boolean;
};

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null,
);

function useCheckboxGroupContext() {
  const ctx = useContext(CheckboxGroupContext);
  if (!ctx) throw new Error("CheckboxItem must be used inside CheckboxGroup");
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const checkboxGroupVariants = cva(
  ["flex flex-col", "bg-(--bg-surface-base)", "rounded-xl overflow-hidden"],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "shadow-(--shadow-border)",
      },
    },
    defaultVariants: { surface: "shadow-border" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CheckboxGroupProps extends VariantProps<
  typeof checkboxGroupVariants
> {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  dividers?: boolean;
  disableMotion?: boolean;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export interface CheckboxItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

// ─── CheckboxGroup ────────────────────────────────────────────────────────────

export function CheckboxGroup({
  value: controlledValue,
  defaultValue = [],
  onChange,
  dividers = true,
  disableMotion = false,
  surface,
  children,
  className,
  "aria-label": ariaLabel,
}: CheckboxGroupProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  function handleToggle(item: string) {
    const next = value.includes(item)
      ? value.filter((v) => v !== item)
      : [...value, item];
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <CheckboxGroupContext.Provider
      value={{ value, onToggle: handleToggle, disableMotion }}
    >
      <div
        className={cn(checkboxGroupVariants({ surface }), className)}
        role="group"
        aria-label={ariaLabel}
      >
        {dividers ? splitWithDividers(children) : children}
      </div>
    </CheckboxGroupContext.Provider>
  );
}

// ─── CheckboxItem ─────────────────────────────────────────────────────────────

export function CheckboxItem({
  value,
  disabled = false,
  children,
  className,
}: CheckboxItemProps) {
  const {
    value: groupValue,
    onToggle,
    disableMotion,
  } = useCheckboxGroupContext();
  const isSelected = groupValue.includes(value);

  return (
    <CheckboxPrimitive.Root
      checked={isSelected}
      onCheckedChange={() => onToggle(value)}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg",
        "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
        "disabled:pointer-events-none disabled:opacity-50",
        "hover:bg-(--bg-surface-secondary)",
        className,
      )}
    >
      {/* Checkbox indicator */}
      <span
        className={cn(
          "flex items-center justify-center shrink-0",
          "w-5 h-5 rounded-sm",
          isSelected
            ? "bg-(--bg-interactive-primary-default)"
            : "bg-(--bg-surface-base) shadow-(--shadow-border)",
        )}
      >
        <CheckboxPrimitive.Indicator asChild>
          {disableMotion ? (
            <Check className="h-3 w-3 text-(--text-inverse)" strokeWidth={3} />
          ) : (
            <motion.span
              className="inline-flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springs.interactive}
              style={{ willChange: "transform" }}
            >
              <Check
                className="h-3 w-3 text-(--text-inverse)"
                strokeWidth={3}
              />
            </motion.span>
          )}
        </CheckboxPrimitive.Indicator>
      </span>

      {children}
    </CheckboxPrimitive.Root>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <SeparatorPrimitive.Root className="mx-4 h-px bg-(--bg-surface-secondary)" />
  );
}

function splitWithDividers(children: ReactNode): ReactNode {
  const arr = Array.isArray(children) ? children : [children];
  return arr.flatMap((child, i) =>
    i === 0 ? [child] : [<Divider key={`divider-${i}`} />, child],
  );
}
