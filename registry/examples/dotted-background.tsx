"use client";

import { DottedBackground } from "#/components/ds/patterns";

export default function DottedBackgroundExample() {
  return (
    <DottedBackground className="flex h-48 w-full max-w-md items-center justify-center rounded-xl">
      <p className="text-body">Your canvas starts here</p>
    </DottedBackground>
  );
}
