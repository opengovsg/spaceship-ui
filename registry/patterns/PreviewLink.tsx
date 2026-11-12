"use client";

import { type ReactNode } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "../ui";

interface PreviewLinkProps {
  title?: string;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
  children?: ReactNode;
}

export function PreviewLink({
  title = "Preview",
  onRefresh,
  onOpenInNewTab,
  children,
}: PreviewLinkProps) {
  return (
    <div className="flex flex-col overflow-clip rounded-3xl shadow-(--shadow-border) bg-(--bg-surface-base) size-full">
      <div className="bg-(--bg-surface-primary) border-b-2 border-(--bg-surface-secondary) flex shrink-0 items-center justify-between px-4 py-4">
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

      <div className="flex flex-1 min-h-0 bg-(--bg-surface-tertiary) overflow-clip">
        {children}
      </div>
    </div>
  );
}
