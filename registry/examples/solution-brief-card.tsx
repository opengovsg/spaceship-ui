"use client";

import { SolutionBriefCard } from "#/components/ds/ui";

export default function SolutionBriefCardExample() {
  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-3">
      <SolutionBriefCard
        starterDescription="Give caseworkers one view of the client, their records and outstanding documents so they can see what is ready for assessment."
        onSend={() => {}}
        onDiscard={() => {}}
      />
    </div>
  );
}
