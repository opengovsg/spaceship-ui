"use client";

import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { IconButton } from "#/components/ds/ui";

export default function IconButtonExample() {
  return (
    <div className="flex items-center gap-3">
      <IconButton icon={<Copy />} aria-label="Copy link" />
      <IconButton
        icon={<RefreshCw />}
        aria-label="Refresh preview"
        color="secondary"
      />
      <IconButton
        icon={<Trash2 />}
        aria-label="Delete project"
        color="critical"
      />
      <IconButton icon={<Copy />} aria-label="Copy link" disabled />
    </div>
  );
}
