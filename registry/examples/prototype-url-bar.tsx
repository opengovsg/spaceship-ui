"use client";

import { PrototypeUrlBar } from "#/components/ds/patterns";

export default function PrototypeUrlBarExample() {
  return (
    <div className="w-full max-w-md">
      <PrototypeUrlBar
        url="licence-checker.on.spaceship.gov.sg"
        onCopy={() => {}}
        onPublish={() => {}}
        publishLabel="Publish"
      />
    </div>
  );
}
