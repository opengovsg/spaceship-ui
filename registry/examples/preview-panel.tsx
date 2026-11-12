"use client";

import { TooltipProvider } from "#/components/ds/ui";
import { PreviewPanel } from "#/components/ds/patterns";

export default function PreviewPanelExample() {
  return (
    <TooltipProvider>
      <div className="h-72 w-full max-w-md">
        <PreviewPanel
          title="Leave tracker"
          onRefresh={() => {}}
          onOpenInNewTab={() => {}}
        >
          <div className="flex flex-1 items-center justify-center p-6 text-body">
            Your prototype will show up here.
          </div>
        </PreviewPanel>
      </div>
    </TooltipProvider>
  );
}
