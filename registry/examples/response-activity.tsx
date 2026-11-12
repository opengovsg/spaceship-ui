"use client";

import { useState } from "react";
import { ResponseActivity } from "#/components/ds/ui/response-activity";

export default function ResponseActivityExample() {
  const [startedAt] = useState(() => Date.now());
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ResponseActivity phase="thinking" startedAt={startedAt} observed />
      <ResponseActivity
        phase="completed"
        observed
        hasResponse
        startedAt={startedAt - 12000}
        stoppedAt={startedAt}
      />
      <ResponseActivity phase="failed" />
    </div>
  );
}
