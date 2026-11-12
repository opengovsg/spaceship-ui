"use client";

import { PageFrame } from "#/components/ds/patterns";

export default function PageFrameExample() {
  return (
    <div className="flex h-56 w-full max-w-xl bg-(--bg-surface-secondary) pt-3">
      <div className="w-24 shrink-0 p-3 text-body text-(--text-secondary)">
        Projects
      </div>
      <PageFrame isFramed>
        <div className="h-full rounded-tl-xl bg-(--bg-surface-base) p-4 text-body text-(--text-primary)">
          Case assessment workspace
        </div>
      </PageFrame>
    </div>
  );
}
