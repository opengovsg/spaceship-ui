"use client";

import { RubricChecklist } from "#/components/ds/patterns";

export default function RubricChecklistExample() {
  return (
    <div className="w-full max-w-md">
      <RubricChecklist
        sections={[
          {
            label: "Clarity",
            items: [
              { text: "Names who the service is for", verdict: "pass" },
              { text: "States the problem in one sentence", verdict: "fail" },
            ],
          },
          {
            label: "Evidence",
            items: [
              { text: "Says how many residents are affected", verdict: "unevaluated" },
            ],
          },
        ]}
      />
    </div>
  );
}
