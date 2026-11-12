"use client";

import { useState } from "react";
import { FolderTab, FolderTabs } from "#/components/ds/ui";

export default function FolderTabsExample() {
  const [value, setValue] = useState("brief");
  return (
    <div className="w-full max-w-md">
      <FolderTabs value={value} onChange={setValue}>
        <FolderTab value="brief">Brief</FolderTab>
        <FolderTab value="research">Research</FolderTab>
        <FolderTab value="plan">Plan</FolderTab>
        <FolderTab value="security" disabled>
          Security
        </FolderTab>
      </FolderTabs>
    </div>
  );
}
