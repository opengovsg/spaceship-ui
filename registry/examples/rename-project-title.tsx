"use client";

import { useState } from "react";
import { TooltipProvider } from "#/components/ds/ui";
import { RenameProjectTitle } from "#/components/ds/patterns";

export default function RenameProjectTitleExample() {
  const [title, setTitle] = useState("Leave request tracker");
  return (
    <TooltipProvider>
      <div className="w-full max-w-md">
        <RenameProjectTitle title={title} onRename={setTitle} />
      </div>
    </TooltipProvider>
  );
}
