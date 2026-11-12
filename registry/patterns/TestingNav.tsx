"use client";

import { type ReactNode } from "react";
import {
  SidebarHoverGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  iconTextWeightVariants,
} from "#/components/ds/ui";
import { cn } from "#/components/ds/lib/classnames";

export interface TestingNavItem {
  id: string;
  title: string;
  /** Sora caption under the title, e.g. "Track usage on your prototype". */
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}

export interface TestingNavSection {
  /** Rendered in Sora + sentence case, e.g. `ANALYTICS`. */
  label: string;
  items: TestingNavItem[];
}

export interface TestingNavProps {
  sections: TestingNavSection[];
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
  disableMotion?: boolean;
}

/**
 * The left rail of the Testing tab. Sectioned rather than flat because the three
 * groups are different kinds of evidence — a report, instrumentation, and
 * interviews — and the officer picks a kind before picking a tool.
 */
export function TestingNav({
  sections,
  value,
  onChange,
  className,
  disableMotion = false,
}: TestingNavProps) {
  return (
    <nav className={cn(className)}>
      <SidebarHoverGroup
        className="gap-6"
        highlightClassName="rounded-(--radius-inner)"
        disableMotion={disableMotion}
      >
        {sections.map((section) => (
          <div key={section.label} className="flex flex-col gap-4">
            <h3 className="relative px-3.5 font-sans normal-case text-caption [font-weight:var(--font-weight-semibold)] text-(--text-placeholder)">
              {section.label}
            </h3>
            <ul className="flex flex-col gap-2">
              {section.items.map((item) => {
                const isActive = value === item.id;
                const reason =
                  item.disabledReason ?? "This tool is currently unavailable.";
                const button = (
                  <button
                    type="button"
                    disabled={item.disabled}
                    data-sidebar-row={item.disabled ? undefined : ""}
                    aria-current={isActive || undefined}
                    data-selected={isActive || undefined}
                    onClick={() => {
                      if (!item.disabled) onChange?.(item.id);
                    }}
                    className={cn(
                      iconTextWeightVariants({ weight: "semibold" }),
                      "relative flex w-full cursor-pointer items-start gap-2 rounded-(--radius-inner) px-3.5 py-2.5 text-left",
                      "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
                      "disabled:pointer-events-none disabled:opacity-50",
                      isActive ? "bg-(--bg-sidebar-selected)" : "",
                    )}
                  >
                    {item.icon && (
                      <span
                        aria-hidden
                        className={cn(
                          "inline-flex shrink-0 items-center justify-center [&>svg]:size-5",
                          isActive
                            ? "text-(--text-interactive-primary)"
                            : "text-(--text-tertiary)",
                        )}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span
                        className={cn("text-body", "text-(--text-primary)")}
                      >
                        {item.title}
                      </span>
                      {item.description && (
                        <span
                          className={cn(
                            "font-sans text-caption [font-weight:var(--font-weight-regular)]",
                            isActive
                              ? "text-(--text-secondary)"
                              : "text-(--text-tertiary)",
                          )}
                        >
                          {item.description}
                        </span>
                      )}
                    </span>
                  </button>
                );
                return (
                  <li key={item.id}>
                    {item.disabled ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              tabIndex={0}
                              aria-label={`${item.title}: ${reason}`}
                              data-sidebar-hover-disabled=""
                              className="relative block rounded-(--radius-inner) cursor-[url('/locked-cursor.svg')_8_8,not-allowed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)"
                            >
                              {button}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{reason}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      button
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </SidebarHoverGroup>
    </nav>
  );
}
