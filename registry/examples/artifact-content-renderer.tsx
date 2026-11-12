"use client";

import { ArtifactContentRenderer } from "#/components/ds/patterns";

export default function ArtifactContentRendererExample() {
  return (
    <div className="flex h-72 w-full max-w-md flex-col overflow-hidden rounded-xl">
      <ArtifactContentRenderer
        artifact={{
          id: "prototype-1",
          type: "prototype",
          title: "Leave tracker prototype",
          status: "complete",
          content: "",
          updatedAt: "2026-11-12T09:00:00.000Z",
        }}
      />
    </div>
  );
}
