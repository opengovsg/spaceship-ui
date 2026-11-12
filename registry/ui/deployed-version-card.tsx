"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Globe, LoaderCircle, CircleAlert } from "lucide-react";
import { RelativeDate } from "#/components/ds/ui/relative-date";
import { cn } from "#/components/ds/lib/classnames";

export const deployedVersionCardVariants = cva(
  [
    "flex min-w-0 w-full items-center gap-2 rounded-(--radius-inner) border border-(--border-subtle) p-3",
    "bg-(--bg-surface-primary)",
  ],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "",
      },
    },
    defaultVariants: { surface: "shadow-border" },
  },
);

export interface DeployedVersionCardProps extends VariantProps<
  typeof deployedVersionCardVariants
> {
  versionNumber: number;
  timestamp: string;
  isLatest?: boolean;
  disableMotion?: boolean;
  className?: string;
  status?: "IN_PROGRESS" | "SUCCESS" | "FAILED";
  children?: ReactNode;
}

/** A compact, single-line published-version row. */
export function DeployedVersionCard({
  versionNumber,
  timestamp,
  isLatest = false,
  surface,
  className,
  status,
  children,
}: DeployedVersionCardProps) {
  return (
    <div
      className={cn(deployedVersionCardVariants({ surface }), className)}
      data-latest={isLatest || undefined}
    >
      <span className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap font-sans text-caption">
        {status === "IN_PROGRESS" ? (
          <LoaderCircle aria-hidden className="size-4 shrink-0 animate-spin" />
        ) : status === "FAILED" ? (
          <CircleAlert
            aria-hidden
            className="size-4 shrink-0 text-(--text-tertiary)"
          />
        ) : (
          <Globe
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0",
              isLatest
                ? "text-(--bg-interactive-success-default)"
                : "text-(--text-tertiary)",
            )}
          />
        )}
        <span className="shrink-0 font-semibold text-(--text-primary)">
          Version {versionNumber}
        </span>
      </span>
      {status === "IN_PROGRESS" && (
        <span role="status" className="shrink-0 text-caption">
          Publishing
        </span>
      )}
      {status === "FAILED" && (
        <span className="shrink-0 text-caption">Failed to publish</span>
      )}
      {children}
      <span className="ml-auto min-w-0 truncate text-right font-sans text-caption text-(--text-tertiary)">
        {status === "IN_PROGRESS"
          ? "Started"
          : status === "FAILED"
            ? "Attempted"
            : "Published"}{" "}
        <RelativeDate date={timestamp} forceRelativeDate />
      </span>
    </div>
  );
}
