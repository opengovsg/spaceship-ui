import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "#/components/ds/lib/classnames";
import { MdKeyboardArrowDown } from "react-icons/md";

type SelectSize = "xs" | "sm" | "md";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectProps<T = string> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Array of options to display */
  options: SelectOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when value changes */
  onChange: (value: T) => void;
  /** Size of the select */
  size?: SelectSize;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Error message displayed below the select */
  error?: string;
  /** Optional label */
  label?: string;
}

const sizeClasses: Record<SelectSize, string> = {
  xs: "text-body p-2",
  sm: "text-body p-3",
  md: "text-body p-4",
};

const iconSizeMap: Record<SelectSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
};

export const Select = <T extends string = string>({
  options,
  value,
  onChange,
  size = "sm",
  placeholder = "Select an option...",
  disabled = false,
  error,
  label,
  className,
  id: providedId,
  ...props
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const id = providedId || generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Calculate and update dropdown position
  const updatePosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: buttonRect.bottom + 8, // 8px gap (mt-2)
        left: buttonRect.left,
        width: buttonRect.width,
      });
    }
  };

  // Update position when dropdown opens and on scroll/resize
  // Use useLayoutEffect to calculate position synchronously before paint,
  // preventing the dropdown from flashing at {0,0} before jumping to position
  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
    return undefined;
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return undefined;
  }, [isOpen]);

  // Scroll selected option into view when dropdown opens
  useEffect(() => {
    if (isOpen && selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const nextIndex = Math.min(currentIndex + 1, options.length - 1);
        const nextOption = options[nextIndex];
        if (nextOption) onChange(nextOption.value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        const prevIndex = Math.max(currentIndex - 1, 0);
        const prevOption = options[prevIndex];
        if (prevOption) onChange(prevOption.value);
      }
    }
  };

  const handleOptionClick = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn("w-full", className)} ref={containerRef} {...props}>
      {label && (
        <label
          htmlFor={id}
          className="block text-body font-semibold text-content mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {/* Select Button */}
        <button
          ref={buttonRef}
          id={id}
          type="button"
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "w-full shadow-border rounded-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-controls-primary-600",
            "bg-base text-content",
            "flex items-center justify-between gap-2",
            "transition-colors duration-200",
            sizeClasses[size],
            disabled
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-surface-secondary",
            error && "ring-2 ring-controls-critical-500",
          )}
        >
          <span
            className={cn(
              "truncate text-left",
              !selectedOption && "text-content-secondary",
            )}
          >
            {selectedOption?.label || placeholder}
          </span>
          <MdKeyboardArrowDown
            size={iconSizeMap[size]}
            className={cn(
              "flex-shrink-0 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Dropdown Panel - Rendered via Portal */}
      {isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={dropdownRef}
            className={cn(
              "fixed z-[60]",
              "shadow-border rounded-lg bg-(--bg-surface-popover)",
              "max-h-60 overflow-y-auto",
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  ref={isSelected ? selectedOptionRef : null}
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    "w-full text-left p-3",
                    "transition-colors duration-150",
                    "focus:outline-none focus:ring-none cursor-pointer",
                    isSelected
                      ? "bg-controls-primary-300 text-content font-semibold"
                      : "text-content hover:bg-(--bg-interactive-secondary-default)",
                  )}
                >
                  <div className="font-semibold">{option.label}</div>
                  {option.description && (
                    <div className="text-body text-content-secondary mt-1">
                      {option.description}
                    </div>
                  )}
                </button>
              );
            })}
          </div>,
          buttonRef.current?.closest('[role="dialog"]') ?? document.body,
        )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-body text-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
