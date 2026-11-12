"use client";

import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "../ui";

interface PreviewPanelHeaderProps {
  title?: string;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
}

export function PreviewPanelHeader({
  title = "Preview",
  onRefresh,
  onOpenInNewTab,
}: PreviewPanelHeaderProps) {
  return (
    <div className="bg-(--bg-artifact-header) border-b-2 border-(--bg-surface-secondary) flex shrink-0 items-center justify-between px-4 py-4">
      <p className="font-sans text-title font-semibold text-(--text-primary) whitespace-nowrap">
        {title}
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          trailingIcon={<RefreshCw />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
        <Button
          variant="secondary"
          trailingIcon={<ExternalLink />}
          onClick={onOpenInNewTab}
        >
          Open in new tab
        </Button>
      </div>
    </div>
  );
}
