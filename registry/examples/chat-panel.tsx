"use client";

import { ChatBubble, ChatMessage, ChatThread } from "#/components/ds/ui";
import { ChatPanel } from "#/components/ds/patterns";

export default function ChatPanelExample() {
  return (
    <div className="flex h-[32rem] w-full max-w-xl overflow-hidden rounded-lg border">
      <ChatPanel
        title="Licence checker"
        headerVariant="static"
        hasUserMessage
        input={{ onSubmit: () => {} }}
      >
        <ChatThread>
          <div className="flex flex-col gap-4 p-4">
            <ChatBubble messageRole="user">
              Help me speed up licence checks.
            </ChatBubble>
            <ChatMessage content="Sure. Who checks the applications today?" />
          </div>
        </ChatThread>
      </ChatPanel>
    </div>
  );
}
