"use client";

import {
  SpaceshipLogoV2,
  SpaceshipMark,
  SpaceshipWordmark,
} from "#/components/ds/ui";

export default function SpaceshipLogoExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-6">
      <SpaceshipWordmark />
      <SpaceshipWordmark className="text-display" />
      <div className="flex items-center gap-6">
        <SpaceshipMark className="size-10" />
        <SpaceshipLogoV2 width={160} />
      </div>
    </div>
  );
}
