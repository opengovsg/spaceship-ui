"use client";

import { type ReactElement, type ReactNode, useRef, forwardRef } from "react";
import {
  motion,
  useAnimation,
  useIsomorphicLayoutEffect,
  type HTMLMotionProps,
} from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ICON_TEXT_WEIGHT_CLASSES, ICON_WEIGHT_CLASS } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";
import { springs, scales } from "#/components/ds/lib/motion";
import { resolveColor, toAlphaZero } from "#/components/ds/lib/resolve-color";
import { Spinner } from "./Spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./tooltip";

type VariantKey =
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "destructive";

type TokenSet = { default: string; hover: string; pressed: string | null };

// CSS token names for motion-driven background color animation per variant.
// Flat and shadow surfaces share the same fill tokens.
const VARIANT_TOKENS: Record<VariantKey, TokenSet> = {
  primary: {
    default: "--bg-interactive-primary-default",
    hover: "--bg-interactive-primary-hover",
    pressed: "--bg-interactive-primary-pressed",
  },
  secondary: {
    default: "--bg-interactive-secondary-default",
    hover: "--bg-interactive-secondary-hover",
    pressed: "--bg-interactive-secondary-pressed",
  },
  tertiary: {
    default: "--bg-interactive-tertiary-default",
    hover: "--bg-interactive-tertiary-hover",
    pressed: "--bg-interactive-tertiary-pressed",
  },
  success: {
    default: "--bg-interactive-success-default",
    hover: "--bg-interactive-success-hover",
    pressed: "--bg-interactive-success-pressed",
  },
  destructive: {
    default: "--bg-interactive-error-default",
    hover: "--bg-interactive-error-hover",
    pressed: "--bg-interactive-error-pressed",
  },
};

// Ghost-surface tokens (transparent by default, tinted on hover/press) per variant.
// Neutral variants use subdued ghost fills, independent of their solid fills.
const GHOST_TOKENS: Record<VariantKey, TokenSet> = {
  primary: {
    default: "transparent",
    hover: "--bg-interactive-primary-subtle-hover",
    pressed: "--bg-interactive-primary-subtle-pressed",
  },
  secondary: {
    default: "transparent",
    hover: "--bg-interactive-secondary-ghost-hover",
    pressed: "--bg-interactive-secondary-ghost-pressed",
  },
  tertiary: {
    default: "transparent",
    hover: "--bg-interactive-secondary-ghost-hover",
    pressed: "--bg-interactive-secondary-ghost-pressed",
  },
  success: {
    default: "transparent",
    hover: "--bg-interactive-success-subtle-hover",
    pressed: "--bg-interactive-success-subtle-pressed",
  },
  destructive: {
    default: "transparent",
    hover: "--bg-interactive-error-subtle-hover",
    pressed: "--bg-interactive-error-subtle-pressed",
  },
};

/** Returns surface-aware motion tokens. Ghost uses a tinted hover/press background per variant;
 *  secondary flat and shadow use the shared neutral surface fill. */
function getMotionTokens(
  variant: VariantKey,
  surface: SurfaceKey,
  ghostBehavior: "plain" | "shaded" | "link",
): TokenSet {
  if (surface === "ghost")
    return ghostBehavior !== "shaded"
      ? { default: "transparent", hover: "transparent", pressed: "transparent" }
      : GHOST_TOKENS[variant];
  return VARIANT_TOKENS[variant];
}

const COLOR_TRANSITION = { duration: 0.33, ease: "easeOut" as const };
const PRESSED_TRANSITION = { duration: 0.08, ease: "easeOut" as const };

// hover/active CSS classes used only for the static (disableMotion / disabled) path.
// For secondary, classes are surface-aware — see getStaticHover().
const STATIC_HOVER: Record<VariantKey, string[]> = {
  primary: [
    "hover:bg-(--bg-interactive-primary-hover)",
    "active:bg-(--bg-interactive-primary-pressed)",
  ],
  secondary: [
    "hover:bg-(--bg-interactive-secondary-hover)",
    "active:bg-(--bg-interactive-secondary-pressed)",
  ],
  tertiary: [
    "hover:bg-(--bg-interactive-tertiary-hover)",
    "active:bg-(--bg-interactive-tertiary-pressed)",
  ],
  success: [
    "hover:bg-(--bg-interactive-success-hover)",
    "active:bg-(--bg-interactive-success-pressed)",
  ],
  destructive: [
    "hover:bg-(--bg-interactive-error-hover)",
    "active:bg-(--bg-interactive-error-pressed)",
  ],
};

// Ghost-surface static hover/active classes per variant — mirrors GHOST_TOKENS.
const GHOST_STATIC_HOVER: Record<VariantKey, string[]> = {
  primary: [
    "hover:bg-(--bg-interactive-primary-subtle-hover)",
    "active:bg-(--bg-interactive-primary-subtle-pressed)",
  ],
  secondary: [
    "hover:bg-(--bg-interactive-secondary-ghost-hover)",
    "active:bg-(--bg-interactive-secondary-ghost-pressed)",
  ],
  tertiary: [
    "hover:bg-(--bg-interactive-secondary-ghost-hover)",
    "active:bg-(--bg-interactive-secondary-ghost-pressed)",
  ],
  success: [
    "hover:bg-(--bg-interactive-success-subtle-hover)",
    "active:bg-(--bg-interactive-success-subtle-pressed)",
  ],
  destructive: [
    "hover:bg-(--bg-interactive-error-subtle-hover)",
    "active:bg-(--bg-interactive-error-subtle-pressed)",
  ],
};

/** Returns surface-aware static hover classes for the disableMotion / disabled path. */
function getStaticHover(
  variant: VariantKey,
  surface: SurfaceKey,
  ghostBehavior: "plain" | "shaded" | "link",
): string[] {
  if (surface === "ghost")
    return ghostBehavior !== "shaded"
      ? ["hover:bg-transparent", "active:bg-transparent"]
      : GHOST_STATIC_HOVER[variant];
  return STATIC_HOVER[variant];
}

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "font-sans",
    ICON_WEIGHT_CLASS,
    "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
    // No transition-colors — the motion path drives color via useAnimation;
    // the static path re-adds it alongside STATIC_HOVER.
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-input-focus)",
    "disabled:pointer-events-none disabled:opacity-50",
    "cursor-pointer select-none",
  ],
  {
    variants: {
      weight: {
        regular: ICON_TEXT_WEIGHT_CLASSES.medium,
        medium: ICON_TEXT_WEIGHT_CLASSES.medium,
        semibold: ICON_TEXT_WEIGHT_CLASSES.medium,
        bold: ICON_TEXT_WEIGHT_CLASSES.medium,
      },
      hasLeadingIcon: { true: "", false: "" },
      hasTrailingIcon: { true: "", false: "" },
      variant: {
        primary: ["bg-(--bg-interactive-primary-default)"],
        secondary: ["bg-(--bg-interactive-secondary-default)"],
        tertiary: ["bg-(--bg-interactive-tertiary-default)"],
        success: ["bg-(--bg-interactive-success-default)"],
        destructive: ["bg-(--bg-interactive-error-default)"],
      },
      size: {
        default: "h-9 py-2 px-3 gap-2 text-body rounded-(--radius-inner)",
        icon: "h-9 w-9 p-0 rounded-(--radius-inner)",
        sm: "h-7 py-1 px-3 gap-2 text-body rounded-(--radius-inner)",
        md: "h-9 py-2 px-3 gap-2 text-body rounded-(--radius-inner)",
        lg: "h-9 py-2 px-3 gap-2 text-body rounded-(--radius-inner)",
        "icon-sm": "h-7 w-7 p-0 rounded-(--radius-inner)",
        "icon-md": "h-9 w-9 p-0 rounded-(--radius-inner)",
        "icon-lg": "h-9 w-9 p-0 rounded-(--radius-inner)",
      },
      surface: {
        flat: "",
        shadow:
          "shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)",
        ghost: "",
      },
    },
    compoundVariants: [
      {
        variant: "secondary",
        surface: ["flat", "shadow"],
        className: "shadow-none hover:shadow-none",
      },
      // Icons have their own visual inset: reduce only the outside icon edge by 2px.
      {
        size: ["default", "sm", "md", "lg"],
        hasLeadingIcon: true,
        className: "pl-2.5",
      },
      {
        size: ["default", "sm", "md", "lg"],
        hasTrailingIcon: true,
        className: "pr-2.5",
      },
    ],
    defaultVariants: {
      weight: "medium",
      variant: "primary",
      size: "default",
      surface: "shadow",
    },
  },
);

type SurfaceKey = NonNullable<VariantProps<typeof buttonVariants>["surface"]>;
type SizeKey = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

const SCALE: Record<SurfaceKey, (typeof scales)[keyof typeof scales]> = {
  flat: scales.prominent,
  shadow: scales.subtle,
  ghost: scales.prominent,
};

// Foreground per variant on the solid (flat/shadow) surfaces — constant across states.
const SOLID_TEXT: Record<VariantKey, string> = {
  primary: "text-(--text-inverse)",
  secondary: "text-(--text-primary)",
  tertiary: "text-(--text-primary)",
  success: "text-(--text-inverse)",
  destructive: "text-(--text-inverse)",
};

// Foreground per variant on the ghost surface. Secondary's foreground darkens on
// hover/press via real CSS :hover/:active — the other variants stay constant.
const GHOST_TEXT: Record<VariantKey, string> = {
  primary: "text-(--text-interactive-primary)",
  secondary:
    "text-(--text-secondary) hover:text-(--text-primary) active:text-(--text-primary)",
  tertiary:
    "text-(--text-secondary) hover:text-(--text-primary) active:text-(--text-primary)",
  success: "text-(--text-interactive-success)",
  destructive: "text-(--text-interactive-error)",
};

/** Returns the foreground classes for a variant/surface pair, computed outside cva
 *  since ghost overrides both the text color and (via the caller) the background,
 *  which cva's static per-axis `variant` slice can't express. */
function getTextClasses(variant: VariantKey, surface: SurfaceKey): string {
  return surface === "ghost" ? GHOST_TEXT[variant] : SOLID_TEXT[variant];
}

const SPRING_TRANSITION = springs.interactive;

// Small controls use 14px icons; standard controls use 16px icons.
const ICON_CLASSES: Record<SizeKey, string> = {
  default: "[&>svg]:h-4 [&>svg]:w-4",
  icon: "[&>svg]:h-4 [&>svg]:w-4",
  sm: "[&>svg]:h-3.5 [&>svg]:w-3.5",
  md: "[&>svg]:h-4 [&>svg]:w-4",
  lg: "[&>svg]:h-4 [&>svg]:w-4",
  "icon-sm": "[&>svg]:h-3.5 [&>svg]:w-3.5",
  "icon-md": "[&>svg]:h-4 [&>svg]:w-4",
  "icon-lg": "[&>svg]:h-4 [&>svg]:w-4",
};

/** Gap class for the inner content span when isolateScale is true. */
const GAP_CLASSES: Record<SizeKey, string> = {
  default: "gap-2",
  icon: "",
  sm: "gap-2",
  md: "gap-2",
  lg: "gap-2",
  "icon-sm": "",
  "icon-md": "",
  "icon-lg": "",
};

export function IconSlot({
  icon,
  sizeKey,
  iconSize,
}: {
  icon: ReactNode;
  sizeKey: SizeKey;
  iconSize?: 14 | 16;
}) {
  if (!icon) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        ICON_CLASSES[sizeKey],
        iconSize === 14 && "[&>svg]:h-3.5 [&>svg]:w-3.5",
        iconSize === 16 && "[&>svg]:h-4 [&>svg]:w-4",
      )}
    >
      {icon}
    </span>
  );
}

export interface ButtonProps
  extends
    HTMLMotionProps<"button">,
    Omit<
      VariantProps<typeof buttonVariants>,
      "hasLeadingIcon" | "hasTrailingIcon"
    > {
  /** Text actions use default (36px) or sm (28px); icon-only actions use icon
   * (36px) or icon-sm (28px). Legacy md/lg aliases retain the 36px shapes. */
  size?: SizeKey;
  /** @deprecated Button labels and icons always use the medium weight. */
  weight?: keyof typeof ICON_TEXT_WEIGHT_CLASSES;
  /** Glyph footprint; defaults to 14px for small controls and 16px otherwise. */
  iconSize?: 14 | 16;
  /** Surface actions use shaded (default). Text-only navigation uses link:
   * transparent and unscaled, with text emphasis on hover/focus. Actions inside
   * row-owned highlights use plain (legacy transparent composition).
   * Use asChild with an anchor/Router Link to retain navigation semantics. */
  ghostBehavior?: "plain" | "shaded" | "link";
  isLoading?: boolean;
  toolbarButton?: boolean;
  asChild?: boolean;
  disableMotion?: boolean;
  /** Move scale animation to an inner motion.span so the button's bounding rect stays
   *  stable. Use when the Button is a Radix DropdownMenuTrigger — prevents dropdown shift. */
  isolateScale?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  /**
   * Wraps the button in a hover/focus tooltip showing this label. Omit or
   * pass an empty string to skip. Requires a `TooltipProvider` ancestor
   * (mounted once at the v2 route root) — does not mount its own.
   */
  tooltip?: string;
  /** Why this disabled action is unavailable, announced on its focusable wrapper. */
  disabledReason?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      weight,
      surface,
      iconSize,
      ghostBehavior = "shaded",
      asChild = false,
      disableMotion = false,
      isolateScale = false,
      disabled: disabledProp,
      isLoading = false,
      toolbarButton = false,
      leadingIcon,
      trailingIcon: trailingIconProp,
      icon,
      children,
      tooltip,
      disabledReason,
      onHoverStart,
      onHoverEnd,
      onTapStart,
      onTap,
      onTapCancel,
      ...props
    },
    ref,
  ) {
    const disabled = disabledProp || isLoading;
    const trailingIcon = isLoading ? <Spinner /> : trailingIconProp;
    const sizeKey: SizeKey =
      size === "sm" || size === "icon-sm"
        ? size
        : size === "icon" || size?.startsWith("icon-") || (!size && icon)
          ? "icon"
          : "default";
    const resolvedIconSize =
      iconSize ?? (sizeKey === "sm" || sizeKey === "icon-sm" ? 14 : 16);
    const surfaceKey: SurfaceKey =
      sizeKey === "icon" || sizeKey === "icon-sm"
        ? "ghost"
        : (surface ?? "shadow");
    const variantKey: VariantKey = (variant ?? "primary") as VariantKey;
    const tokens = getMotionTokens(variantKey, surfaceKey, ghostBehavior);

    // Transparent buttons (ghost) use CSS transitions for bg color —
    // Motion's JS interpolator does not apply CSS's "preserve source RGB channels for
    // transparent" rule, causing dark intermediate states when animating from rgba(0,0,0,0).
    const isTransparentBg = tokens.default === "transparent";

    const classes = cn(
      buttonVariants({
        variant,
        size: sizeKey,
        surface: surfaceKey,
        hasLeadingIcon: !asChild && !icon && !!leadingIcon,
        hasTrailingIcon: !asChild && !icon && !!trailingIcon,
        weight: weight ?? "medium",
      }),
      getTextClasses(variantKey, surfaceKey),
      surfaceKey === "ghost" ? "bg-transparent" : undefined,
      resolvedIconSize === 14 && "[&_svg]:h-3.5 [&_svg]:w-3.5",
      toolbarButton && "shadow-none hover:shadow-none border-0",
      className,
    );
    const scale =
      surfaceKey === "ghost" && ghostBehavior === "link"
        ? { hover: 1, tap: 1 }
        : SCALE[surfaceKey];
    const motionVariants = {
      idle: { scale: 1 },
      hover: { scale: scale.hover },
      tap: { scale: scale.tap },
    };

    const colorControls = useAnimation();
    const mountedRef = useRef(false);
    const backgroundState = useRef<"default" | "hover" | "pressed">("default");

    // Match the controls' layout lifecycle so queued gestures cannot animate
    // after controls.mount has cleaned up but before passive effects run.
    useIsomorphicLayoutEffect(() => {
      if (asChild || disableMotion || disabled) return undefined;
      mountedRef.current = true;
      const refreshBackground = () => {
        const stateToken = tokens[backgroundState.current] ?? tokens.default;
        colorControls.stop();
        colorControls.set({
          backgroundColor:
            stateToken === "transparent"
              ? toAlphaZero(resolveColor(tokens.hover))
              : resolveColor(stateToken),
        });
      };
      refreshBackground();
      const observer = new MutationObserver(refreshBackground);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => {
        mountedRef.current = false;
        observer.disconnect();
      };
    }, [
      variantKey,
      surfaceKey,
      ghostBehavior,
      asChild,
      disableMotion,
      disabled,
    ]); // oxlint-disable-line react/exhaustive-deps

    const withTooltip = (element: ReactElement) =>
      disabled && disabledReason ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                aria-label={disabledReason}
                className="inline-flex cursor-[url('/locked-cursor.svg')_8_8,not-allowed]"
                onClick={(event) => event.stopPropagation()}
              >
                {element}
              </span>
            </TooltipTrigger>
            <TooltipContent>{disabledReason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{element}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        element
      );

    const content = icon ? (
      <IconSlot icon={icon} sizeKey={sizeKey} iconSize={resolvedIconSize} />
    ) : (
      <>
        <IconSlot
          icon={leadingIcon}
          sizeKey={sizeKey}
          iconSize={resolvedIconSize}
        />
        {children}
        <IconSlot
          icon={trailingIcon}
          sizeKey={sizeKey}
          iconSize={resolvedIconSize}
        />
      </>
    );

    if (asChild) {
      return withTooltip(
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          data-ghost-fill={surfaceKey === "ghost" ? ghostBehavior : undefined}
          data-ghost-variant={surfaceKey === "ghost" ? variantKey : undefined}
          className={cn(
            classes,
            "transition-colors duration-(--duration-base) ease-(--ease-in-out)",
            getStaticHover(variantKey, surfaceKey, ghostBehavior),
          )}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>,
      );
    }

    if (disableMotion || disabled) {
      return withTooltip(
        <button
          ref={ref}
          data-ghost-fill={surfaceKey === "ghost" ? ghostBehavior : undefined}
          data-ghost-variant={surfaceKey === "ghost" ? variantKey : undefined}
          className={cn(
            classes,
            "transition-colors duration-(--duration-base) ease-(--ease-in-out)",
            getStaticHover(variantKey, surfaceKey, ghostBehavior),
          )}
          disabled={disabled}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>,
      );
    }

    // Deferred — called only in client-side event handlers, never during SSR render.
    const getRestBg = () =>
      isTransparentBg
        ? toAlphaZero(resolveColor(tokens.hover))
        : resolveColor(tokens.default);

    // When isolateScale, the outer button has a stable bounding rect (no scale) and the
    // inner motion.span applies the scale animation via variant propagation.
    const outerVariants = isolateScale
      ? { idle: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 1 } }
      : motionVariants;

    return withTooltip(
      <motion.button
        ref={ref}
        {...props}
        data-ghost-fill={surfaceKey === "ghost" ? ghostBehavior : undefined}
        data-ghost-variant={surfaceKey === "ghost" ? variantKey : undefined}
        className={classes}
        style={{
          ...props.style,
          ...(isolateScale ? {} : { willChange: "transform" }),
        }}
        variants={outerVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        animate={colorControls}
        transition={SPRING_TRANSITION}
        onHoverStart={(e, info) => {
          backgroundState.current = "hover";
          if (mountedRef.current) {
            colorControls.start(
              { backgroundColor: resolveColor(tokens.hover) },
              COLOR_TRANSITION,
            );
          }
          onHoverStart?.(e, info);
        }}
        onHoverEnd={(e, info) => {
          backgroundState.current = "default";
          if (mountedRef.current) {
            colorControls.start(
              { backgroundColor: getRestBg() },
              COLOR_TRANSITION,
            );
          }
          onHoverEnd?.(e, info);
        }}
        onTapStart={(e, info) => {
          backgroundState.current = "pressed";
          if (mountedRef.current && tokens.pressed) {
            colorControls.start(
              { backgroundColor: resolveColor(tokens.pressed) },
              PRESSED_TRANSITION,
            );
          }
          onTapStart?.(e, info);
        }}
        onTap={(e, info) => {
          backgroundState.current = "hover";
          // Cursor is still over button after tap — return to hover color
          if (mountedRef.current) {
            colorControls.start(
              { backgroundColor: resolveColor(tokens.hover) },
              COLOR_TRANSITION,
            );
          }
          onTap?.(e, info);
        }}
        onTapCancel={(e, info) => {
          backgroundState.current = "default";
          // Pointer moved away during press — return to rest
          if (mountedRef.current) {
            colorControls.start(
              { backgroundColor: getRestBg() },
              COLOR_TRANSITION,
            );
          }
          onTapCancel?.(e, info);
        }}
      >
        {isolateScale ? (
          <motion.span
            className={cn("inline-flex items-center", GAP_CLASSES[sizeKey])}
            style={{ willChange: "transform" }}
            variants={motionVariants}
            transition={SPRING_TRANSITION}
          >
            {content}
          </motion.span>
        ) : (
          content
        )}
      </motion.button>,
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
