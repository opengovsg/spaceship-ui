"use client";

import {
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "#/components/ds/lib/classnames";
import { SidebarHoverGroup } from "./sidebar-hover-group";

export interface StageNavigationItem {
  id: string;
  label: string;
  icon: ReactNode;
  hasNotification?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  testId?: string;
}

const ICON_CLASSES = "inline-flex shrink-0 [&>svg]:size-4";

export const stageNavigationVariants = cva(["relative isolate min-w-0"], {
  variants: {
    surface: { default: "", "shadow-border": "shadow-(--shadow-border)" },
  },
  defaultVariants: { surface: "default" },
});

export interface StageNavigationProps extends VariantProps<
  typeof stageNavigationVariants
> {
  tabs: StageNavigationItem[];
  activeTabId: string;
  onChange: (tabId: string) => void;
  className?: string;
  idPrefix?: string;
  /** Shared, externally rendered active panel controlled by these tabs. */
  panelId?: string;
  disableMotion?: boolean;
}

/** Artifact tabs share the workspace navigation highlight and row treatment. */
export function StageNavigation({
  tabs,
  activeTabId,
  onChange,
  className,
  idPrefix,
  panelId,
  disableMotion = false,
  surface,
}: StageNavigationProps) {
  const autoId = useId();
  const prefix = idPrefix ?? autoId;
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const list = listRef.current;
    if (!viewport || !list) return undefined;
    const measure = () => {
      setEdges({
        left: viewport.scrollLeft > 1,
        right:
          viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft > 1,
      });
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(viewport);
    observer?.observe(list);
    viewport.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      viewport.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [tabs]);

  return (
    <TabsPrimitive.Root
      asChild
      value={activeTabId}
      onValueChange={onChange}
      activationMode="manual"
    >
      <div className={cn(stageNavigationVariants({ surface }), className)}>
        <div
          ref={viewportRef}
          data-fade-left={edges.left || undefined}
          data-fade-right={edges.right || undefined}
          className={cn(
            "overflow-x-auto scroll-px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            edges.left && edges.right
              ? "[mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%_-_12px),transparent)]"
              : edges.left
                ? "[mask-image:linear-gradient(to_right,transparent,black_12px)]"
                : edges.right
                  ? "[mask-image:linear-gradient(to_left,transparent,black_12px)]"
                  : undefined,
          )}
        >
          <TabsPrimitive.List
            ref={listRef}
            aria-label="Workspace stages"
            className="relative flex w-max items-center gap-1 p-0"
            onFocusCapture={(event) => {
              const button = event.target.closest<HTMLElement>(
                "[data-stage-id], [data-stage-disabled]",
              );
              button?.scrollIntoView?.({
                block: "nearest",
                inline: "nearest",
                behavior: "instant",
              });
            }}
          >
            <SidebarHoverGroup
              axis="horizontal"
              disableMotion={disableMotion}
              className="w-max items-center"
              highlightClassName="rounded-(--radius-inner)"
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const reason =
                  tab.disabledReason ??
                  `${tab.label} becomes available when the prototype is ready.`;
                return (
                  <TooltipProvider key={tab.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          data-stage-disabled={tab.disabled ? "" : undefined}
                          data-sidebar-hover-disabled={
                            tab.disabled ? "" : undefined
                          }
                          tabIndex={tab.disabled ? 0 : undefined}
                          aria-label={tab.disabled ? reason : undefined}
                          className={cn(
                            "relative inline-flex scroll-mx-3 rounded-(--radius-inner)",
                            tab.disabled &&
                              "cursor-[url('/locked-cursor.svg')_8_8,not-allowed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
                          )}
                        >
                          <TabsPrimitive.Trigger
                            value={tab.id}
                            disabled={tab.disabled}
                            asChild
                          >
                            <button
                              id={`${prefix}-tab-${tab.id}`}
                              aria-controls={panelId}
                              type="button"
                              disabled={tab.disabled}
                              aria-current={isActive ? "step" : undefined}
                              data-testid={tab.testId}
                              data-stage-id={tab.id}
                              data-sidebar-row={tab.disabled ? undefined : ""}
                              data-selected={isActive || undefined}
                              data-project-view-tab={
                                tab.disabled ? undefined : ""
                              }
                              className={cn(
                                "group relative flex h-9 shrink-0 scroll-mx-3 items-center gap-2 rounded-(--radius-inner) border-0 bg-transparent px-3 font-sans text-body whitespace-nowrap outline-none",
                                "hover:text-(--text-primary) focus-visible:text-(--text-primary) focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--border-input-focus)",
                                "disabled:pointer-events-none disabled:opacity-40",
                                tab.disabled
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer",
                                isActive
                                  ? "bg-(--bg-sidebar-selected) text-(--text-primary) [&_svg]:stroke-2"
                                  : "text-(--text-tertiary) [&_svg]:stroke-[1.5] hover:[&_svg]:stroke-2 focus-visible:[&_svg]:stroke-2",
                              )}
                            >
                              <span aria-hidden="true" className={ICON_CLASSES}>
                                {tab.icon}
                              </span>
                              <span className="inline-grid">
                                <span
                                  aria-hidden="true"
                                  className="invisible col-start-1 row-start-1 font-semibold"
                                >
                                  {tab.label}
                                </span>
                                <span
                                  className={cn(
                                    "col-start-1 row-start-1",
                                    isActive
                                      ? "[font-variation-settings:'wght'_var(--font-weight-semibold)]"
                                      : "[font-variation-settings:'wght'_var(--font-weight-regular)]",
                                  )}
                                >
                                  {tab.label}
                                </span>
                              </span>
                              {tab.hasNotification && (
                                <span
                                  aria-hidden="true"
                                  className="absolute right-1 top-1 size-2 rounded-full bg-(--bg-interactive-warning-default)"
                                />
                              )}
                            </button>
                          </TabsPrimitive.Trigger>
                        </span>
                      </TooltipTrigger>
                      {tab.disabled && (
                        <TooltipContent>{reason}</TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </SidebarHoverGroup>
          </TabsPrimitive.List>
        </div>
      </div>
    </TabsPrimitive.Root>
  );
}
