"use client";

import { Thinking } from "#/components/ds/ui";

export default function ThinkingExample() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Thinking />
      <Thinking surface="shadow-border">Drafting your plan</Thinking>
      <Thinking textScramble dots={false} />
    </div>
  );
}
