"use client";

import { ClarificationCard } from "#/components/ds/ui";

const QUESTIONS = [
  {
    type: "single" as const,
    label: "Who will use this first?",
    options: [
      "Caseworkers",
      "Admin and ops officers",
      "Members of the public",
      "Internal developers",
    ],
  },
  {
    type: "multi" as const,
    label: "Which pain points should it solve?",
    options: [
      "Too many manual steps",
      "Hard to find information",
      "Errors from copy-pasting",
      "No view of case status",
    ],
  },
  {
    type: "rank" as const,
    label: "Rank what matters most",
    items: ["Speed", "Accuracy", "Ease of use", "Audit trail"],
  },
];

export default function ClarificationCardExample() {
  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-3">
      <ClarificationCard questions={QUESTIONS} onSubmit={() => {}} />
    </div>
  );
}
