"use client";

import { GatedActionBar } from "#/components/ds/ui";

export default function GatedActionBarExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <GatedActionBar state="locked">Answer all questions to continue</GatedActionBar>
      <GatedActionBar state="unlocked">Build my prototype</GatedActionBar>
    </div>
  );
}
