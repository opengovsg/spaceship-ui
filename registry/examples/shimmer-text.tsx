"use client";

import { ShimmerText } from "#/components/ds/ui";

export default function ShimmerTextExample() {
  return (
    <div className="flex flex-col items-start gap-3 text-body">
      <ShimmerText>Drafting your problem statement</ShimmerText>
      <ShimmerText variant="subtle" dots>
        Building your prototype
      </ShimmerText>
    </div>
  );
}
