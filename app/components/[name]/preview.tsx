"use client";

import { useSyncExternalStore } from "react";
import { TooltipProvider } from "#/components/ds/ui";
import { examples } from "@/examples.generated";

export function Preview({ name }: { name: string }) {
  const Example = examples[name];
  // Demos run in the browser only. Some read the clock or window, which
  // static prerendering does not allow.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return (
    <div className="docs-preview">
      {/* The app mounts one TooltipProvider at its root; do the same here. */}
      <TooltipProvider>
        {!Example ? (
          <span className="docs-muted">No example yet.</span>
        ) : mounted ? (
          <Example />
        ) : null}
      </TooltipProvider>
    </div>
  );
}
