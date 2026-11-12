"use client";

import { useState } from "react";
import { ArtifactSegmentedControl } from "#/components/ds/patterns";

const ARTIFACTS = [
  {
    id: "brief",
    type: "brief" as const,
    title: "Project brief",
    status: "complete" as const,
    content:
      "Caseworkers need one view of each client, their records and any missing documents.",
    updatedAt: "2026-11-10T09:00:00Z",
  },
  {
    id: "research",
    type: "research" as const,
    title: "User research",
    status: "in-progress" as const,
    content:
      "Five officers said they re-enter the same details in several systems.",
    updatedAt: "2026-11-11T14:30:00Z",
  },
  {
    id: "prd",
    type: "prd" as const,
    title: "PRD",
    status: "draft" as const,
    content: "Draft requirements for the case assessment workspace.",
    updatedAt: "2026-11-12T08:15:00Z",
  },
];

export default function ArtifactSegmentedControlExample() {
  const [activeId, setActiveId] = useState("brief");

  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-3">
      <ArtifactSegmentedControl
        artifacts={ARTIFACTS}
        activeId={activeId}
        onSelect={setActiveId}
        changedIds={new Set(["research"])}
        onRefresh={() => {}}
        onOpenInNewTab={() => {}}
      />
    </div>
  );
}
