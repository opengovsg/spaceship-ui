"use client";

import { ChatMessage } from "#/components/ds/ui";

const REPLY = `Here is what I understood so far:

- **Who it is for:** caseworkers who assess support applications
- **The problem:** records sit in five systems, so each case takes longer

Should the first prototype focus on **records** or on **missing documents**?`;

export default function ChatMessageExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <ChatMessage content={REPLY} />
      <ChatMessage content="Drafting your problem statement..." isStreaming />
    </div>
  );
}
