"use client";

import { type ReactNode } from "react";
import { PreviewPanelHeader } from "./PreviewPanelHeader";

interface PreviewPanelProps {
  title?: string;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
  children?: ReactNode;
}

export function PreviewPanel({
  title = "Preview",
  onRefresh,
  onOpenInNewTab,
  children,
}: PreviewPanelProps) {
  return (
    <div className="flex flex-col overflow-clip rounded-xl shadow-(--shadow-border) bg-(--bg-surface-base) size-full">
      <PreviewPanelHeader
        title={title}
        onRefresh={onRefresh}
        onOpenInNewTab={onOpenInNewTab}
      />
      <div className="flex flex-1 min-h-0 bg-(--bg-prototype-canvas) overflow-clip">
        {children}
      </div>
    </div>
  );
}
