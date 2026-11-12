"use client";

import { useState } from "react";
import { FolderTabsV2, FolderTabV2 } from "#/components/ds/ui/folder-tabs-v2";

export default function FolderTabsV2Example() {
  const [value, setValue] = useState("problem");

  return (
    <FolderTabsV2 value={value} onChange={setValue}>
      <FolderTabV2 value="problem">Problem</FolderTabV2>
      <FolderTabV2 value="solution">Solution</FolderTabV2>
      <FolderTabV2 value="prototype" disabled>
        Prototype
      </FolderTabV2>
    </FolderTabsV2>
  );
}
