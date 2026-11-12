"use client";

import type { ReactNode } from "react";
import { cn } from "#/components/ds/lib/classnames";

export interface AnswerRecapEntry {
  question: string;
  /**
   * Plain text for a simple Q&A recap. Pass a formatted node (e.g.
   * `ProblemStatementProse`) for an answer that needs its own rendering
   * (mad-lib leads, etc.) instead of plain prose.
   */
  answer: ReactNode;
}

export interface AnswerRecapProps {
  entries: AnswerRecapEntry[];
  className?: string;
}

/**
 * An in-thread summary of what the officer has already told the crafter. It sits
 * in the chat history so earlier answers stay visible once the question card has
 * moved on, and so the artifact panel's prose can be traced back to them.
 */
export function AnswerRecap({ entries, className }: AnswerRecapProps) {
  if (entries.length === 0) return null;

  return (
    <div
      className={cn(
        "ml-auto flex w-fit min-w-0 max-w-[80%] flex-col gap-6 self-end rounded-(--radius-inner) px-4 py-3 [overflow-wrap:anywhere]",
        "bg-(--bg-chat-user)",
        className,
      )}
    >
      {entries.map((entry) => (
        <div
          key={entry.question}
          className="flex w-full min-w-0 flex-col gap-2"
        >
          <p className="w-full min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] text-body text-(--text-secondary)">
            {entry.question}
          </p>
          <div className="w-full min-w-0 whitespace-pre-wrap [overflow-wrap:anywhere] text-body text-(--text-primary)">
            {entry.answer}
          </div>
        </div>
      ))}
    </div>
  );
}
