"use client";

import { ProblemStatementLines } from "#/components/ds/ui/ProblemStatementLines";

const lines = [
  { lead: "As a", body: "licensing officer at a statutory board" },
  { lead: "I must", body: "check each new application against 12 criteria" },
  { lead: "but", body: "the checks are done by hand across three systems" },
];

export default function ProblemStatementLinesExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ProblemStatementLines lines={lines} size="sm" />
      <ProblemStatementLines lines={lines} size="xs" />
    </div>
  );
}
