"use client";

import { PreviewLink } from "#/components/ds/patterns";

export default function PreviewLinkExample() {
  return (
    <div className="h-64 w-full max-w-xl">
      <PreviewLink title="Prototype preview">
        <div className="flex size-full items-center justify-center text-body">
          Your prototype will show here.
        </div>
      </PreviewLink>
    </div>
  );
}
