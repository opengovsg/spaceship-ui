"use client";

import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { Tag, tagVariants, type TagProps } from "../../tag";

type StatusBadgeVariantProps = Omit<
  VariantProps<typeof tagVariants>,
  "variant" | "weight" | "size" | "surface"
> & { tone?: TagProps["variant"] };

/** Compatibility adapter for canvas callers; Tag owns all badge styling. */
export function statusBadgeVariants({
  tone = "warning",
  ...props
}: StatusBadgeVariantProps = {}) {
  return tagVariants({ ...props, variant: tone, size: "sm" });
}

export interface StatusBadgeProps extends Omit<
  VariantProps<typeof statusBadgeVariants>,
  "hasLeadingIcon" | "hasTrailingIcon"
> {
  /** Rendered before the label, e.g. a check for `TESTED` or a flask for `UNTESTED`. */
  icon?: ReactNode;
  /** Optional trailing decoration; status icons conventionally use the leading `icon` prop. */
  trailingIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Canvas vocabulary adapter for the shared Tag. */
export function StatusBadge({
  tone = "warning",
  icon,
  trailingIcon,
  children,
  className,
}: StatusBadgeProps) {
  return (
    <Tag
      variant={tone}
      size="sm"
      leadingIcon={icon}
      trailingIcon={trailingIcon}
      className={className}
    >
      {children}
    </Tag>
  );
}
