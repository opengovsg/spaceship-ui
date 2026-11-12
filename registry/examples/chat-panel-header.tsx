"use client";

import { TooltipProvider } from "#/components/ds/ui";
import { ChatPanelHeader } from "#/components/ds/patterns";

export default function ChatPanelHeaderExample() {
  return (
    <TooltipProvider>
      <div className="w-full max-w-md">
        <ChatPanelHeader title="Problem crafter" onCollapse={() => {}} />
      </div>
    </TooltipProvider>
  );
}
