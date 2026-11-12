"use client";

import { ProgressBar } from "#/components/ds/ui";

export default function ProgressBarExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <ProgressBar value={35} />
      <ProgressBar value={80} />
      <ProgressBar simulate id="building-prototype" />
    </div>
  );
}
