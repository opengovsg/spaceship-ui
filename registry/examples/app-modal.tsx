"use client";

import { useState } from "react";
import { Button } from "#/components/ds/ui";
import { AppModal } from "#/components/ds/ui/AppModal";

export default function AppModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <AppModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Share this prototype"
        footer={
          <>
            <Button
              variant="secondary"
              surface="shadow"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Share</Button>
          </>
        }
      >
        <p className="text-body">
          Anyone in your agency can view this prototype and leave comments.
        </p>
      </AppModal>
    </div>
  );
}
