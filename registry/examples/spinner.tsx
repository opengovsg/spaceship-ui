"use client";

import { Spinner } from "#/components/ds/ui/Spinner";

export default function SpinnerExample() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <Spinner className="size-8" />
    </div>
  );
}
