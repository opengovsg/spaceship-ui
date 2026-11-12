"use client";

import { Check, Minus, X } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";

/**
 * Structurally identical to the app's `CriterionVerdict`, declared here rather
 * than imported: `ds/` must not depend on app state, and structural typing
 * means the app's values still assign cleanly.
 */
export type RubricVerdict = "unevaluated" | "fail" | "pass";

export interface RubricChecklistItem {
  text: string;
  verdict: RubricVerdict;
}

export interface RubricChecklistSection {
  /** Rendered in Sora + sentence case, e.g. `CLARITY`. */
  label: string;
  items: RubricChecklistItem[];
}

export interface RubricChecklistProps {
  sections: RubricChecklistSection[];
  className?: string;
}

const VERDICT_ICON: Record<RubricVerdict, typeof Check> = {
  unevaluated: Minus,
  pass: Check,
  fail: X,
};

const VERDICT_TEXT_COLOR: Record<RubricVerdict, string> = {
  // Muted until judged, so an unanswered criterion reads as "not yet" rather
  // than as a failure.
  unevaluated:
    "text-(--text-tertiary) [font-weight:var(--font-weight-regular)]",
  pass: "text-(--text-interactive-success) [font-weight:var(--font-weight-semibold)]",
  fail: "text-(--text-interactive-error) [font-weight:var(--font-weight-semibold)]",
};

const VERDICT_LABEL: Record<RubricVerdict, string> = {
  unevaluated: "Not yet evaluated",
  pass: "Met",
  fail: "Not met",
};

/** The circular per-item badge — solid fill for a judged verdict, an outlined dash while unevaluated. */
function VerdictBadge({ verdict }: { verdict: RubricVerdict }) {
  const Icon = VERDICT_ICON[verdict];
  if (verdict === "unevaluated") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-(--border-default) bg-(--bg-status-neutral)">
        <Icon aria-hidden className="size-2.5 text-(--text-tertiary)" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full",
        verdict === "pass"
          ? "bg-(--bg-status-default-success)"
          : "bg-(--bg-status-default-error)",
      )}
    >
      <Icon aria-hidden className="size-3 text-(--text-inverse)" />
    </span>
  );
}

export function RubricChecklist({ sections, className }: RubricChecklistProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h3 className="font-sans normal-case text-caption [font-weight:var(--font-weight-semibold)] text-(--text-tertiary)">
              {section.label}
            </h3>
            <div className="h-px w-full bg-(--border-subtle)" />
          </div>
          <ul className="flex flex-col gap-4">
            {section.items.map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <VerdictBadge verdict={item.verdict} />
                <span className="sr-only">{VERDICT_LABEL[item.verdict]}: </span>
                <span
                  className={cn("text-body", VERDICT_TEXT_COLOR[item.verdict])}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
