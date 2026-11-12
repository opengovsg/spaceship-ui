"use client";

import { useState } from "react";
import { ShareableLink } from "#/components/ds/patterns";

export default function ShareableLinkExample() {
  const [name, setName] = useState("case-assessment");

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <ShareableLink value={name} onChange={setName} onShare={() => {}} />
    </div>
  );
}
