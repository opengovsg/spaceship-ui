import { type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import { IconButton } from "./IconButton";

type CalloutColor =
  | "neutral"
  | "info"
  | "critical"
  | "error"
  | "warning"
  | "success";

const ICON_CLASSES = { default: "[&>svg]:size-5" };

function StatusIcon({ color }: { color: CalloutColor }) {
  if (color === "neutral" || color === "info") return <Info />;
  if (color === "success") return <CircleCheck />;
  if (color === "warning") return <TriangleAlert />;
  return <CircleAlert />;
}

function IconSlot({
  icon,
  className,
}: {
  icon: ReactNode;
  className?: string;
}) {
  if (!icon) return null;
  return (
    <span
      aria-hidden="true"
      className={cn("sds-banner-icon", ICON_CLASSES.default, className)}
    >
      {icon}
    </span>
  );
}

export const calloutVariants = cva(
  ["sds-banner shrink-0 font-sans text-body text-(--text-primary)"],
  {
    variants: {
      color: {
        neutral: "sds-banner-neutral",
        info: "sds-banner-info",
        critical: "sds-banner-error",
        error: "sds-banner-error",
        warning: "sds-banner-warning",
        success: "sds-banner-success",
      },
      contrast: { low: "sds-banner-low", high: "sds-banner-high" },
      variant: {
        inline: "rounded-none shadow-none",
        floating: "rounded-(--radius-inner)",
        notification: "sds-banner-notification rounded-(--radius-feedback)",
      },
      surface: { default: "", "shadow-border": "" },
    },
    compoundVariants: [
      {
        variant: "floating",
        surface: "default",
        className: "shadow-(--shadow-border)",
      },
      {
        variant: "notification",
        surface: "default",
        contrast: ["low", "high"],
        className: "shadow-(--surface-shadow-6)",
      },
      {
        surface: "shadow-border",
        contrast: ["low", "high"],
        className: "border border-(--banner-status) shadow-(--shadow-border)",
      },
    ],
    defaultVariants: {
      color: "neutral",
      contrast: "low",
      variant: "inline",
      surface: "default",
    },
  },
);

export interface CalloutProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, "title" | "color">,
    Omit<VariantProps<typeof calloutVariants>, "color"> {
  color?: CalloutColor;
  title?: ReactNode;
  icon?: ReactNode;
  leadingIcon?: ReactNode;
  rightContent?: ReactNode;
  actions?: ReactNode;
  /** Caller removes the notice and restores focus when dismissal originates inside it. */
  onDismiss?: () => void;
  dismissLabel?: string;
  titleClassName?: string;
  iconClassName?: string;
  /** Disables motion on the owned dismiss control. Callers own banner presence. */
  disableMotion?: boolean;
}

/** Shared inline feedback and notification surface; legacy props remain supported. */
export function Callout({
  title,
  children,
  icon,
  leadingIcon,
  rightContent,
  actions,
  onDismiss,
  dismissLabel = "Dismiss notification",
  color = "neutral",
  contrast = "low",
  variant = "inline",
  surface = "default",
  className,
  titleClassName,
  iconClassName,
  disableMotion,
  role,
  ...props
}: CalloutProps) {
  const resolvedIcon =
    leadingIcon !== undefined ? (
      leadingIcon
    ) : icon !== undefined ? (
      icon
    ) : (
      <StatusIcon color={color} />
    );
  return (
    <div
      {...props}
      role={role}
      className={cn(
        calloutVariants({ color, contrast, variant, surface }),
        className,
      )}
    >
      <div className="sds-banner-body">
        <IconSlot icon={resolvedIcon} className={iconClassName} />
        <div className="sds-banner-content min-w-0">
          {title && (
            <div
              className={cn(
                "[font-weight:var(--font-weight-semibold)]",
                titleClassName,
              )}
            >
              {title}
            </div>
          )}
          {children && <div className={cn(title && "mt-1")}>{children}</div>}
        </div>
      </div>
      {(actions || rightContent) && (
        <div className="sds-banner-actions">{actions ?? rightContent}</div>
      )}
      {onDismiss && (
        <div className="sds-banner-dismiss">
          <IconButton
            icon={<X />}
            aria-label={dismissLabel}
            color="secondary"
            onClick={onDismiss}
            disableMotion={disableMotion}
          />
        </div>
      )}
    </div>
  );
}
