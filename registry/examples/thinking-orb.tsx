"use client";

import { ThinkingOrb } from "#/components/ds/ui/thinking-orb";

export default function ThinkingOrbExample() {
  return (
    <div className="flex items-center gap-6">
      <ThinkingOrb size="md" state="working" label="Working" />
      <ThinkingOrb size="lg" state="searching" label="Searching" />
      <ThinkingOrb size="xl" state="composing" label="Writing" />
    </div>
  );
}
