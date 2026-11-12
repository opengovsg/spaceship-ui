import React, { useRef, useEffect, useId } from "react";
import { cn } from "#/components/ds/lib/classnames";

export interface OTPInputProps {
  id?: string;
  "aria-describedby"?: string;
  /** Current OTP value */
  value: string;
  /** Callback when OTP value changes */
  onValueChange: (value: string) => void;
  /** Error state */
  error?: boolean;
  /** Error message displayed below the input */
  errorMessage?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Test ID for testing purposes */
  "data-testid"?: string;
}

export const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      value,
      id,
      "aria-describedby": ariaDescribedBy,
      onValueChange,
      error = false,
      errorMessage,
      disabled = false,
      "data-testid": dataTestId,
    },
    ref,
  ) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const generatedId = useId();

    // Ensure value is always 6 characters or less
    const normalizedValue = (value || "").slice(0, 6).toUpperCase();

    useEffect(() => {
      // Focus first input on mount
      if (inputRefs.current[0] && !disabled) {
        inputRefs.current[0].focus({ preventScroll: true });
      }
    }, [disabled]);

    const handleChange = (index: number, inputValue: string) => {
      // Only allow alphanumeric characters
      const sanitized = inputValue.toUpperCase().replace(/[^A-Z0-9]/g, "");

      if (sanitized.length === 0) {
        // Handle backspace/delete
        const newValue =
          normalizedValue.slice(0, index) + normalizedValue.slice(index + 1);
        onValueChange(newValue);
        return;
      }

      // Handle single character input
      if (sanitized.length === 1) {
        const newValue =
          normalizedValue.slice(0, index) +
          sanitized +
          normalizedValue.slice(index + 1);
        onValueChange(newValue);

        // Move to next input
        if (index < 5 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
        return;
      }

      // Handle paste with multiple characters
      if (sanitized.length > 1) {
        const pastedChars = sanitized.slice(0, 6 - index);
        const newValue =
          normalizedValue.slice(0, index) +
          pastedChars +
          normalizedValue.slice(index + pastedChars.length);
        onValueChange(newValue.slice(0, 6));

        // Focus the next empty input or the last one
        const nextIndex = Math.min(index + pastedChars.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace" && !normalizedValue[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select the content when focused
      e.target.select();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData
        .getData("text")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);

      if (pastedData) {
        onValueChange(pastedData);
        // Focus the last filled input
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
    };

    return (
      <div ref={ref} className="w-full" data-testid={dataTestId}>
        <div className="flex justify-center items-center gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <input
              key={index}
              id={index === 0 ? (id ?? `${generatedId}-0`) : undefined}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={normalizedValue[index] || ""}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={handleFocus}
              onPaste={handlePaste}
              disabled={disabled}
              className={cn(
                "bg-base shadow-border",
                "rounded-md",
                "p-0",
                "text-title",
                "w-10 h-10 text-center outline-none",
                "transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-controls-primary-600",
                error && "ring-2 ring-controls-critical-500 text-content-error",
                disabled &&
                  "bg-surface-secondary cursor-not-allowed opacity-50",
              )}
              aria-invalid={error}
              aria-describedby={ariaDescribedBy}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>
        {error && errorMessage && (
          <p className="mt-2 text-content-error font-semibold text-body text-center">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

OTPInput.displayName = "OTPInput";
