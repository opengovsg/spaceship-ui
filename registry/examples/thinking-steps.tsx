"use client";

import { useState } from "react";
import { ThinkingSteps, type ThinkingStep } from "#/components/ds/ui";

const steps: ThinkingStep[] = [
  { id: "1", label: "Read your problem statement", status: "complete" },
  { id: "2", label: "Look at similar government services", status: "active" },
  { id: "3", label: "Draft the first screens", status: "pending" },
];

export default function ThinkingStepsExample() {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full max-w-md">
      <ThinkingSteps
        steps={steps}
        label="Planning your prototype"
        open={open}
        onOpenChange={setOpen}
        surface="shadow-border"
      />
    </div>
  );
}
