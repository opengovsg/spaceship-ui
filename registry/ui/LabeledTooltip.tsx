import { cloneElement, type ReactElement } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export interface LabeledTooltipProps {
  label?: string;
  /** Use the label as the disabled reason when it describes the current blocker. */
  labelIsDisabledReason?: boolean;
  children: ReactElement;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "down-right" | "down-left";
  contentClassName?: string;
}

/** Single-label composition of the shared Radix tooltip, including disabled triggers. */
export function LabeledTooltip({
  label,
  labelIsDisabledReason = false,
  children,
  delay = 200,
  direction = "up",
  contentClassName,
}: LabeledTooltipProps) {
  if (!label) return children;
  const childProps = children.props as {
    disabled?: boolean;
    disabledReason?: string;
  };
  if (childProps.disabled && childProps.disabledReason) {
    return labelIsDisabledReason
      ? cloneElement(children as ReactElement<{ disabledReason?: string }>, {
          disabledReason: label,
        })
      : children;
  }
  const needsFocusTarget = childProps.disabled;
  const side =
    direction === "up"
      ? "top"
      : direction === "down" ||
          direction === "down-right" ||
          direction === "down-left"
        ? "bottom"
        : direction;
  const align =
    direction === "down-right"
      ? "start"
      : direction === "down-left"
        ? "end"
        : "center";
  return (
    <TooltipProvider delayDuration={delay} disableHoverableContent>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={
              contentClassName
                ? `inline-block ${contentClassName}`
                : "inline-block"
            }
            tabIndex={needsFocusTarget ? 0 : undefined}
            aria-label={needsFocusTarget ? label : undefined}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
