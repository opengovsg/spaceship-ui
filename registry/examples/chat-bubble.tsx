"use client";

import { ChatBubble } from "#/components/ds/ui";

export default function ChatBubbleExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ChatBubble messageRole="user" metadata="2:14pm">
        Help me check if officers need a tool to track leave requests.
      </ChatBubble>
      <ChatBubble messageRole="assistant">
        Good idea. Let us start with who files the requests today and what goes
        wrong for them.
      </ChatBubble>
    </div>
  );
}
