"use client";

import { useState } from "react";
import { AnimatedCopyIcon, AnimatedRefreshCwIcon } from "#/components/ds/ui";

export default function AnimatedIconsExample() {
  const [copyHover, setCopyHover] = useState(false);
  const [refreshHover, setRefreshHover] = useState(false);
  return (
    <div className="flex items-center gap-4 text-2xl">
      <button
        type="button"
        aria-label="Copy link"
        className="rounded-md p-2"
        onMouseEnter={() => setCopyHover(true)}
        onMouseLeave={() => setCopyHover(false)}
        onFocus={() => setCopyHover(true)}
        onBlur={() => setCopyHover(false)}
      >
        <AnimatedCopyIcon animate={copyHover} />
      </button>
      <button
        type="button"
        aria-label="Refresh preview"
        className="rounded-md p-2"
        onMouseEnter={() => setRefreshHover(true)}
        onMouseLeave={() => setRefreshHover(false)}
        onFocus={() => setRefreshHover(true)}
        onBlur={() => setRefreshHover(false)}
      >
        <AnimatedRefreshCwIcon animate={refreshHover} />
      </button>
    </div>
  );
}
