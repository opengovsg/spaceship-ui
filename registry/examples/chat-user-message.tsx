"use client";

import { ChatUserMessage } from "#/components/ds/patterns";

export default function ChatUserMessageExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ChatUserMessage content="I want to help residents check if they can get a grant." />
      <ChatUserMessage
        content={
          "**Q: Who will use this service?**\n\nA: Public officers\n\n\n**Q: Which channels do they use today?**\n\nA: Phone, Counter"
        }
      />
    </div>
  );
}
