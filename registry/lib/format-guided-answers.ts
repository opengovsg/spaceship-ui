/**
 * Formats a single question/answer pair into the block format the agent
 * prompt expects when guided questions are answered.
 */
export function formatQABlock(question: string, answer: string): string {
  return `**Q: ${question}**\n\nA: ${answer}`;
}

/**
 * Joins formatted Q/A blocks into the single message sent to the agent once
 * all guided questions have been answered.
 */
export function joinQABlocks(blocks: string[]): string {
  return blocks.join("\n\n\n");
}

export interface QABlock {
  question: string;
  answer: string;
}

const QA_BLOCK_RE = /^\*{0,2}Q:\s*([\s\S]*?)\*{0,2}\s*\n+\s*A:\s*([\s\S]*)$/;

/**
 * Inverse of {@link formatQABlock}/{@link joinQABlocks} — splits a chat
 * message back into its question/answer pairs, for rendering a guided-intake
 * turn as a recap instead of raw markdown. Returns `null` if any block
 * doesn't match the `Q: ...` / `A: ...` shape (e.g. a free-form message).
 */
export function parseQABlocks(content: string): QABlock[] | null {
  const blocks = content.split("\n\n\n").map((block) => {
    const match = QA_BLOCK_RE.exec(block.trim());
    if (!match) return null;
    return { question: match[1]!.trim(), answer: match[2]!.trim() };
  });
  return blocks.every((block): block is QABlock => block !== null)
    ? blocks
    : null;
}
