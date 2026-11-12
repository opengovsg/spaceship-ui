"use client";

import { PreviewPanelHeader } from "#/components/ds/patterns";

export default function PreviewPanelHeaderExample() {
  return (
    <div className="w-full max-w-xl">
      <PreviewPanelHeader
        title="Preview"
        onRefresh={() => {}}
        onOpenInNewTab={() => {}}
      />
    </div>
  );
}
