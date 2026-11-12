"use client";

import { useState } from "react";
import { ArtifactTab, ArtifactTabs } from "#/components/ds/ui";

export default function ArtifactTabsExample() {
  const [value, setValue] = useState("brief");

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <ArtifactTabs value={value} onChange={setValue}>
        <ArtifactTab value="brief">Project brief</ArtifactTab>
        <ArtifactTab value="research" dotBadge dotBadgeLabel="Updated">
          User research
        </ArtifactTab>
        <ArtifactTab value="preview">Preview</ArtifactTab>
        <ArtifactTab value="security" disabled>
          Security review
        </ArtifactTab>
      </ArtifactTabs>
    </div>
  );
}
