"use client";

import { createContext, useContext, type ReactNode } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

// ─── Context ──────────────────────────────────────────────────────────────────

type RadioGroupContextValue = {
  disableMotion: boolean;
  indicator: "radio" | "none";
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioItem must be used inside RadioGroup");
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const radioGroupVariants = cva(
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

export interface RadioGroupProps extends VariantProps<
  typeof radioGroupVariants
> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  dividers?: boolean;
  disableMotion?: boolean;
  indicator?: "radio" | "none";
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export interface RadioItemProps {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

// ─── RadioGroup ───────────────────────────────────────────────────────────────

export function RadioGroup({
  value,
  defaultValue = "",
  onChange,
  dividers = true,
  disableMotion = false,
  indicator = "radio",
  surface,
  children,
  className,
  "aria-label": ariaLabel,
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ disableMotion, indicator }}>
      <RadioGroupPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        aria-label={ariaLabel}
        className={cn(radioGroupVariants({ surface }), className)}
      >
        {dividers ? splitWithDividers(children) : children}
      </RadioGroupPrimitive.Root>
    </RadioGroupContext.Provider>
  );
}

// ─── RadioItem ────────────────────────────────────────────────────────────────

export function RadioItem({
  value,
  disabled = false,
  children,
  className,
}: RadioItemProps) {
  const { disableMotion, indicator } = useRadioGroupContext();

  return (
    <RadioGroupPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "group/radio",
        "flex items-center gap-3 w-full px-4 py-3 text-left rounded-lg",
        "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=checked]:bg-(--bg-surface-secondary)",
        "data-[state=unchecked]:hover:bg-(--bg-surface-secondary)",
        className,
      )}
    >
      {/* Radio indicator */}
      {indicator === "radio" && (
        <span
          className={cn(
            "flex items-center justify-center shrink-0",
            "w-5 h-5 rounded-full",
            "group-data-[state=checked]/radio:bg-(--bg-interactive-primary-default)",
            "group-data-[state=unchecked]/radio:bg-(--bg-surface-base) group-data-[state=unchecked]/radio:shadow-(--shadow-border)",
          )}
        >
          <RadioGroupPrimitive.Indicator asChild>
            {disableMotion ? (
              <span className="w-2 h-2 rounded-full bg-(--text-inverse)" />
            ) : (
              <motion.span
                className="w-2 h-2 rounded-full bg-(--text-inverse)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springs.interactive}
                style={{ willChange: "transform" }}
              />
            )}
          </RadioGroupPrimitive.Indicator>
        </span>
      )}

      {children}
    </RadioGroupPrimitive.Item>
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
