"use client";

import { Plus } from "lucide-react";
import { Button } from "#/components/ds/ui";

export default function ButtonExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Publish</Button>
        <Button variant="secondary">Save draft</Button>
        <Button variant="tertiary">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button leadingIcon={<Plus />}>New project</Button>
        <Button size="sm">Small</Button>
        <Button isLoading>Publishing</Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
}
