"use client";

import { ChatBubble, ChatMessage } from "#/components/ds/ui";
import { parseQABlocks } from "#/components/ds/lib/format-guided-answers";
import { AnswerRecap } from "./AnswerRecap";

export interface ChatUserMessageProps {
  content: string;
}

/**
 * Renders one user chat turn. A guided-intake turn (the `Q: .../A: ...`
 * block format built by `formatQABlock`/`joinQABlocks`) renders as an
 * {@link AnswerRecap} instead of a bubble, so the original questions stay
 * legible once the question card has scrolled out of view. Any other
 * content renders as a normal right-aligned {@link ChatBubble}.
 */
export function ChatUserMessage({ content }: ChatUserMessageProps) {
  const entries = parseQABlocks(content);
  if (entries) {
    return <AnswerRecap entries={entries} />;
  }
  return (
    <ChatBubble>
      <ChatMessage content={content} preserveLineBreaks />
    </ChatBubble>
  );
}
