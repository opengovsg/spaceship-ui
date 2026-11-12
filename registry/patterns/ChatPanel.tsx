"use client";

import React, { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditableTitle } from "./EditableTitle";
import { ChatPanelHeader } from "./ChatPanelHeader";
import {
  ChatInputBox,
  ApprovalCard,
  ClarificationCard,
  SolutionBriefCard,
  TaskList,
} from "../ui";
import type {
  ChatInputBoxProps,
  TaskListProps,
  ClarificationQuestion,
  ClarificationAnswer,
} from "../ui";
import { cn } from "#/components/ds/lib/classnames";

/**
 * Minimum chat panel width in px, for callers that need a pixel value (e.g.
 * `minLeftWidthPx` on a resizable split pane). Independent of the
 * `--sizing-chat-min` CSS token (20rem / 320px) used by this component's own
 * `min-w`, which bounds a different layout — the panel's intrinsic min-width,
 * not the minimum a resizable container may shrink it to.
 */
export const CHAT_MIN_WIDTH_PX = 450;

interface ChatPanelProps {
  children: React.ReactNode;
  // Header
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  /**
   * `"editable"` (default) renders `EditableTitle`; `"static"` renders
   * `ChatPanelHeader`, for surfaces the user does not rename.
   */
  headerVariant?: "editable" | "static";
  /** Renders a left-arrow button before the title that returns to the canvas. */
  onCollapse?: () => void;
  /** Right-aligned header actions. `"static"` only. */
  headerActions?: React.ReactNode;
  /** Fixed content below the header, above the scrollable conversation. */
  headerBelow?: React.ReactNode;
  /** Custom header using the same inset as the standard header. */
  headerContent?: React.ReactNode;
  /** Application-owned dock content, such as a persisted survey. */
  dockContent?: (getMaxHeight: () => number) => React.ReactNode;
  /** Opaque neutral surface once the user has joined the conversation. */
  hasUserMessage?: boolean;
  // Layout
  className?: string;
  disableMotion?: boolean;

  /** ChatInputBox props. When provided, docks a ChatInputBox. */
  input?: ChatInputBoxProps;

  /** Task progress joined to the top of the dock, sharing its border and shadow. */
  taskList?: Pick<
    TaskListProps,
    "items" | "completedCount" | "expand" | "isActive" | "updatedAt"
  >;

  /**
   * Static text docked where the input would go, for a conversation that can
   * no longer be added to (e.g. a locked-in problem statement). Takes
   * precedence over `suggestedSolution`/`input` but not `approval`/`clarification`.
   */
  lockedMessage?: string;

  /** When provided, docks a ClarificationCard instead of the input. */
  clarification?: {
    /**
     * Changing this remounts the card, resetting its pagination — pass a
     * question-group id when the panel walks several groups in sequence.
     */
    id?: string;
    questions: ClarificationQuestion[];
    onSubmit: (answers: ClarificationAnswer[]) => void;
    freeTextPlaceholder?: string;
    submitLabel?: string;
    answerMinRows?: number;
  };

  /**
   * When provided, docks an ApprovalCard. Takes precedence over
   * `clarification`, `lockedMessage`, `suggestedSolution`, and `input` —
   * nothing else may be asked while a plan is awaiting a decision.
   */
  approval?: {
    content: React.ReactNode;
    onApprove: () => void;
    onReject: (message?: string) => void;
    title?: string;
    approveLabel?: string;
    rejectLabel?: string;
  };

  /**
   * When provided (and none of `approval`, `clarification`, or
   * `lockedMessage` is), docks a SolutionBriefCard — an auto-generated
   * solution brief the user hasn't acted on yet. Takes precedence over
   * `input`.
   */
  suggestedSolution?: {
    /**
     * Identifies the underlying solution — remounts `SolutionBriefCard`
     * (resetting its edit state) when this changes, the same way
     * `clarification.id` remounts `ClarificationCard` per question group.
     * Needed because the solution route can swap `:solutionId` without a
     * full `ChatPanel` remount.
     */
    id?: string;
    starterDescription: string;
    onSend: (content: string) => void;
    disabled: boolean;
    /** When provided, docks a "Discard" button to the left of Send. See `SolutionBriefCardProps.onDiscard`. */
    onDiscard?: () => void;
    discardDisabled?: boolean;
  };
}

export function ChatPanel({
  children,
  title,
  onTitleChange,
  headerVariant = "editable",
  onCollapse,
  headerActions,
  headerBelow,
  headerContent,
  dockContent,
  className,
  hasUserMessage = false,
  disableMotion = false,
  input,
  taskList,
  lockedMessage,
  clarification,
  approval,
  suggestedSolution,
}: ChatPanelProps) {
  const dockKey = dockContent
    ? "custom"
    : approval
      ? "approval"
      : clarification
        ? "clarification"
        : lockedMessage
          ? "locked"
          : suggestedSolution
            ? "suggestedSolution"
            : input
              ? "input"
              : null;

  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  // How tall the dock may grow. Measured from the panel's own box, since the
  // dock is a normal flow child (not an absolute overlay): panel height, less
  // the header, less the top region's padding + gap, less a floor of thread
  // that must stay readable.
  const getDockMaxHeight = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return window.innerHeight * 0.85;
    const panelH = panel.getBoundingClientRect().height;
    const headerH = headerRef.current?.getBoundingClientRect().height ?? 0;
    const taskListH = taskListRef.current?.getBoundingClientRect().height ?? 0;
    const TOP_REGION_CHROME = 32; // Composer inset and spacing above it.
    const THREAD_FLOOR = 96;
    return Math.max(
      panelH - headerH - taskListH - TOP_REGION_CHROME - THREAD_FLOOR,
      160,
    );
  }, []);

  return (
    <div
      ref={panelRef}
      data-conversation-started={hasUserMessage}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col",
        "bg-(--color-canvas)",
        // min() caps the floor at the parent's own width, so a layout
        // parent narrower than --sizing-chat-min (e.g. a resizable split
        // pane below its own minimum) shrinks the panel instead of
        // overflowing past its box.
        "min-w-[min(var(--sizing-chat-min),100%)] max-w-(--sizing-chat-max)",
        // 992px — the Chat frame's own height in Figma (node 11525:15500).
        // Without a cap, `flex-1` lets the panel stretch to fill whatever
        // full-height row it's dropped into, which on a tall viewport pushes
        // the thread and dock far past their designed proportions.
        // "max-h-[62rem]",
        className,
      )}
    >
      {/* ── Top region — header inset by px-4, thread runs flush ── */}
      <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
        {(title !== undefined || headerContent || headerBelow) && (
          <div ref={headerRef} className="w-full shrink-0 px-4 pt-4">
            {(title !== undefined || headerContent) &&
              (headerContent ??
                (headerVariant === "static" ? (
                  <ChatPanelHeader
                    title={title ?? ""}
                    onCollapse={onCollapse}
                    actions={headerActions}
                  />
                ) : (
                  <EditableTitle
                    title={title ?? ""}
                    onTitleChange={onTitleChange}
                    onBack={onCollapse}
                  />
                )))}
            {headerBelow && (
              <div
                className={
                  title !== undefined || headerContent ? "pt-4" : undefined
                }
              >
                {headerBelow}
              </div>
            )}
          </div>
        )}
        {/* Thread slot — no padding here. ChatThread pads its own scrollable
            content internally, so its scrollbar renders flush against the
            panel edge and its bottom edge runs flush to the dock below,
            with no outer gap. */}
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-clip">
          {children}
        </div>
      </div>

      {/* ── Dock — full bleed, exactly one of approval / clarification / input ── */}
      {dockKey && (
        <div className="mx-auto mb-4 w-[calc(100%_-_2rem)] max-w-2xl shrink-0 overflow-clip rounded-(--radius-input-card) bg-(--bg-surface-base) shadow-(--shadow-border)">
          {taskList && (
            <div ref={taskListRef}>
              <TaskList
                {...taskList}
                data-testid="tasks-list"
                className="rounded-none"
                disableMotion={disableMotion}
              />
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={dockKey}
              // The dock's outer shadow already defines its perimeter. A top
              // border is only needed between a task list and the dock content.
              className={cn("w-full", !taskList && "[&>*]:border-t-0")}
              initial={disableMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={disableMotion ? undefined : { opacity: 0, y: 16 }}
              transition={disableMotion ? { duration: 0 } : { duration: 0.15 }}
            >
              {dockContent ? (
                dockContent(getDockMaxHeight)
              ) : approval ? (
                <ApprovalCard
                  surface="docked"
                  title={approval.title}
                  onApprove={approval.onApprove}
                  onReject={approval.onReject}
                  approveLabel={approval.approveLabel}
                  rejectLabel={approval.rejectLabel}
                  disableMotion={disableMotion}
                  getMaxHeight={getDockMaxHeight}
                >
                  {approval.content}
                </ApprovalCard>
              ) : clarification ? (
                <ClarificationCard
                  // Remounting per group resets the card's internal
                  // pagination, so group 2 opens on its own first question
                  // rather than mid-sequence.
                  key={clarification.id}
                  surface="docked"
                  questions={clarification.questions}
                  onSubmit={clarification.onSubmit}
                  freeTextPlaceholder={clarification.freeTextPlaceholder}
                  submitLabel={clarification.submitLabel}
                  answerMinRows={clarification.answerMinRows}
                  disableMotion={disableMotion}
                  getMaxHeight={getDockMaxHeight}
                />
              ) : lockedMessage ? (
                <div className="w-full border-t border-(--border-subtle) px-4 py-3 text-center text-body text-(--text-secondary)">
                  {lockedMessage}
                </div>
              ) : suggestedSolution ? (
                <SolutionBriefCard
                  // Remounts (resetting the textarea's edit state) when the
                  // underlying solution changes — see the prop's doc comment.
                  key={suggestedSolution.id}
                  surface="docked"
                  starterDescription={suggestedSolution.starterDescription}
                  onSend={suggestedSolution.onSend}
                  disabled={suggestedSolution.disabled}
                  onDiscard={suggestedSolution.onDiscard}
                  discardDisabled={suggestedSolution.discardDisabled}
                  disableMotion={disableMotion}
                  getMaxHeight={getDockMaxHeight}
                />
              ) : input ? (
                <ChatInputBox surface="docked" {...input} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
