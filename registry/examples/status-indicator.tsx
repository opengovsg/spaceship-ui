"use client";

import { StatusIndicator } from "#/components/ds/ui";

export default function StatusIndicatorExample() {
  return (
    <div className="flex flex-col items-start gap-3 text-body">
      <StatusIndicator label="Spaceship is building" />
      <StatusIndicator label="Checking your answers" ellipsesSpeed={300} />
    </div>
  );
}
