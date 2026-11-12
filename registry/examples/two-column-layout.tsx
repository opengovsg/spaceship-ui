"use client";

import { TwoColumnLayout } from "#/components/ds/patterns";

export default function TwoColumnLayoutExample() {
  return (
    <div className="h-64 w-full max-w-3xl">
      <TwoColumnLayout
        left={
          <div className="p-4 text-body">
            Chat: tell Spaceship about your idea.
          </div>
        }
        right={
          <div className="p-4 text-body">
            Artifact: your problem statement appears here.
          </div>
        }
        disableMotion
      />
    </div>
  );
}
