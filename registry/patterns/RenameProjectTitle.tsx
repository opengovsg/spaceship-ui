"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";
import { cn } from "#/components/ds/lib/classnames";

const MAX_PROJECT_TITLE_LENGTH = 350;

// ─── Types ───────────────────────────────────────────────────────────────────

interface RenameProjectTitleProps {
  title: string;
  onRename: (newTitle: string) => void;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Clickable project title that opens a rename modal — the modal is lifted
 * from {@link EditableTitle}'s rename flow, without that pattern's sidebar
 * toggle, 3-dot menu, or delete action.
 */
export function RenameProjectTitle({
  title,
  onRename,
  className,
}: RenameProjectTitleProps) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const [isTruncated, setIsTruncated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLButtonElement>(null);
  const lengthHintId = useId();
  const isRenameValid =
    renameValue.trim() !== "" && renameValue.length <= MAX_PROJECT_TITLE_LENGTH;

  useEffect(() => {
    if (isRenameOpen && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isRenameOpen]);

  function handleRenameOpen() {
    setRenameValue(title);
    setIsRenameOpen(true);
  }

  function handleRenameConfirm() {
    if (!isRenameValid) return;
    onRename(renameValue.trim());
    setIsRenameOpen(false);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleRenameConfirm();
    } else if (e.key === "Escape") {
      setIsRenameOpen(false);
    }
  }

  return (
    <>
      <Tooltip
        onOpenChange={(open) => {
          if (open && titleRef.current) {
            setIsTruncated(
              titleRef.current.scrollWidth > titleRef.current.clientWidth,
            );
          }
        }}
      >
        <TooltipTrigger asChild>
          <button
            ref={titleRef}
            type="button"
            onClick={handleRenameOpen}
            className={cn(
              "min-w-0 truncate font-bold text-body normal-case font-sans cursor-pointer",
              "pb-px",
              className,
            )}
            aria-label="Rename project"
          >
            {title}
          </button>
        </TooltipTrigger>
        <TooltipContent className="break-words">
          {isTruncated ? title : "Click to rename project"}
        </TooltipContent>
      </Tooltip>

      <Modal open={isRenameOpen} onClose={() => setIsRenameOpen(false)}>
        <ModalHeader>
          <ModalTitle>Rename project</ModalTitle>
        </ModalHeader>
        <div className="px-1 flex flex-col gap-1">
          <input
            ref={inputRef}
            value={renameValue}
            maxLength={MAX_PROJECT_TITLE_LENGTH}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            className={cn(
              "w-full h-9 px-2 rounded",
              "bg-(--bg-surface-base) outline-none shadow-(--shadow-border)",
              "font-sans text-body",
              "[font-weight:var(--font-weight-regular)] text-(--text-primary)",
            )}
            aria-label="Project name"
            aria-describedby={
              renameValue.length > 100 ? lengthHintId : undefined
            }
            aria-invalid={renameValue.length > MAX_PROJECT_TITLE_LENGTH}
            suppressHydrationWarning
          />
          {renameValue.length > 100 && (
            <p
              id={lengthHintId}
              className="text-caption text-(--text-secondary)"
            >
              {renameValue.length} / {MAX_PROJECT_TITLE_LENGTH} characters
            </p>
          )}
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            surface="ghost"
            onClick={() => setIsRenameOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!isRenameValid}
            onClick={handleRenameConfirm}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
