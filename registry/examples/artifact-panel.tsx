"use client";

import { ArtifactPanel } from "#/components/ds/patterns";
import { Button } from "#/components/ds/ui";

export default function ArtifactPanelExample() {
  return (
    <div className="h-72 w-full max-w-lg">
      <ArtifactPanel
        title="Problem statement"
        headerActions={<Button variant="secondary">Edit</Button>}
      >
        <p className="text-body">
          Counter staff at the agency take about ten minutes to check if a
          resident can get a grant. Residents often need to come back with
          more documents.
        </p>
      </ArtifactPanel>
    </div>
  );
}
