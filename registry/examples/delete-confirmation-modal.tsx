"use client";

import { useState } from "react";
import { Button } from "#/components/ds/ui";
import { DeleteConfirmationModal } from "#/components/ds/patterns";

export default function DeleteConfirmationModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <DeleteConfirmationModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        isConfirming={false}
        errorMessage={null}
        title="Delete this project?"
        description="This removes the project and its prototype. You cannot undo this."
      />
    </div>
  );
}
