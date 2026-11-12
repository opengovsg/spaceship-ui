"use client";

import { ChatBubble, ChatMessage, ChatThread } from "#/components/ds/ui";

export default function ChatThreadExample() {
  return (
    <div className="h-80 w-full max-w-md overflow-hidden rounded-lg border">
      <ChatThread>
        <div className="flex flex-col gap-4 p-4">
          <ChatBubble messageRole="user">
            I want to speed up how my team checks licence applications.
          </ChatBubble>
          <ChatMessage content="Good idea. Who checks the applications today, and how long does one take?" />
          <ChatBubble messageRole="user">
            Two officers. About 40 minutes each.
          </ChatBubble>
          <ChatMessage content="Thanks. That is **80 minutes** of officer time per application. Let us write this down as your problem statement." />
        </div>
      </ChatThread>
    </div>
  );
}
