"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useId,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import TextareaAutosize, {
  type TextareaAutosizeProps,
} from "react-textarea-autosize";
import { useTextareaWidth } from "./use-textarea-width";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";
import { ArrowUp, Square } from "lucide-react";
import { Button, type ButtonProps } from "./button"; // direct sibling import — avoids circular dep with barrel

const chatInputBoxVariants = cva(
  [
    "w-full flex flex-col gap-3",
    "min-w-(--sizing-chat-min)",
    "max-w-(--sizing-chat-max)",
    "p-2",
    "bg-(--bg-surface-base)",
    "rounded-(--radius-input-card)",
  ],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "shadow-(--shadow-border)",
        /** The chat panel owns the outer shadow; retain its internal separator. */
        docked: "border-t border-(--border-subtle)",
      },
    },
    defaultVariants: { surface: "shadow-border" },
  },
);

export interface ChatInputBoxProps
  extends
    Omit<TextareaAutosizeProps, "onSubmit" | "minRows" | "maxRows">,
    VariantProps<typeof chatInputBoxVariants> {
  /** Optional context rendered inside the input's outer surface, above the textarea. */
  insetContent?: ReactNode;
  onSubmit?: (value: string) => void;
  onStop?: () => void;
  disabledReason?: string;
  /** Override the textarea lock when only submission must be disabled. */
  inputDisabled?: boolean;
  containerClassName?: string;
  /** Accessible name for the icon-only submit button — not rendered as visible text. */
  submitLabel?: string;
  /** Optional visible submit label; omitted keeps the icon-only composer. */
  submitText?: string;
  /** Disables submission while leaving the draft editable. */
  submitDisabled?: boolean;
  /** Native send-button attributes; internal disabled and submit guards stay authoritative. */
  submitButtonProps?: ButtonHTMLAttributes<HTMLButtonElement> & {
    "data-testid"?: string;
  };
  /** Accessible name for the icon-only stop button — not rendered as visible text. */
  stopLabel?: string;
  size?: "md" | "sm";
}

export const ChatInputBox = forwardRef<HTMLTextAreaElement, ChatInputBoxProps>(
  function ChatInputBox(
    {
      onSubmit,
      insetContent,
      onStop,
      containerClassName,
      className,
      value,
      onChange,
      defaultValue,
      placeholder = "Explore any problems, prototype any ideas...",
      disabled,
      inputDisabled = disabled,
      disabledReason = "Wait for the conversation to finish loading.",
      autoFocus = true,
      submitLabel = "Explore",
      submitText,
      submitDisabled: submitDisabledProp = false,
      submitButtonProps,
      id,
      stopLabel = "Stop",
      size = "md",
      surface,
      onScroll,
      onHeightChange,
      onKeyDown,
      ...props
    },
    forwardedRef,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const generatedTextareaId = useId();
    const textareaId = id ?? generatedTextareaId;
    const [overflow, setOverflow] = useState("");
    const overflowFrame = useRef<number | null>(null);
    const updateOverflow = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const top = textarea.scrollTop > 1;
      const bottom =
        textarea.scrollHeight - textarea.clientHeight - textarea.scrollTop > 1;
      const next = [top && "top", bottom && "bottom"].filter(Boolean).join(" ");
      setOverflow((previous) => (previous === next ? previous : next));
    }, []);
    // Autosize and the browser's caret scrolling can settle after the input event.
    const scheduleOverflow = useCallback(() => {
      if (overflowFrame.current !== null)
        cancelAnimationFrame(overflowFrame.current);
      overflowFrame.current = requestAnimationFrame(() => {
        overflowFrame.current = null;
        updateOverflow();
      });
    }, [updateOverflow]);
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return undefined;
      scheduleOverflow();
      const observer =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(scheduleOverflow);
      observer?.observe(textarea);
      window.addEventListener("resize", scheduleOverflow);
      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", scheduleOverflow);
        if (overflowFrame.current !== null)
          cancelAnimationFrame(overflowFrame.current);
      };
    }, [scheduleOverflow]);
    useEffect(scheduleOverflow, [value, defaultValue, size, scheduleOverflow]);
    useTextareaWidth(textareaRef);
    // Tracks typed content in uncontrolled mode so the submit button can
    // disable on empty — controlled consumers derive emptiness from `value`
    // instead and this state is unused for them.
    const [hasText, setHasText] = useState(
      () => typeof defaultValue === "string" && defaultValue.trim() !== "",
    );

    const isEmpty = typeof value === "string" ? value.trim() === "" : !hasText;
    const submitDisabled =
      disabled || submitDisabledProp || submitButtonProps?.disabled || isEmpty;

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!autoFocus || !textarea) return;
      const ownerDocument = textarea.ownerDocument;
      const focused = ownerDocument.activeElement;
      const hasActiveInteraction = focused?.closest(
        'input, textarea, [contenteditable="true"], [role="textbox"], [role="menu"], [role="menuitem"], [role="listbox"], [role="dialog"], [data-radix-popper-content-wrapper]',
      );
      if (!hasActiveInteraction) textarea.focus();
    }, [autoFocus]);

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      setHasText(e.target.value.trim() !== "");
      onChange?.(e);
      scheduleOverflow();
    }

    function handleSubmit() {
      if (submitDisabled) return;
      const val =
        typeof value === "string" ? value : (textareaRef.current?.value ?? "");
      onSubmit?.(val);
      textareaRef.current?.focus();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      onKeyDown?.(e);
      if (
        !e.defaultPrevented &&
        e.key === "Enter" &&
        !e.shiftKey &&
        !e.nativeEvent.isComposing
      ) {
        e.preventDefault();
        handleSubmit();
      }
    }

    return (
      <div
        className={cn(
          chatInputBoxVariants({ surface }),
          "cursor-text",
          containerClassName,
        )}
        onClick={() => {
          textareaRef.current?.focus();
        }}
      >
        <LabelPrimitive.Root htmlFor={textareaId} className="sr-only">
          {placeholder}
        </LabelPrimitive.Root>
        {insetContent}
        <div className="p-1">
          <TextareaAutosize
            {...props}
            ref={(element) => {
              textareaRef.current = element;
              if (typeof forwardedRef === "function") forwardedRef(element);
              else if (forwardedRef) {
                const objectRef = forwardedRef;
                objectRef.current = element;
              }
            }}
            data-composer-overflow={overflow || undefined}
            onScroll={(event) => {
              updateOverflow();
              onScroll?.(event);
            }}
            onHeightChange={(height, meta) => {
              scheduleOverflow();
              onHeightChange?.(height, meta);
            }}
            disabled={inputDisabled}
            id={textareaId}
            {...(typeof value === "string" ? { value } : { defaultValue })}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            minRows={size === "sm" ? 1 : 3}
            maxRows={10}
            className={cn(
              "block w-full resize-none bg-transparent",
              "overflow-y-auto [scrollbar-color:var(--text-tertiary)_transparent]",
              "text-body",
              "font-(family-name:--font-family-secondary)",
              "text-(--text-primary) placeholder:text-(--text-composer-placeholder)",
              "focus:outline-none",
              className,
            )}
          />
        </div>
        <div className="flex justify-end">
          {onStop ? (
            <Button
              variant="destructive"
              size="icon"
              icon={<Square />}
              aria-label={stopLabel}
              data-testid="stop-task"
              onClick={onStop}
              tooltip={stopLabel}
            />
          ) : (
            <Button
              {...(submitButtonProps as ButtonProps)}
              type={submitButtonProps?.type ?? "button"}
              className={cn(
                disabled ? "cursor-not-allowed" : "cursor-pointer",
                submitButtonProps?.className,
              )}
              variant="primary"
              surface={submitText ? "shadow" : "ghost"}
              size={submitText ? "default" : "icon"}
              icon={submitText ? undefined : <ArrowUp />}
              trailingIcon={submitText ? <ArrowUp /> : undefined}
              aria-label={submitButtonProps?.["aria-label"] ?? submitLabel}
              disabled={submitDisabled}
              disabledReason={
                disabled || submitDisabledProp || submitButtonProps?.disabled
                  ? disabledReason
                  : "Type a message to send it."
              }
              data-testid={submitButtonProps?.["data-testid"] ?? "send-prompt"}
              onClick={(event) => {
                if (submitDisabled) return;
                submitButtonProps?.onClick?.(event);
                if (!event.defaultPrevented) handleSubmit();
              }}
              tooltip={submitText ? undefined : submitLabel}
            >
              {submitText}
            </Button>
          )}
        </div>
      </div>
    );
  },
);

export { chatInputBoxVariants };
