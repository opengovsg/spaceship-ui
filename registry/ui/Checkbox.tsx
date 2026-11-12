import React, { useId } from "react";
import { cn } from "#/components/ds/lib/classnames";
import { FaCheck } from "react-icons/fa6";

type CheckboxSize = "xs" | "sm" | "md";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Size of the checkbox */
  size?: CheckboxSize;
  /** Error message displayed below the checkbox */
  error?: string;
  /** Callback when checkbox state changes */
  onCheckedChange?: (checked: boolean) => void;
}

const sizeClasses: Record<CheckboxSize, string> = {
  xs: "w-4 h-4",
  sm: "w-5 h-5",
  md: "w-6 h-6",
};

const labelSizeClasses: Record<CheckboxSize, string> = {
  xs: "text-body",
  sm: "text-body",
  md: "text-body",
};

const errorSizeClasses: Record<CheckboxSize, string> = {
  xs: "text-caption",
  sm: "text-body",
  md: "text-body",
};

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      size = "sm",
      error,
      onCheckedChange,
      className,
      disabled,
      id: providedId,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const checkboxClasses = cn(
      "appearance-none cursor-pointer transition-colors duration-200",
      "border border-controls-secondary-300 rounded-sm",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-controls-primary-600",
      disabled
        ? "bg-surface-secondary cursor-not-allowed border-controls-secondary-300 opacity-60"
        : "bg-base",
      sizeClasses[size],
      className,
    );

    const checkmarkClasses = cn(
      "pointer-events-none absolute inset-0 flex items-center justify-center text-content-inverse font-bold p-1 pb-2",
      checked && "text-content-secondary",
      disabled && checked && "text-content-tertiary",
      size === "xs" && "text-caption",
      size === "sm" && "text-body",
      size === "md" && "text-body",
    );

    return (
      <div className="w-full">
        <div className="flex items-start gap-2">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              className={checkboxClasses}
              disabled={disabled}
              checked={checked}
              defaultChecked={defaultChecked}
              onChange={handleChange}
              {...props}
            />
            {/* Checkmark icon */}
            <div className={checkmarkClasses}>
              <FaCheck />
            </div>
          </div>
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "text-content-secondary cursor-pointer flex-1",
                labelSizeClasses[size],
                disabled && "text-content-tertiary cursor-not-allowed",
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p
            className={cn(
              "mt-2 text-controls-critical-600 font-semibold",
              errorSizeClasses[size],
            )}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
