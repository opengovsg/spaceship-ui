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
import { springs, scales } from "#/components/ds/lib/motion";

// ─── Context ──────────────────────────────────────────────────────────────────

type FolderTabsV2ContextValue = {
  value: string;
  disableMotion: boolean;
  layoutId: string;
};

const FolderTabsV2Context = createContext<FolderTabsV2ContextValue | null>(
  null,
);

function useFolderTabsV2Context() {
  const ctx = useContext(FolderTabsV2Context);
  if (!ctx) throw new Error("FolderTabV2 must be used inside FolderTabsV2");
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const folderTabsV2Variants = cva(["inline-flex items-end"], {
  variants: {
    surface: {
      default: "",
      "shadow-border": "",
    },
  },
  defaultVariants: { surface: "default" },
});

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FolderTabsV2Props extends VariantProps<
  typeof folderTabsV2Variants
> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disableMotion?: boolean;
  layoutId?: string;
  /** Action button rendered before the tab list, separated by a divider. Not a tab. */
  leadingAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface FolderTabV2Props {
  value: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Scale variants for non-active tab triggers — mirrors Button ghost sm animation. */
const TAB_VARIANTS = {
  idle: { scale: 1 },
  hover: { scale: scales.prominent.hover },
  tap: { scale: scales.prominent.tap },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Wraps icon in a fixed-size slot; renders nothing if no icon provided. */
function IconSlot({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span className="inline-flex shrink-0 items-center justify-center [&>svg]:size-4">
      {icon}
    </span>
  );
}

// ─── FolderTabsV2 ─────────────────────────────────────────────────────────────

export function FolderTabsV2({
  value: controlledValue,
  defaultValue = "",
  onChange,
  disableMotion = false,
  layoutId: layoutIdProp,
  leadingAction,
  surface,
  children,
  className,
}: FolderTabsV2Props) {
  const autoId = useId();
  const layoutId = layoutIdProp ?? autoId;

  // ─── Tab value state ───────────────────────────────────────────────────────
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  function handleChange(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <FolderTabsV2Context.Provider value={{ value, disableMotion, layoutId }}>
      <TabsPrimitive.Root value={value} onValueChange={handleChange}>
        <div className={cn(folderTabsV2Variants({ surface }), className)}>
          {/* ─── Leading action ─────────────────────────────────────────── */}
          {leadingAction && (
            <>
              {leadingAction}
              <div
                aria-hidden
                className="w-px self-stretch my-1 bg-(--bg-surface-tertiary)"
              />
            </>
          )}

          {/* ─── Tab list ───────────────────────────────────────────────── */}
          <TabsPrimitive.List className="flex items-end gap-1 px-1 pt-1">
            {children}
          </TabsPrimitive.List>
        </div>
      </TabsPrimitive.Root>
    </FolderTabsV2Context.Provider>
  );
}

// ─── FolderTabV2 ─────────────────────────────────────────────────────────────

export function FolderTabV2({
  value,
  disabled = false,
  leadingIcon,
  children,
  className,
}: FolderTabV2Props) {
  const {
    value: groupValue,
    disableMotion,
    layoutId,
  } = useFolderTabsV2Context();
  const isActive = groupValue === value;
  const iconOnly = !children;

  return (
    <div className="relative">
      {isActive &&
        (disableMotion ? (
          <div className="absolute inset-0 rounded-t-lg bg-(--bg-surface-base)" />
        ) : (
          <motion.div
            layoutId={layoutId}
            className="absolute inset-0 rounded-t-lg bg-(--bg-surface-base)"
            transition={springs.interactive}
            style={{ willChange: "transform" }}
          />
        ))}
      <TabsPrimitive.Trigger value={value} disabled={disabled} asChild>
        <motion.button
          type="button"
          variants={TAB_VARIANTS}
          initial="idle"
          whileHover={
            !isActive && !disabled && !disableMotion ? "hover" : undefined
          }
          whileTap={
            !isActive && !disabled && !disableMotion ? "tap" : undefined
          }
          transition={springs.interactive}
          style={{ willChange: "transform" }}
          className={cn(
            "relative z-10 flex items-center justify-center gap-1.5 cursor-pointer select-none",
            "font-sans text-body whitespace-nowrap",
            iconTextWeightVariants({ weight: "regular" }),
            "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
            "disabled:pointer-events-none disabled:opacity-50",
            iconOnly ? "size-7" : "px-2.5 py-1",
            isActive
              ? "text-(--text-primary)"
              : "text-(--text-tertiary) hover:text-(--text-primary)",
            className,
          )}
        >
          <IconSlot icon={leadingIcon} />
          {children}
        </motion.button>
      </TabsPrimitive.Trigger>
    </div>
  );
}
