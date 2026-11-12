"use client";

import { type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";

const chatBubbleVariants = cva(
  [
    "min-w-0 max-w-full [overflow-wrap:anywhere]",
    "text-body font-(family-name:--font-family-secondary) text-(--text-primary)",
  ],
  {
    variants: {
      messageRole: {
        user: "w-fit rounded-(--radius-inner) bg-(--bg-chat-user) px-4 py-3 text-pretty",
        assistant: "w-full",
      },
      surface: {
        default: "",
        "shadow-border": "",
      },
    },
    compoundVariants: [
      {
        messageRole: "user",
        surface: "shadow-border",
        className: "shadow-(--shadow-border)",
      },
    ],
    defaultVariants: { messageRole: "user", surface: "default" },
  },
);

export interface ChatBubbleProps extends VariantProps<
  typeof chatBubbleVariants
> {
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
  /** Content shown above the text, including attachment-only messages. */
  attachments?: ReactNode;
  /** Timestamp or actions. Space stays reserved even while hidden. */
  metadata?: ReactNode;
  disableMotion?: boolean;
}

export function ChatBubble({
  children,
  surface,
  messageRole = "user",
  className,
  asChild = false,
  attachments,
  metadata,
}: ChatBubbleProps) {
  const isUser = messageRole === "user";
  const Comp = asChild ? Slot : "div";
  return (
    <div
      className={cn(
        "group/message flex w-full min-w-0 flex-col",
        isUser
          ? "items-end origin-bottom-right"
          : "items-start origin-bottom-left",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-2",
          isUser ? "w-fit max-w-[80%] items-end" : "w-full items-start",
        )}
      >
        {attachments && (
          <div
            className={cn(
              "flex min-w-0 max-w-full flex-wrap gap-2",
              isUser && "justify-end",
            )}
          >
            {attachments}
          </div>
        )}
        {children && (
          <Comp
            className={cn(
              chatBubbleVariants({ surface, messageRole }),
              className,
            )}
          >
            {children}
          </Comp>
        )}
        {metadata && (
          <div
            className={cn(
              "flex min-h-6 items-center gap-2 text-caption text-(--text-secondary) tabular-nums",
              "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/message:opacity-100 [@media(hover:hover)]:group-focus-within/message:opacity-100",
              "transition-opacity duration-(--duration-fast) motion-reduce:transition-none",
              isUser && "justify-end",
            )}
          >
            {metadata}
          </div>
        )}
      </div>
    </div>
  );
}

export { chatBubbleVariants };
