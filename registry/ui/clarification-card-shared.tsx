"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React, { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single option item — either a plain string or an object with an optional icon and/or recommended flag. */
export type ClarificationOption =
  | string
  | {
      label: string;
      icon?: ReactNode;
      recommended?: boolean;
      exclusive?: boolean;
      description?: string;
    };

/** Returns the display label of an option regardless of its form. */
export function optionLabel(opt: ClarificationOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

/** Returns the icon of an option, or undefined for plain strings. */
export function optionIcon(opt: ClarificationOption): ReactNode | undefined {
  return typeof opt === "string" ? undefined : opt.icon;
}

/** True when the agent recommends this option be pre-selected. */
export function optionRecommended(opt: ClarificationOption): boolean {
  return typeof opt === "string" ? false : Boolean(opt.recommended);
}

export type ClarificationQuestion = {
  explanation?: string;
  placeholder?: string;
} & (
  | {
      type?: "single";
      label: string;
      options: ClarificationOption[];
      freeText?: boolean;
      freeTextIndex?: number;
      /** Whether this question can be skipped without an answer. Defaults to false. */
      optional?: boolean;
    }
  | {
      type: "multi";
      label: string;
      options: ClarificationOption[];
      freeText?: boolean;
      freeTextIndex?: number;
      /** Whether this question can be skipped without an answer. Defaults to false. */
      optional?: boolean;
    }
  | {
      type: "rank";
      label: string;
      items: string[];
      /** Whether this question can be skipped without an answer. Defaults to false. */
      optional?: boolean;
    }
  | {
      type: "rating";
      label: string;
      /** Whether this question can be skipped without an answer. Defaults to false. */
      optional?: boolean;
    }
);

export type ClarificationAnswer =
  | { type: "single"; index: number; freeText?: string }
  | { type: "multi"; indices: number[]; freeText?: string }
  | { type: "rank"; order: string[] }
  | { type: "rating"; value: number }
  | null;

// ─── CVA ─────────────────────────────────────────────────────────────────────

export const clarificationCardVariants = cva(
  [
    "flex flex-col w-full",
    "min-w-(--sizing-chat-min) max-w-(--sizing-chat-max)",
    "font-sans bg-(--bg-surface-base) rounded-(--radius-input-card) overflow-hidden",
    "outline-none",
  ],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "shadow-(--shadow-border)",
        /** The chat panel owns the outer shadow; retain its internal separator. */
        docked: "border-t border-(--border-subtle)",
      },
      /** Heavier visual treatment for "mode-setter" cards (e.g. IntentGateCard, AcknowledgementGate). */
      weight: {
        default: "",
        prominent: "shadow-(--shadow-border-hover) bg-(--bg-surface-base)",
      },
    },
    compoundVariants: [
      // Docked cards never carry a shadow, even at prominent weight.
      { surface: "docked", weight: "prominent", className: "shadow-none" },
    ],
    defaultVariants: { surface: "shadow-border", weight: "default" },
  },
);

export type ClarificationCardBaseProps = VariantProps<
  typeof clarificationCardVariants
>;

// ─── Constants ───────────────────────────────────────────────────────────────

/** Ease-out cubic — matches the spec's fast snappy transitions. */
export const SLIDE_EASE = [0.4, 0, 0.2, 1] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the question type ('single' for undefined type). */
export function qtype(
  q: ClarificationQuestion,
): "single" | "multi" | "rank" | "rating" {
  return "type" in q && q.type ? q.type : "single";
}

/** True when a "single" question has no real suggested options — just the trailing free-text slot. */
export function isOpenTextQuestion(q: ClarificationQuestion): boolean {
  return (
    qtype(q) === "single" &&
    "freeText" in q &&
    q.freeText === true &&
    "options" in q &&
    q.options.length <= 1
  );
}

/** Returns the custom option position, retaining the trailing-option default. */
export function freeTextIndex(q: ClarificationQuestion): number {
  return "options" in q ? (q.freeTextIndex ?? q.options.length - 1) : -1;
}

/** Required custom answers must contain text; ordinary options need a selection. */
export function questionAnswered(
  q: ClarificationQuestion,
  answer: ClarificationAnswer,
): boolean {
  if (q.optional) return true;
  if (!hasAnswer(answer)) return false;
  if (
    "freeText" in q &&
    q.freeText &&
    (isOpenTextQuestion(q) || isIndexSelected(answer, freeTextIndex(q)))
  ) {
    return !!(answer && "freeText" in answer && answer.freeText?.trim());
  }
  return answer?.type !== "single" || answer.index >= 0;
}

function exclusiveOption(q: ClarificationQuestion, index: number): boolean {
  const option = "options" in q ? q.options[index] : undefined;
  return typeof option === "object" && !!option.exclusive;
}

/** Returns combined className for an option row based on focus/selected state. */
export function optionRowClass(
  isFocused: boolean,
  isSelected: boolean,
): string {
  if (isFocused) return "bg-(--bg-surface-secondary) text-(--text-primary)";
  if (isSelected) return "text-(--text-primary)";
  return "text-(--text-tertiary)";
}

/** Returns true if the answer has the given option index selected. */
export function isIndexSelected(
  answer: ClarificationAnswer,
  oi: number,
): boolean {
  if (!answer) return false;
  if (answer.type === "single") return answer.index === oi;
  if (answer.type === "multi") return answer.indices.includes(oi);
  return false;
}

/** Returns true if the given answer is non-empty (has something selected). */
export function hasAnswer(answer: ClarificationAnswer): boolean {
  if (!answer) return false;
  if (answer.type === "single") return true;
  if (answer.type === "multi") return answer.indices.length > 0;
  if (answer.type === "rank") return true;
  if (answer.type === "rating") return answer.value > 0;
  return false;
}

/** Returns status text based on question type and selection state. */
export function statusText(
  qt: "single" | "multi" | "rank" | "rating",
  answer: ClarificationAnswer,
): string {
  if (qt === "rank") return "Please rank these options to your priority";
  if (qt === "rating") {
    if (!answer || answer.type !== "rating" || answer.value <= 0)
      return "Please rate from 0 to 5 stars";
    return `${answer.value} out of 5`;
  }
  if (qt === "single") {
    if (!answer || answer.type !== "single") return "Please select 1 option";
    return "1 selected";
  }
  // multi
  if (!answer || answer.type !== "multi" || answer.indices.length === 0) {
    return "Please select 1 or more options";
  }
  return `${answer.indices.length} selected`;
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  total: number;
  current: number;
  onJumpTo: (idx: number) => void;
}

export function ProgressBar({ total, current, onJumpTo }: ProgressBarProps) {
  return (
    <div className="flex gap-1 px-4 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to question ${i + 1}`}
          onClick={() => onJumpTo(i)}
          className={cn(
            "h-0.5 flex-1 rounded-full cursor-pointer transition-colors duration-(--duration-fast)",
            i <= current ? "bg-(--text-primary)" : "bg-(--bg-surface-tertiary)",
          )}
        />
      ))}
    </div>
  );
}

// ─── SummaryView ─────────────────────────────────────────────────────────────

interface SummaryViewProps {
  questions: ClarificationQuestion[];
  answers: ClarificationAnswer[];
}

export function SummaryView({ questions, answers }: SummaryViewProps) {
  return (
    <div className="p-2">
      <div className="flex flex-col gap-6 p-1">
        <p className="text-caption font-semibold text-(--text-primary)">
          Submitted
        </p>
        {questions.map((q, qi) => {
          const ans = answers[qi];
          const qt = qtype(q);
          let displayValue: string;
          let skipped = false;

          if (!ans) {
            displayValue = "Skipped";
            skipped = true;
          } else if (ans.type === "single") {
            const opts = "options" in q ? q.options : [];
            const chosenOpt = opts[ans.index];
            const chosen =
              chosenOpt !== undefined ? optionLabel(chosenOpt) : undefined;
            displayValue =
              (isOpenTextQuestion(q) || ans.index === freeTextIndex(q)) &&
              ans.freeText
                ? chosen
                  ? `${chosen}: ${ans.freeText}`
                  : ans.freeText
                : (chosen ?? "Skipped");
          } else if (ans.type === "multi") {
            const opts = "options" in q ? q.options : [];
            if (ans.indices.length === 0) {
              displayValue = "Skipped";
              skipped = true;
            } else {
              const labels = ans.indices
                .map((i) => {
                  const opt = opts[i];
                  return opt !== undefined ? optionLabel(opt) : "";
                })
                .filter(Boolean);
              displayValue = labels.join(", ");
              if (ans.freeText) displayValue += `: ${ans.freeText}`;
            }
          } else if (ans.type === "rank") {
            displayValue = ans.order
              .map((item, i) => `${i + 1}. ${item}`)
              .join(" · ");
          } else if (ans.type === "rating") {
            if (ans.value <= 0) {
              displayValue = "Skipped";
              skipped = true;
            } else {
              displayValue = `${ans.value} out of 5`;
            }
          } else {
            displayValue = "Skipped";
            skipped = true;
          }

          return (
            <div key={qi} className="flex flex-col gap-2">
              <p className="break-words text-body text-(--text-secondary)">
                {q.label}
              </p>
              {qt === "rank" && ans?.type === "rank" ? (
                <ol className="flex flex-col gap-0.5 mt-0.5">
                  {ans.order.map((item, i) => (
                    <li
                      key={i}
                      className="break-words text-body font-semibold text-(--text-primary)"
                    >
                      {i + 1}. {item}
                    </li>
                  ))}
                </ol>
              ) : (
                <p
                  className={cn(
                    "break-words text-body font-semibold",
                    skipped
                      ? "text-(--text-secondary)"
                      : "text-(--text-primary)",
                  )}
                >
                  {displayValue}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── InlineCheckbox ───────────────────────────────────────────────────────────

interface InlineCheckboxProps {
  checked: boolean;
  disableMotion: boolean;
}

/** Multi-select checkbox indicator. Visual pattern from checkbox-group.tsx. */
export function InlineCheckbox({
  checked,
  disableMotion,
}: InlineCheckboxProps) {
  return (
    <span
      className={cn(
        "flex items-center justify-center shrink-0",
        "w-5 h-5 rounded-sm",
        checked
          ? "bg-(--bg-interactive-primary-default)"
          : "bg-(--bg-surface-base) shadow-(--shadow-border)",
      )}
    >
      {checked &&
        (disableMotion ? (
          <Check className="h-3 w-3 text-(--text-inverse)" strokeWidth={3} />
        ) : (
          <motion.span
            className="inline-flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springs.interactive}
            style={{ willChange: "transform" }}
          >
            <Check className="h-3 w-3 text-(--text-inverse)" strokeWidth={3} />
          </motion.span>
        ))}
    </span>
  );
}

// ─── useClarificationState ────────────────────────────────────────────────────

export interface UseClarificationOptions {
  questions: ClarificationQuestion[];
  onSubmit?: (answers: ClarificationAnswer[]) => void;
  autoAdvanceSingle?: boolean;
  resetSubmissionKey?: number;
}

export interface ClarificationState {
  currentIndex: number;
  focusIndex: number;
  answers: ClarificationAnswer[];
  direction: 1 | -1;
  submitted: boolean;
  pressedKey: string | null;
  freeTextValue: string;
  freeTextRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  isFirst: boolean;
  isLast: boolean;
  currentQ: ClarificationQuestion;
  currentAnswer: ClarificationAnswer;
  qt: "single" | "multi" | "rank" | "rating";
  lastOptionIdx: number;
  showFreeText: boolean;
  goTo: (idx: number, dir: 1 | -1) => void;
  submit: (overrideAnswers?: ClarificationAnswer[]) => void;
  selectSingle: (oi: number) => void;
  toggleMulti: (oi: number) => void;
  updateRank: (newOrder: string[]) => void;
  selectRating: (value: number) => void;
  advance: (answer?: ClarificationAnswer) => void;
  updateFreeText: (val: string) => void;
  cancelFreeText: () => void;
  confirmFreeText: () => void;
  clearFocusIndex: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  handleKeyUp: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

/** Seeds a question's initial answer — pre-selects recommended option(s) for single/multi, orders items for rank, otherwise unanswered. */
function initialAnswerFor(q: ClarificationQuestion): ClarificationAnswer {
  if ("items" in q) {
    return { type: "rank", order: [...q.items] };
  }
  if ("options" in q) {
    const recommendedIndices = q.options
      .map((opt, idx) => (optionRecommended(opt) ? idx : -1))
      .filter((idx) => idx !== -1);
    if (recommendedIndices.length === 0) return null;
    return qtype(q) === "multi"
      ? {
          type: "multi",
          indices: recommendedIndices.some((i) => exclusiveOption(q, i))
            ? [recommendedIndices.find((i) => exclusiveOption(q, i))!]
            : recommendedIndices,
        }
      : { type: "single", index: recommendedIndices[0]! };
  }
  return null;
}

export function useClarificationState({
  questions,
  onSubmit,
  autoAdvanceSingle = false,
  resetSubmissionKey,
}: UseClarificationOptions): ClarificationState {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [answers, setAnswers] = useState<ClarificationAnswer[]>(() =>
    questions.map((q) => initialAnswerFor(q)),
  );
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    setSubmitted(false);
  }, [resetSubmissionKey]);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [freeTextValue, setFreeTextValue] = useState("");
  const freeTextRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;
  const currentQ = questions[currentIndex]!;
  const currentAnswer = answers[currentIndex] ?? null;
  const qt = qtype(currentQ);
  const lastOptionIdx = freeTextIndex(currentQ);
  const showFreeText =
    "freeText" in currentQ &&
    currentQ.freeText === true &&
    isIndexSelected(currentAnswer, lastOptionIdx);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goTo = useCallback(
    (idx: number, dir: 1 | -1) => {
      setDirection(dir);
      setCurrentIndex(idx);
      const nextQ = questions[idx]!;
      const nextA = answers[idx];
      if (qtype(nextQ) !== "rank") {
        if (nextA?.type === "single") setFocusIndex(nextA.index);
        else if (nextA?.type === "multi") setFocusIndex(nextA.indices[0] ?? -1);
        else setFocusIndex(-1);
      }
      const nextFreeText =
        nextA?.type === "single" || nextA?.type === "multi"
          ? (nextA.freeText ?? "")
          : "";
      setFreeTextValue(nextFreeText);
    },
    [answers, questions],
  );

  const submit = useCallback(
    (overrideAnswers?: ClarificationAnswer[]) => {
      const submittedAnswers = overrideAnswers ?? answers;
      if (
        submitted ||
        !questions.every((q, i) =>
          questionAnswered(q, submittedAnswers[i] ?? null),
        )
      )
        return;
      setSubmitted(true);
      onSubmit?.(submittedAnswers);
    },
    [answers, onSubmit, questions, submitted],
  );

  // ─── Single-select ────────────────────────────────────────────────────────

  const selectSingle = useCallback(
    (oi: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        const existing = prev[currentIndex];
        const prevFreeText =
          existing?.type === "single" ? (existing.freeText ?? "") : "";
        next[currentIndex] = {
          type: "single",
          index: oi,
          freeText:
            oi === lastOptionIdx
              ? prevFreeText || freeTextValue || undefined
              : undefined,
        };
        return next;
      });
      setFocusIndex(oi);
      if ("freeText" in currentQ && currentQ.freeText && oi === lastOptionIdx) {
        setTimeout(() => freeTextRef.current?.focus(), 50);
      }
    },
    [currentIndex, currentQ, lastOptionIdx, freeTextValue],
  );

  // ─── Multi-select ─────────────────────────────────────────────────────────

  const toggleMulti = useCallback(
    (oi: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        const existing = prev[currentIndex];
        const prevIndices = existing?.type === "multi" ? existing.indices : [];
        const prevFreeText =
          existing?.type === "multi" ? (existing.freeText ?? "") : "";
        const isOn = prevIndices.includes(oi);
        const newIndices = isOn
          ? prevIndices.filter((i) => i !== oi)
          : exclusiveOption(currentQ, oi)
            ? [oi]
            : [
                ...prevIndices.filter((i) => !exclusiveOption(currentQ, i)),
                oi,
              ].sort((a, b) => a - b);
        const newFreeText = newIndices.includes(lastOptionIdx)
          ? prevFreeText || freeTextValue
          : "";
        next[currentIndex] =
          newIndices.length > 0
            ? {
                type: "multi",
                indices: newIndices,
                freeText: newFreeText || undefined,
              }
            : null;
        return next;
      });
      setFocusIndex(oi);
      const existing = answers[currentIndex];
      const prevIndices = existing?.type === "multi" ? existing.indices : [];
      const isCurrentlyOn = prevIndices.includes(oi);
      if (
        !isCurrentlyOn &&
        "freeText" in currentQ &&
        currentQ.freeText &&
        oi === lastOptionIdx
      ) {
        setTimeout(() => freeTextRef.current?.focus(), 50);
      }
    },
    [answers, currentIndex, currentQ, lastOptionIdx, freeTextValue],
  );

  // ─── Rank ─────────────────────────────────────────────────────────────────

  const updateRank = useCallback(
    (newOrder: string[]) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = { type: "rank", order: newOrder };
        return next;
      });
    },
    [currentIndex],
  );

  // ─── Rating ───────────────────────────────────────────────────────────────

  const selectRating = useCallback(
    (value: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = { type: "rating", value };
        return next;
      });
    },
    [currentIndex],
  );

  // ─── Free text ────────────────────────────────────────────────────────────

  const updateFreeText = useCallback(
    (val: string) => {
      setFreeTextValue(val);
      setAnswers((prev) => {
        const next = [...prev];
        const existing = prev[currentIndex];
        if (existing?.type === "single")
          next[currentIndex] = { ...existing, freeText: val || undefined };
        else if (existing?.type === "multi")
          next[currentIndex] = { ...existing, freeText: val || undefined };
        return next;
      });
    },
    [currentIndex],
  );

  const cancelFreeText = useCallback(() => {
    setAnswers((prev) => {
      const next = [...prev];
      const existing = prev[currentIndex];
      if (existing?.type === "single") {
        next[currentIndex] = null;
      } else if (existing?.type === "multi") {
        const newIndices = existing.indices.filter((i) => i !== lastOptionIdx);
        next[currentIndex] =
          newIndices.length > 0 ? { type: "multi", indices: newIndices } : null;
      }
      return next;
    });
    setFreeTextValue("");
  }, [currentIndex, lastOptionIdx]);

  // ─── Advance ──────────────────────────────────────────────────────────────

  const advance = useCallback(
    (answer: ClarificationAnswer = currentAnswer) => {
      if (isLast || !questionAnswered(currentQ, answer)) return;
      setAnswers((prev) => {
        const next = [...prev];
        if (next[currentIndex] === null) {
          if (qt === "single")
            next[currentIndex] = { type: "single", index: -1 };
          else if (qt === "multi")
            next[currentIndex] = {
              type: "multi",
              indices: [],
              freeText: undefined,
            };
        }
        return next;
      });
      goTo(currentIndex + 1, 1);
    },
    [isLast, currentIndex, qt, goTo, currentQ, currentAnswer],
  );

  const confirmFreeText = useCallback(() => {
    if (!questionAnswered(currentQ, currentAnswer)) return;
    if (qt === "single" && !isLast) advance();
    freeTextRef.current?.blur();
  }, [currentQ, currentAnswer, qt, isLast, advance]);

  // ─── Keyboard handlers ────────────────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (submitted) return;
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;

    setPressedKey(e.key === "Shift" ? "Shift" : e.key);

    /** After single-select, advance/submit if autoAdvanceSingle is on and not freeText. */
    function autoAdvanceAfterSingle(selectedIndex: number) {
      if (!autoAdvanceSingle) return;
      const isFreeTextOption =
        "freeText" in currentQ &&
        currentQ.freeText &&
        selectedIndex === lastOptionIdx;
      if (isFreeTextOption) return;
      if (isLast) {
        const updated = [...answers];
        updated[currentIndex] = { type: "single", index: selectedIndex };
        submit(updated);
      } else {
        advance({ type: "single", index: selectedIndex });
      }
    }

    switch (e.key) {
      case "ArrowUp":
        if (qt !== "rank" && qt !== "rating") {
          e.preventDefault();
          setFocusIndex((i) =>
            i === -1
              ? "options" in currentQ
                ? currentQ.options.length - 1
                : -1
              : Math.max(0, i - 1),
          );
        }
        break;
      case "ArrowDown":
        if (qt !== "rank" && qt !== "rating") {
          e.preventDefault();
          const optLen = "options" in currentQ ? currentQ.options.length : 0;
          setFocusIndex((i) => (i === -1 ? 0 : Math.min(optLen - 1, i + 1)));
        }
        break;
      case "Enter":
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        if (e.shiftKey && isLast) {
          submit();
        } else if (focusIndex === -1) {
          // no keyboard focus active — ignore Enter for selection
        } else if (qt === "single") {
          selectSingle(focusIndex);
          autoAdvanceAfterSingle(focusIndex);
        } else if (qt === "multi") {
          toggleMulti(focusIndex);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (!isFirst) goTo(currentIndex - 1, -1);
        break;
      case "ArrowRight":
        e.preventDefault();
        advance();
        break;
      default: {
        const num = parseInt(e.key, 10);
        const optLen = "options" in currentQ ? currentQ.options.length : 0;
        if (num >= 1 && num <= optLen) {
          e.preventDefault();
          if (qt === "single") {
            selectSingle(num - 1);
            autoAdvanceAfterSingle(num - 1);
          } else if (qt === "multi") {
            toggleMulti(num - 1);
          }
        }
      }
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;
    setPressedKey(null);
  }

  return {
    currentIndex,
    focusIndex,
    answers,
    direction,
    submitted,
    pressedKey,
    freeTextValue,
    freeTextRef,
    isFirst,
    isLast,
    currentQ,
    currentAnswer,
    qt,
    lastOptionIdx,
    showFreeText,
    goTo,
    submit,
    selectSingle,
    toggleMulti,
    updateRank,
    selectRating,
    advance,
    updateFreeText,
    cancelFreeText,
    confirmFreeText,
    clearFocusIndex: () => setFocusIndex(-1),
    handleKeyDown,
    handleKeyUp,
  };
}
