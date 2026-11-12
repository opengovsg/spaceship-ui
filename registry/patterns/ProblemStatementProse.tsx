"use client";

import { ProblemStatementLines } from "#/components/ds/ui";
import type { ProblemStatementLine } from "#/components/ds/ui";

export interface ProblemStatementProseProps {
  lines: ProblemStatementLine[];
  className?: string;
}

/**
 * The mad-lib problem statement, full-size: a muted lead-in per line
 * (`As a`, `I must`, `but`) followed by the officer's own words.
 *
 * A line with a `lead` and no `body` renders as muted-only, which is how a
 * trailing qualifier-only line would be expressed without a second type.
 * Lines are supplied already assembled — the caller derives them from the
 * answers, so this component never decides what the statement says.
 *
 * Thin wrapper over `ds/ui`'s `ProblemStatementLines` at `size="sm"` — the
 * compact flowchart card (`ProblemStatementNode`) renders the same shape at
 * `size="xs"` directly from `ds/ui`, since patterns compose from `ds/ui`,
 * never the reverse.
 */
export function ProblemStatementProse({
  lines,
  className,
}: ProblemStatementProseProps) {
  return (
    <ProblemStatementLines lines={lines} size="sm" className={className} />
  );
}
