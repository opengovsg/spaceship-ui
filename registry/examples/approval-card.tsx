"use client";

import { ApprovalCard } from "#/components/ds/ui";

export default function ApprovalCardExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ApprovalCard
        title="Implementation Plan"
        onApprove={() => {}}
        onReject={() => {}}
      >
        <div className="flex flex-col gap-2 p-4 text-body">
          <p>1. Build a form for residents to check grant eligibility.</p>
          <p>2. Show the result with the next steps.</p>
          <p>3. Add a page for officers to review past checks.</p>
        </div>
      </ApprovalCard>
    </div>
  );
}
