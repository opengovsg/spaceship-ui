"use client";

import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  useState,
  type ReactNode,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { iconTextWeightVariants } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";

// ─── Context ──────────────────────────────────────────────────────────────────

type ArtifactTabsContextValue = {
  disableMotion: boolean;
};

const ArtifactTabsContext = createContext<ArtifactTabsContextValue | null>(
  null,
);

function useArtifactTabsContext() {
  const ctx = useContext(ArtifactTabsContext);
  if (!ctx) throw new Error("ArtifactTab must be used inside ArtifactTabs");
  return ctx;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const artifactTabsVariants = cva(
  ["flex flex-nowrap items-center gap-2 overflow-x-auto p-2"],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border":
          "shadow-(--shadow-border) rounded-lg bg-(--bg-surface-base) p-2",
      },
    },
    defaultVariants: { surface: "default" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ArtifactTabsProps extends VariantProps<
  typeof artifactTabsVariants
> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disableMotion?: boolean;
  children: ReactNode;
  className?: string;
}

export interface ArtifactTabProps {
  value: string;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  /** Renders an unread dot — the Testing tab uses it once a prototype is built. */
  dotBadge?: boolean;
  /** Accessible label for `dotBadge`, since the dot itself is decorative. */
  dotBadgeLabel?: string;
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

/** Interleaves an arrow between each tab, so the row reads as a sequence. */
function withSeparators(children: ReactNode): ReactNode {
  const tabs = Children.toArray(children).filter(isValidElement);
  return tabs.map((tab, index) => (
    <Fragment key={tab.key ?? index}>
      {tab}
      {index < tabs.length - 1 && (
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 text-(--text-tertiary)"
        />
      )}
    </Fragment>
  ));
}

// ─── ArtifactTabs ─────────────────────────────────────────────────────────────

export function ArtifactTabs({
  value: controlledValue,
  defaultValue = "",
  onChange,
  disableMotion = false,
  surface,
  children,
  className,
}: ArtifactTabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  function handleChange(next: string) {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <ArtifactTabsContext.Provider value={{ disableMotion }}>
      <TabsPrimitive.Root value={value} onValueChange={handleChange}>
        <TabsPrimitive.List
          className={cn(artifactTabsVariants({ surface }), className)}
        >
          {withSeparators(children)}
        </TabsPrimitive.List>
      </TabsPrimitive.Root>
    </ArtifactTabsContext.Provider>
  );
}

// ─── ArtifactTab ──────────────────────────────────────────────────────────────

export function ArtifactTab({
  value,
  disabled = false,
  leadingIcon,
  dotBadge = false,
  dotBadgeLabel = "Has updates",
  children,
  className,
}: ArtifactTabProps) {
  const { disableMotion } = useArtifactTabsContext();

  return (
    <div className="relative shrink-0">
      <TabsPrimitive.Trigger value={value} disabled={disabled} asChild>
        <button
          type="button"
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2",
            "font-sans normal-case whitespace-nowrap",
            "text-body",
            iconTextWeightVariants({ weight: "bold" }),
            "shadow-(--shadow-border)",
            "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
            "disabled:pointer-events-none disabled:opacity-50",
            "data-[state=inactive]:bg-(--bg-surface-subtle) data-[state=inactive]:text-(--text-tertiary)",
            "data-[state=inactive]:hover:bg-(--bg-surface-brand-primary) data-[state=inactive]:hover:text-(--text-interactive-primary)",
            "data-[state=inactive]:active:bg-(--bg-surface-brand-tertiary) data-[state=inactive]:active:text-(--text-interactive-primary)",
            "data-[state=active]:bg-(--bg-surface-brand-secondary) data-[state=active]:text-(--text-interactive-primary) data-[state=active]:shadow-(--shadow-border-hover)",
            className,
          )}
        >
          <IconSlot icon={leadingIcon} />
          {children}
          {dotBadge && <span className="sr-only">{dotBadgeLabel}</span>}
        </button>
      </TabsPrimitive.Trigger>
      {dotBadge && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-1 -right-1"
        >
          {disableMotion ? (
            <span className="block size-3.5 rounded-full bg-(--bg-status-default-error)" />
          ) : (
            <motion.span
              className="block size-3.5 rounded-full bg-(--bg-status-default-error)"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ willChange: "transform" }}
            />
          )}
        </span>
      )}
    </div>
  );
}
