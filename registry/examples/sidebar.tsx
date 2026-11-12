"use client";

import { useState } from "react";
import { Button } from "#/components/ds/ui";
import { Sidebar, SidebarFooter } from "#/components/ds/patterns";

export default function SidebarExample() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-96 w-full max-w-lg flex-col gap-3">
      <Button
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close sidebar" : "Open sidebar"}
      </Button>
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border">
        <Sidebar isOpen={open}>
          <div className="flex-1 text-body font-semibold">Projects</div>
          <SidebarFooter email="alex.tan@agency.gov.sg" onLogout={() => {}} />
        </Sidebar>
      </div>
    </div>
  );
}
