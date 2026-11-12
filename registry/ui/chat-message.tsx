"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "#/components/ds/lib/classnames";

// ─── Props ────────────────────────────────────────────────────────────────────

function anchor({ href, children }: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-(--text-interactive-primary) hover:underline"
    >
      {children}
    </a>
  );
}

// Tables need a wrapping element for horizontal scroll on narrow chat
// columns — the only markdown element here that can't be styled through a
// plain descendant selector on the outer div.
function table({ children }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="overflow-x-auto mb-2">
      <table className="w-full border-collapse border border-(--border-default)">
        {children}
      </table>
    </div>
  );
}

export interface ChatMessageProps {
  content: string;
  /** @deprecated Responses render directly; streaming content updates remain live. */
  animate?: boolean;
  isStreaming?: boolean;
  disableMotion?: boolean;
  className?: string;
  /**
   * Renders single newlines as line breaks instead of collapsing them into a
   * space. Plain-text user input has no markdown soft-wrap convention, so a
   * typed line break is meant literally — unlike LLM-authored markdown,
   * which often soft-wraps a paragraph across lines that should still join.
   * @default false
   */
  preserveLineBreaks?: boolean;
}

// ─── ChatMessage ────────────────────────────────────────────────────────────

export function ChatMessage({
  content,
  isStreaming = false,
  disableMotion = false,
  preserveLineBreaks = false,
  className,
}: ChatMessageProps) {
  const showCaret = isStreaming;

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full [overflow-wrap:anywhere]",
        "text-body",
        "font-(family-name:--font-family-secondary)",
        "text-(--text-primary)",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1",
        "[&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_strong]:[font-weight:var(--font-weight-semibold)]",
        "[&_code]:font-(family-name:--font-family-mono) [&_code]:text-caption [&_code]:bg-(--bg-surface-secondary) [&_code]:px-1 [&_code]:rounded-sm",
        "[&_pre]:bg-(--bg-surface-secondary) [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:mb-2 [&_pre]:whitespace-pre-wrap [&_pre]:[overflow-wrap:anywhere]",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-(--border-default) [&_blockquote]:pl-3 [&_blockquote]:py-1 [&_blockquote]:my-2 [&_blockquote]:italic [&_blockquote]:text-(--text-secondary)",
        "[&_hr]:border-(--border-default) [&_hr]:my-4",
        "[&_h1]:text-title [&_h1]:font-semibold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1:first-child]:mt-0",
        "[&_h2]:text-subtitle [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5",
        "[&_h3]:text-body [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-4",
        "[&_h4]:text-body [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-3",
        "[&_h5]:text-body [&_h5]:font-semibold [&_h5]:mb-2 [&_h5]:mt-3",
        "[&_h6]:text-body [&_h6]:font-semibold [&_h6]:mb-2 [&_h6]:mt-2",
        "[&_thead]:bg-(--bg-surface-secondary)",
        "[&_tr]:border-b [&_tr]:border-(--border-default)",
        "[&_th]:border [&_th]:border-(--border-default) [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-(--border-default) [&_td]:px-3 [&_td]:py-2",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={
          preserveLineBreaks ? [remarkGfm, remarkBreaks] : [remarkGfm]
        }
        components={{ a: anchor, table }}
      >
        {content}
      </ReactMarkdown>
      {showCaret && <VisuallyHidden>Message is being generated</VisuallyHidden>}
      {showCaret &&
        (disableMotion ? (
          <span className="inline-block w-0.5 h-5 bg-(--text-primary) ml-0.5 rounded-sm align-middle" />
        ) : (
          <motion.span
            className="inline-block w-0.5 h-5 bg-(--text-primary) ml-0.5 rounded-sm align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
    </div>
  );
}
