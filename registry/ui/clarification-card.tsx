"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import TextareaAutosize from "react-textarea-autosize";
import { useTextareaWidth } from "./use-textarea-width";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CornerDownLeft,
  Star,
  X,
} from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import { Button } from "./button";
import { ScrollFade } from "./scroll-fade";
import { SidebarHoverGroup } from "./sidebar-hover-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { SortableList } from "./sortable-list";
import {
  clarificationCardVariants,
  type ClarificationCardBaseProps,
  type ClarificationQuestion,
  type ClarificationAnswer,
  isIndexSelected,
  isOpenTextQuestion,
  questionAnswered,
  statusText,
  optionLabel,
  optionIcon,
  SummaryView,
  InlineCheckbox,
  useClarificationState,
} from "./clarification-card-shared";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClarificationCardProps extends ClarificationCardBaseProps {
  questions: ClarificationQuestion[];
  onSubmit?: (answers: ClarificationAnswer[]) => void;
  /** Change after a failed submission to retry with the existing answers. */
  resetSubmissionKey?: number;
  onClose?: () => void;
  disableMotion?: boolean;
  /**
   * Copy for the inline free-text row. Defaults to `"Type another option"`,
   * which only reads correctly when there *are* other options — a question with
   * no suggestions should pass something like `"Type your answer"`.
   */
  freeTextPlaceholder?: string;
  /** Custom label for the submit button. Defaults to "Submit". */
  submitLabel?: string;
  freeTextMaxLength?: number;
  answerMinRows?: number;
  customValueMaxLength?: number;
  /** Returns the max pixel height the card may expand to, e.g. when docked in a ChatPanel. */
  getMaxHeight?: () => number;
  className?: string;
}

// ─── RatingInput ─────────────────────────────────────────────────────────────

const RATING_STARS = [1, 2, 3, 4, 5];

function RatingInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (rating: number) => void;
}) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const displayRating = hoveredRating ?? value ?? 0;

  return (
    <div className="flex flex-col items-start gap-3 p-2">
      <div
        className={cn(
          "relative rounded-(--radius-inner)",
          isFocused &&
            "outline-2 outline-offset-4 outline-(--border-input-focus)",
        )}
      >
        {/* Accessible range input for keyboard/screen-reader users */}
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={value ?? 0}
          onChange={(e) => {
            const next = Number(e.target.value);
            onChange(next);
          }}
          onFocus={() => {
            setIsFocused(true);
            setHoveredRating(null);
          }}
          onBlur={() => {
            setIsFocused(false);
            setHoveredRating(null);
          }}
          aria-label="Rate from 0 to 5 stars (use arrow keys to adjust)"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={value ?? 0}
          aria-valuetext={value ? `${value} out of 5 stars` : "Not rated"}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
        {/* Visual star representation */}
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoveredRating(null)}
        >
          {RATING_STARS.map((star) => {
            const isFull = displayRating >= star;
            const isHalf = !isFull && displayRating >= star - 0.5;

            return (
              <div
                key={star}
                className={cn(
                  "relative h-6 w-6 cursor-pointer rounded-sm",
                  isFocused &&
                    star === Math.max(1, Math.ceil(value ?? 0)) &&
                    "outline-2 outline-offset-2 outline-(--border-input-focus)",
                )}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                  setHoveredRating(isLeftHalf ? star - 0.5 : star);
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                  onChange(isLeftHalf ? star - 0.5 : star);
                }}
              >
                <Star
                  className="absolute inset-0 h-6 w-6 text-(--text-secondary)"
                  aria-hidden="true"
                />
                {(isFull || isHalf) && (
                  <Star
                    className="absolute inset-0 h-6 w-6 fill-current text-(--bg-interactive-primary-default)"
                    style={
                      isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined
                    }
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {value !== null && value > 0 && (
        <span className="text-caption text-(--text-secondary)">
          {value} out of 5
        </span>
      )}
    </div>
  );
}

// ━━━ ClarificationCard ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ClarificationCard({
  questions,
  onSubmit,
  resetSubmissionKey,
  onClose,
  disableMotion = false,
  submitLabel = "Submit",
  freeTextPlaceholder = "Type another option",
  getMaxHeight,
  freeTextMaxLength,
  answerMinRows = 1,
  customValueMaxLength,
  surface,
  weight,
  className,
}: ClarificationCardProps) {
  const {
    currentIndex,
    focusIndex,
    answers,
    submitted,
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
    clearFocusIndex,
    handleKeyDown,
    handleKeyUp,
  } = useClarificationState({ questions, onSubmit, resetSubmissionKey });

  const cardRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>();
  useLayoutEffect(() => {
    if (!getMaxHeight) return;
    const measure = () => setMaxHeight(getMaxHeight());
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    const parent = cardRef.current?.parentElement;
    if (parent) observer?.observe(parent);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [getMaxHeight]);

  // Keyboard navigation uses aria-activedescendant while focus stays on the card.
  // Scroll only this question viewport, leaving surrounding chat panels in place.
  useLayoutEffect(() => {
    if (submitted || focusIndex < 0) return;
    const viewport = cardRef.current?.querySelector<HTMLElement>(
      '[aria-label="Question options"]',
    );
    const option = viewport?.querySelector<HTMLElement>(
      `[id="cc-opt-${currentIndex}-${focusIndex}"]`,
    );
    if (!viewport || !option) return;
    const viewportRect = viewport.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    const clearTop = viewportRect.top + 16;
    const clearBottom = viewportRect.bottom - 16;
    if (optionRect.top < clearTop) {
      viewport.scrollTop += optionRect.top - clearTop;
    } else if (optionRect.bottom > clearBottom) {
      viewport.scrollTop += optionRect.bottom - clearBottom;
    }
  }, [currentIndex, focusIndex, submitted]);

  const questionPlaceholder = currentQ.placeholder ?? freeTextPlaceholder;
  const nextDisabled = !questionAnswered(currentQ, currentAnswer);
  const nextDisabledReason = "Answer this question to continue.";

  const openTextRef = useRef<HTMLTextAreaElement>(null);
  useTextareaWidth(openTextRef, currentIndex);
  useTextareaWidth(freeTextRef, `${currentIndex}:${showFreeText}`);

  // Open-text questions have no option row to click — seed the answer and
  // focus the field automatically instead of requiring a click to reveal it.
  useEffect(() => {
    if (!isOpenTextQuestion(currentQ)) return;
    if (currentAnswer === null) selectSingle(0);
    const field = openTextRef.current;
    if (!field) return;
    const ownerDocument = field.ownerDocument;
    const focused = ownerDocument.activeElement;
    if (
      !focused ||
      focused === ownerDocument.body ||
      focused === ownerDocument.documentElement ||
      cardRef.current?.contains(focused)
    )
      field.focus();
    // oxlint-disable-next-line react/exhaustive-deps
  }, [currentIndex]);

  return (
    <motion.div
      ref={cardRef}
      role="group"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={cn(
        clarificationCardVariants({ surface, weight }),
        "relative max-h-[85vh]",
        className,
      )}
      style={{ maxHeight }}
    >
      {/* Dismiss button — only when onClose provided and card is interactive */}
      {onClose && !submitted && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className={cn(
            "absolute top-2 right-2 z-10 p-1 rounded-(--radius-inner)",
            "text-(--text-secondary) hover:text-(--text-primary)",
            "hover:bg-(--bg-surface-secondary)",
            "transition-colors duration-(--duration-fast)",
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {/* Content: question flow or summary */}
      {submitted ? (
        <SummaryView questions={questions} answers={answers} />
      ) : (
        <ScrollFade
          aria-label="Question options"
          className="flex-1 [--scroll-fade-surface:var(--bg-surface-base)]"
          contentClassName="py-2"
        >
          <div className="px-2">
            <div className="flex flex-col gap-3 p-1">
              {/* Question group — pagination + title */}
              <div className="flex flex-col gap-2">
                {questions.length > 1 && (
                  <p className="font-sans normal-case text-caption [font-weight:var(--font-weight-bold)] text-(--text-secondary)">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                )}
                <h5
                  className="text-subtitle font-semibold text-(--text-primary)"
                  id={`cc-q-${currentIndex}`}
                >
                  {currentQ.label}
                </h5>
                {currentQ.explanation && (
                  <p className="text-body text-(--text-secondary)">
                    {currentQ.explanation}
                  </p>
                )}
                {qt === "multi" && (
                  <p className="font-sans normal-case text-caption text-(--text-secondary)">
                    Please select 1 or more of the suggested options
                  </p>
                )}
              </div>

              {/* Answer group — options/rank + status footer */}
              <div className="flex flex-col gap-3">
                {/* Open text — no real suggested options, just a plain field */}
                {isOpenTextQuestion(currentQ) && (
                  <TextareaAutosize
                    maxLength={freeTextMaxLength}
                    ref={openTextRef}
                    minRows={Math.max(3, answerMinRows)}
                    maxRows={10}
                    value={freeTextValue}
                    placeholder={questionPlaceholder}
                    onChange={(e) => updateFreeText(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key !== "Enter" ||
                        e.shiftKey ||
                        e.nativeEvent.isComposing
                      ) {
                        return;
                      }
                      if (!freeTextValue.trim()) return;
                      e.preventDefault();
                      if (isLast) submit();
                      else advance();
                    }}
                    aria-labelledby={`cc-q-${currentIndex}`}
                    className={cn(
                      "block w-full resize-none overflow-y-auto rounded outline-none [scrollbar-color:var(--text-tertiary)_transparent]",
                      "text-body",
                      "text-(--text-primary) placeholder:text-(--text-composer-placeholder)",
                    )}
                  />
                )}

                {/* Option list — single or multi */}
                {!isOpenTextQuestion(currentQ) &&
                  qt !== "rank" &&
                  "options" in currentQ && (
                    <div
                      role="listbox"
                      aria-multiselectable={qt === "multi"}
                      aria-labelledby={`cc-q-${currentIndex}`}
                      aria-activedescendant={`cc-opt-${currentIndex}-${focusIndex}`}
                      className="flex flex-col"
                    >
                      <SidebarHoverGroup
                        key={currentIndex}
                        className="gap-0"
                        disableMotion={disableMotion}
                      >
                        {currentQ.options.map((opt, oi) => {
                          const isFocused = focusIndex === oi;
                          const isSelected = isIndexSelected(currentAnswer, oi);
                          const isLastOpt = oi === lastOptionIdx;
                          const isInlineFreeText = showFreeText && isLastOpt;
                          const icon = optionIcon(opt);
                          const label = optionLabel(opt);

                          const rowClass =
                            isFocused || isSelected
                              ? "bg-(--bg-sidebar-selected) text-(--text-primary)"
                              : "text-(--text-secondary)";

                          return (
                            <div
                              key={oi}
                              id={`cc-opt-${currentIndex}-${oi}`}
                              role="option"
                              aria-selected={isSelected}
                              data-sidebar-row=""
                              data-selected={isSelected || isFocused}
                              onMouseEnter={() => clearFocusIndex()}
                              onClick={() => {
                                if (isInlineFreeText) {
                                  freeTextRef.current?.focus();
                                  return;
                                }
                                if (qt === "single") selectSingle(oi);
                                else toggleMulti(oi);
                              }}
                              className={cn(
                                "relative z-10 flex items-center gap-4 p-3 rounded-lg cursor-pointer",
                                "hover:text-(--text-primary)",
                                rowClass,
                              )}
                            >
                              {/* Left indicator: icon if provided, otherwise number badge */}
                              {icon ? (
                                <span
                                  aria-hidden="true"
                                  className="flex items-center justify-center shrink-0 w-6 h-6 [&>svg]:h-4 [&>svg]:w-4"
                                >
                                  {icon}
                                </span>
                              ) : (
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "flex items-center justify-center shrink-0 w-6 h-6 rounded",
                                    "bg-(--bg-interactive-tertiary-pressed)",
                                    "text-caption font-semibold",
                                    "text-(--text-primary)",
                                  )}
                                >
                                  {String(oi + 1)}
                                </span>
                              )}

                              <span className="flex flex-1 min-w-0 flex-col">
                                {isInlineFreeText ? (
                                  <TextareaAutosize
                                    maxLength={customValueMaxLength}
                                    ref={(field) => {
                                      freeTextRef.current = field;
                                    }}
                                    minRows={answerMinRows}
                                    maxRows={10}
                                    value={freeTextValue}
                                    placeholder={label || questionPlaceholder}
                                    aria-label={label || questionPlaceholder}
                                    onChange={(e) =>
                                      updateFreeText(e.target.value)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === "Enter" &&
                                        !e.shiftKey &&
                                        !e.nativeEvent.isComposing
                                      ) {
                                        e.preventDefault();
                                        confirmFreeText();
                                      }
                                      if (e.key === "Escape") {
                                        e.preventDefault();
                                        cancelFreeText();
                                      }
                                    }}
                                    className={cn(
                                      "flex-1 min-w-0 resize-none overflow-y-auto bg-transparent outline-none",
                                      "text-body",
                                      "text-(--text-primary) placeholder:text-(--text-composer-placeholder)",
                                    )}
                                  />
                                ) : isLastOpt &&
                                  "freeText" in currentQ &&
                                  currentQ.freeText ? (
                                  <span className="flex-1 text-body text-(--text-composer-placeholder)">
                                    {label || questionPlaceholder}
                                  </span>
                                ) : (
                                  <span className="flex-1 text-body">
                                    {label}
                                  </span>
                                )}

                                {typeof opt !== "string" && opt.description && (
                                  <span className="block text-caption text-(--text-secondary)">
                                    {opt.description}
                                  </span>
                                )}
                              </span>

                              {/* Right indicator */}
                              {qt === "multi" && (
                                <InlineCheckbox
                                  checked={isSelected}
                                  disableMotion={disableMotion}
                                />
                              )}
                              {qt === "single" &&
                                (isSelected || isInlineFreeText) && (
                                  <Check
                                    className="h-4 w-4 text-(--text-secondary) shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                            </div>
                          );
                        })}
                      </SidebarHoverGroup>
                    </div>
                  )}

                {/* Rank — SortableList */}
                {qt === "rank" && (
                  <SortableList
                    items={
                      currentAnswer?.type === "rank"
                        ? currentAnswer.order
                        : (currentQ as { items: string[] }).items
                    }
                    onReorder={updateRank}
                    surface="default"
                    dividers={false}
                  />
                )}

                {/* Rating — star input */}
                {qt === "rating" && (
                  <RatingInput
                    value={
                      currentAnswer?.type === "rating"
                        ? currentAnswer.value
                        : null
                    }
                    onChange={selectRating}
                  />
                )}

                {/* Status footer — not meaningful for a freeform open-text field */}
                {!isOpenTextQuestion(currentQ) && (
                  <div className="p-2 border-t border-(--bg-surface-tertiary)">
                    <p className="text-caption font-semibold text-(--text-secondary)">
                      {statusText(qt, currentAnswer)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollFade>
      )}

      {/* Button footer */}
      {!submitted && (
        <div className="flex items-center justify-between p-2 gap-2">
          {/* Back */}
          <div>
            {!isFirst && (
              <Button
                variant="secondary"
                surface="ghost"
                leadingIcon={<ArrowLeft />}
                disableMotion={disableMotion}
                onClick={() => goTo(currentIndex - 1, -1)}
              >
                Back
              </Button>
            )}
          </div>

          {/* Skip + Next / Submit */}
          <div className="flex items-center gap-2">
            {isLast ? (
              <Button
                variant="primary"
                trailingIcon={<CornerDownLeft />}
                disableMotion={disableMotion}
                disabled={nextDisabled}
                onClick={() => submit()}
              >
                {submitLabel}
              </Button>
            ) : (
              <>
                {currentQ.optional && (
                  <Button
                    variant="secondary"
                    surface="ghost"
                    disableMotion={disableMotion}
                    onClick={() => advance()}
                  >
                    Skip
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={nextDisabled ? 0 : undefined}
                        aria-label={
                          nextDisabled
                            ? `Next: ${nextDisabledReason}`
                            : undefined
                        }
                        className={cn(
                          "inline-flex",
                          nextDisabled &&
                            "cursor-[url('/locked-cursor.svg')_8_8,not-allowed]",
                        )}
                      >
                        <Button
                          variant="primary"
                          trailingIcon={<ArrowRight />}
                          disabled={nextDisabled}
                          disableMotion={disableMotion}
                          onClick={() => advance()}
                        >
                          Next
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {nextDisabled && (
                      <TooltipContent>{nextDisabledReason}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
