import { forwardRef, type ReactNode } from "react";
import { Button, IconSlot, type ButtonProps } from "./button";
import { cn } from "#/components/ds/lib/classnames";

export interface IconButtonProps extends Omit<
  ButtonProps,
  "variant" | "size" | "color" | "icon" | "children"
> {
  /** @deprecated Icon buttons always render a ghost surface. */
  variant?: "solid" | "outline";
  color?: "primary" | "secondary" | "critical";
  /** @deprecated All IconButtons use the same 36px square and 16px icon. */
  size?: "xs" | "sm" | "md";
  icon: ReactNode;
  "aria-label": string;
  /** @deprecated Icon buttons have no shadow. */
  dropShadow?: boolean;
  showIndicator?: boolean;
}

/** Icon-only button using the same interaction and colour implementation as Button. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant: _variant,
      color = "primary",
      icon,
      dropShadow: _dropShadow,
      iconSize = 16,
      showIndicator,
      className,
      ...props
    },
    ref,
  ) {
    // Consume legacy presentation props without passing them to the DOM.
    void _variant;
    void _dropShadow;
    const buttonSize = "icon";

    return (
      <Button
        {...props}
        ref={ref}
        type={props.type ?? "button"}
        variant={color === "critical" ? "destructive" : color}
        size={buttonSize}
        surface="ghost"
        iconSize={iconSize}
        className={cn("relative", className)}
      >
        <IconSlot icon={icon} sizeKey={buttonSize} iconSize={iconSize} />
        {showIndicator && (
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 size-3 rounded-full bg-(--bg-status-error) shadow-(--shadow-border)"
          />
        )}
      </Button>
    );
  },
);
