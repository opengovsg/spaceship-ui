"use client";

import { DotSphere } from "#/components/ds/ui";

export default function DotSphereExample() {
  return (
    <div className="flex items-center gap-6">
      <DotSphere size={72} />
      <DotSphere size={156} />
    </div>
  );
}
