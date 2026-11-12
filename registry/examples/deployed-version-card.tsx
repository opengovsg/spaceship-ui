"use client";

import { DeployedVersionCard } from "#/components/ds/ui";

const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

export default function DeployedVersionCardExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <DeployedVersionCard versionNumber={3} timestamp={ago(5)} isLatest />
      <DeployedVersionCard versionNumber={2} timestamp={ago(60 * 26)} />
      <DeployedVersionCard
        versionNumber={4}
        timestamp={ago(1)}
        status="IN_PROGRESS"
      />
    </div>
  );
}
