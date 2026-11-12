import { type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ICON_TEXT_WEIGHT_CLASSES, ICON_WEIGHT_CLASS } from "./icon-weight";
import { cn } from "#/components/ds/lib/classnames";

type SizeKey = "sm" | "md";

const ICON_CLASSES: Record<SizeKey, string> = {
  sm: "[&>svg]:size-3",
  md: "[&>svg]:size-4",
};

function IconSlot({ icon, sizeKey }: { icon: ReactNode; sizeKey: SizeKey }) {
  if (!icon) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center leading-none",
        ICON_CLASSES[sizeKey],
      )}
    >
      {icon}
    </span>
  );
}

export const tagVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap",
    "rounded-full",
    "font-sans normal-case",
    ICON_WEIGHT_CLASS,
  ],
  {
    variants: {
      weight: ICON_TEXT_WEIGHT_CLASSES,
      hasLeadingIcon: { true: "", false: "" },
      hasTrailingIcon: { true: "", false: "" },
      // Semantic tags keep bright fills and dark text across both themes.
      variant: {
        neutral: "sds-tag-neutral text-(--text-primary)",
        success: "bg-(--bg-tag-success) text-(--text-tag-solid)",
        warning: "bg-(--bg-tag-warning) text-(--text-tag-solid)",
        error: "bg-(--bg-tag-error) text-(--text-tag-solid)",
        info: "bg-(--bg-tag-info) text-(--text-tag-solid)",
      },
      size: {
        sm: "pl-2 pr-2 py-0.75 text-caption",
        md: "pl-3 pr-3 py-1 text-body",
      },
      surface: {
        default: "",
        "shadow-border": "",
      },
    },
    compoundVariants: [
      { size: "sm", hasLeadingIcon: true, class: "pl-1.5" },
      { size: "md", hasLeadingIcon: true, class: "pl-2.5" },
      { size: "sm", hasTrailingIcon: true, class: "pr-1.5" },
      { size: "md", hasTrailingIcon: true, class: "pr-2.5" },
      // shadow-border surface — apply shadow ring to all variants
      {
        variant: "neutral",
        surface: "shadow-border",
        class: "shadow-(--shadow-border)",
      },
      {
        variant: "success",
        surface: "shadow-border",
        class: "shadow-(--shadow-border)",
      },
      {
        variant: "warning",
        surface: "shadow-border",
        class: "shadow-(--shadow-border)",
      },
      {
        variant: "error",
        surface: "shadow-border",
        class: "shadow-(--shadow-border)",
      },
      {
        variant: "info",
        surface: "shadow-border",
        class: "shadow-(--shadow-border)",
      },
    ],
    defaultVariants: {
      weight: "regular",
      variant: "neutral",
      size: "md",
      surface: "default",
    },
  },
);

export interface TagProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    Omit<
      VariantProps<typeof tagVariants>,
      "hasLeadingIcon" | "hasTrailingIcon"
    > {
  asChild?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

export function Tag({
  className,
  variant,
  size,
  weight,
  surface,
  asChild = false,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: TagProps) {
  const sizeKey: SizeKey = size ?? "md";
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      className={cn(
        tagVariants({
          variant,
          size,
          weight,
          surface,
          hasLeadingIcon: !asChild && !!leadingIcon,
          hasTrailingIcon: !asChild && !!trailingIcon,
        }),
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <IconSlot icon={leadingIcon} sizeKey={sizeKey} />
          {children}
          <IconSlot icon={trailingIcon} sizeKey={sizeKey} />
        </>
      )}
    </Comp>
  );
}
