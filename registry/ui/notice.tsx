"use client";

import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Callout } from "./Callout";

export const noticeVariants = cva([], {
  variants: {
    tone: { error: "", warning: "", info: "", success: "", neutral: "" },
    surface: { default: "", "shadow-border": "" },
  },
  defaultVariants: { tone: "error", surface: "default" },
});

export interface NoticeProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof noticeVariants> {
  children?: ReactNode;
  description?: ReactNode;
  leadingIcon?: ReactNode | null;
}

export function Notice({
  tone = "error",
  surface,
  leadingIcon,
  children,
  description,
  role = "status",
  ...props
}: NoticeProps) {
  return (
    <Callout
      {...props}
      role={role}
      color={tone ?? "error"}
      surface={surface}
      leadingIcon={leadingIcon}
      title={children}
    >
      {description}
    </Callout>
  );
}
