"use client";

import { ProblemStatementProse } from "#/components/ds/patterns";

const LINES = [
  { lead: "As a", body: "caseworker, I must assess eligibility for support." },
  {
    lead: "But",
    body: "fragmented records and missing documents delay each assessment.",
  },
];

export default function ProblemStatementProseExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <ProblemStatementProse lines={LINES} />
    </div>
  );
}
