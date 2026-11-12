"use client";

import * as React from "react";
import {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  motion,
  AnimatePresence,
  useIsPresent,
  useReducedMotion,
} from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { ICON_TEXT_WEIGHT_CLASSES, ICON_WEIGHT_CLASS } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";
import { SidebarHoverGroup } from "./sidebar-hover-group";

// ━━━ Open state context ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Shared open state so DropdownMenuContent can animate entry/exit via AnimatePresence. */
interface DropdownState {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  modal: boolean;
}
const DropdownOpenContext = createContext<DropdownState | null>(null);

// ━━━ DropdownMenu — root ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type DropdownMenuRootProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Root
>;

/**
 * Root provider — tracks open state internally and exposes it via context
 * so DropdownMenuContent can run Motion exit animations via AnimatePresence.
 * Supports both controlled (`open` + `onOpenChange`) and uncontrolled usage.
 */
export function DropdownMenu({
  open,
  onOpenChange,
  defaultOpen,
  modal = true,
  children,
  ...props
}: DropdownMenuRootProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isControlled = open !== undefined;
  const [localOpen, setLocalOpen] = useState(defaultOpen ?? false);
  const isOpen = isControlled ? (open ?? false) : localOpen;

  function handleOpenChange(v: boolean) {
    if (!isControlled) setLocalOpen(v);
    onOpenChange?.(v);
  }

  return (
    <DropdownOpenContext.Provider value={{ isOpen, triggerRef, modal }}>
      <DropdownMenuPrimitive.Root
        open={isOpen}
        modal={modal}
        onOpenChange={handleOpenChange}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Root>
    </DropdownOpenContext.Provider>
  );
}

// ━━━ DropdownMenuTrigger ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Trigger element. Use `asChild` to compose with a DS Button. */
export const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>((props, forwardedRef) => {
  const context = useContext(DropdownOpenContext);
  return (
    <DropdownMenuPrimitive.Trigger
      {...props}
      ref={(element) => {
        if (context) context.triggerRef.current = element;
        const consumerRef = forwardedRef;
        if (typeof consumerRef === "function") consumerRef(element);
        else if (consumerRef) consumerRef.current = element;
      }}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// ━━━ DropdownMenuContent ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Props for DropdownMenuContent */
export interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> {
  className?: string;
  disableMotion?: boolean;
}

/**
 * Floating panel that contains menu items. Rendered in a portal.
 * Uses Motion AnimatePresence for smooth fade+scale enter/exit animations.
 * Transform origin tracks Radix's computed anchor point via CSS variable.
 */
const AnimatedDropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(
  (
    {
      className,
      sideOffset = 6,
      align = "end",
      children,
      onCloseAutoFocus,
      onInteractOutside,
      onEscapeKeyDown,
      style,
      disableMotion = false,
      ...props
    },
    ref,
  ) => {
    const context = useContext(DropdownOpenContext);
    const isPresent = useIsPresent();
    const prefersReducedMotion = useReducedMotion();
    const reduceMotion = disableMotion || prefersReducedMotion;
    // Portals inherit the document theme unless the trigger has a local override.
    // Observe its ancestor chain while open so preview/theme changes stay live.
    const readLocalTheme = () => {
      const owner = context?.triggerRef.current?.closest("[data-theme]");
      return owner && owner !== document.documentElement
        ? (owner.getAttribute("data-theme") ?? undefined)
        : undefined;
    };
    const [localTheme, setLocalTheme] = useState(readLocalTheme);
    useEffect(() => {
      const refreshTheme = () => setLocalTheme(readLocalTheme());
      refreshTheme();
      const observer = new MutationObserver(refreshTheme);
      for (
        let owner: HTMLElement | null | undefined = context?.triggerRef.current;
        owner;
        owner = owner.parentElement
      ) {
        observer.observe(owner, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });
      }
      return () => observer.disconnect();
    }, [context?.triggerRef]);
    const outsideRef = useRef(false);
    const focusHandledRef = useRef(false);
    const onCloseAutoFocusRef = useRef(onCloseAutoFocus);
    onCloseAutoFocusRef.current = onCloseAutoFocus;
    const closeFocus = useCallback(() => {
      if (focusHandledRef.current) return;
      focusHandledRef.current = true;
      const event = new Event("closeAutoFocus", { cancelable: true });
      onCloseAutoFocusRef.current?.(event);
      if (!event.defaultPrevented && !outsideRef.current)
        context?.triggerRef.current?.focus();
    }, [context?.triggerRef]);
    useEffect(() => {
      if (context?.isOpen) {
        outsideRef.current = false;
        focusHandledRef.current = false;
      } else closeFocus();
    }, [context?.isOpen, closeFocus]);
    return (
      <DropdownMenuPrimitive.Content
        {...props}
        data-theme={localTheme}
        ref={ref}
        forceMount
        sideOffset={sideOffset}
        align={align}
        inert={!isPresent || undefined}
        aria-hidden={!isPresent || undefined}
        style={{
          ...style,
          ...(!isPresent ? { pointerEvents: "none" } : {}),
        }}
        className="z-50 outline-none"
        onEscapeKeyDown={(event) => {
          outsideRef.current = false;
          onEscapeKeyDown?.(event);
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (event.defaultPrevented) return;
          const original = event.detail.originalEvent;
          if (
            !isPresent ||
            (original.target instanceof Node &&
              context?.triggerRef.current?.contains(original.target))
          ) {
            event.preventDefault();
            return;
          }
          const rightClick =
            "button" in original &&
            (original.button === 2 ||
              (original.button === 0 && original.ctrlKey));
          outsideRef.current = context?.modal === false || rightClick;
        }}
        // Focus is handled when closing starts. A delayed unmount must not steal
        // focus from an outside target, reopened menu, or destination route.
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <motion.div
          data-menu-surface=""
          className={cn(
            "min-w-36 p-1 rounded-(--radius-inner)",
            "bg-(--bg-surface-popover) shadow-(--shadow-border)",
            className,
          )}
          style={{
            transformOrigin:
              "var(--radix-dropdown-menu-content-transform-origin)",
            willChange: "transform",
          }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: { duration: reduceMotion ? 0 : 0.08, ease: "easeIn" },
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.12,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <SidebarHoverGroup
            className="gap-1"
            highlightClassName="bg-(--bg-ghost-neutral-hover)"
            disableMotion={!!reduceMotion}
          >
            {children}
          </SidebarHoverGroup>
        </motion.div>
      </DropdownMenuPrimitive.Content>
    );
  },
);
AnimatedDropdownContent.displayName = "AnimatedDropdownContent";

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>((props, ref) => {
  const context = useContext(DropdownOpenContext);
  return (
    <DropdownMenuPrimitive.Portal forceMount>
      <AnimatePresence>
        {context?.isOpen && <AnimatedDropdownContent {...props} ref={ref} />}
      </AnimatePresence>
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// ━━━ DropdownMenuItem ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Constants ───────────────────────────────────────────────────────────────

/** Icon sizing for leading icons inside menu items. */
const ITEM_ICON_CLASSES = "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0";

// ─── CVA ─────────────────────────────────────────────────────────────────────

export const dropdownMenuItemVariants = cva(
  [
    ICON_WEIGHT_CLASS,
    "relative flex items-center gap-2 w-full min-h-9 px-2.5 py-2 rounded-(--radius-inner)",
    "cursor-pointer outline-none select-none",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--border-input-focus)",
    "font-sans text-body",
    "transition-colors duration-(--duration-base) ease-(--ease-in-out)",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  {
    variants: {
      weight: ICON_TEXT_WEIGHT_CLASSES,
      variant: {
        // Standard option — primary text, subtle hover background
        default: "text-(--text-primary)",
        // Destructive option — error text, light error hover background
        destructive: "text-(--text-interactive-error)",
      },
    },
    defaultVariants: { variant: "default", weight: "regular" },
  },
);

// ─── Props + Component ───────────────────────────────────────────────────────

/** Props for DropdownMenuItem */
export interface DropdownMenuItemProps
  extends
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuItemVariants> {
  className?: string;
  children?: React.ReactNode;
  /** Persistent current destination, independent of the travelling hover. */
  selected?: boolean;
}

/**
 * Individual menu option. Leading icons can be placed inline as children.
 * Uses Radix `data-[highlighted]` for unified keyboard + mouse hover state.
 */
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, variant, weight, children, selected, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    data-menu-row=""
    data-sidebar-row=""
    data-sidebar-hover-tone={variant === "destructive" ? "error" : undefined}
    data-sidebar-hover-disabled={props.disabled ? "" : undefined}
    data-selected={selected || undefined}
    aria-current={selected ? "true" : undefined}
    className={cn(
      dropdownMenuItemVariants({ variant, weight }),
      ITEM_ICON_CLASSES,
      className,
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Item>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// ━━━ DropdownMenuSeparator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Props for DropdownMenuSeparator */
export interface DropdownMenuSeparatorProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
> {
  className?: string;
}

/** Horizontal divider between groups of items. */
export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("my-1 h-px bg-(--bg-surface-tertiary)", className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
