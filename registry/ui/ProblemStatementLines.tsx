"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import type { ProblemStatementLine } from "./flowchart/types";

export const problemStatementLinesVariants = cva(["flex flex-col"], {
  variants: {
    size: {
      sm: ["gap-1.5"],
      xs: ["gap-1.5"],
    },
  },
  defaultVariants: { size: "sm" },
});

const lineTextVariants = cva(["m-0"], {
  variants: {
    size: {
      sm: ["text-body", ""],
      xs: ["text-caption", ""],
    },
  },
  defaultVariants: { size: "sm" },
});

export interface ProblemStatementLinesProps extends VariantProps<
  typeof problemStatementLinesVariants
> {
  lines: ProblemStatementLine[];
  className?: string;
}

/**
 * The mad-lib problem statement: a muted lead-in per line (`As a`, `I must`,
 * `but`) followed by the officer's own words.
 *
 * A line with a `lead` and no `body` renders as muted-only, which is how a
 * trailing qualifier-only line would be expressed without a second type.
 * Lines are supplied already assembled — the caller derives them from the
 * answers, so this component never decides what the statement says.
 *
 * Shared by `ds/patterns`' `ProblemStatementProse` (14px, `size="sm"`)
 * and the flowchart's `ProblemStatementNode` (12px, `size="xs"`) so the
 * two contexts render from one `ds/ui` source instead of `ds/ui` reaching
 * into `ds/patterns` — see this repo's `ds/CLAUDE.md` layering rule.
 */
export function ProblemStatementLines({
  lines,
  size,
  className,
}: ProblemStatementLinesProps) {
  return (
    <div className={cn(problemStatementLinesVariants({ size }), className)}>
      {lines.map((line, index) => (
        <p
          key={`${line.lead ?? ""}-${index}`}
          className={lineTextVariants({ size })}
        >
          {line.lead && (
            <span className="text-(--text-secondary)">{line.lead}</span>
          )}
          {line.lead && line.body && " "}
          {line.body && (
            <span className="text-(--text-primary)">{line.body}</span>
          )}
        </p>
      ))}
    </div>
  );
}
