"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  EllipsisVertical,
  PenLine,
  PanelLeft,
  Trash2,
} from "lucide-react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui";
import { cn } from "#/components/ds/lib/classnames";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditableTitleProps {
  title: string;
  onTitleChange?: (newTitle: string) => void;
  onMenuClick?: () => void;
  /** When provided, replaces the sidebar toggle with a return-to-canvas button. */
  onBack?: () => void;
  onDelete?: () => void;
  error?: string;
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EditableTitle({
  title,
  onTitleChange,
  onMenuClick,
  onBack,
  onDelete,
  error,
  className,
}: EditableTitleProps) {
  // ─── State & Refs ───────────────────────────────────────────────────────

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenameOpen && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isRenameOpen]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  function handleRenameOpen() {
    setRenameValue(title);
    setIsRenameOpen(true);
  }

  function handleRenameConfirm() {
    if (error) return;
    onTitleChange?.(renameValue);
    setIsRenameOpen(false);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !error) {
      handleRenameConfirm();
    } else if (e.key === "Escape") {
      setIsRenameOpen(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 py-3",
          "bg-gradient-to-b from-(--bg-surface-fade) to-transparent",
          className,
        )}
      >
        {/* Left: Back navigation or standalone sidebar toggle */}
        {(onBack || onMenuClick) && (
          <Button
            variant="secondary"
            surface="shadow"
            size="icon"
            className="shrink-0"
            onClick={onBack ?? onMenuClick}
            icon={onBack ? <ArrowLeft /> : <PanelLeft />}
            aria-label={onBack ? "Return to canvas" : "Toggle sidebar"}
          />
        )}

        {/* Center: Static title */}
        <span
          className={cn(
            "flex-1 truncate text-center",
            "font-sans text-body",
            "[font-weight:var(--font-weight-semibold)] text-(--text-primary)",
          )}
        >
          {title}
        </span>

        {/* Right: 3-dot menu — isolateScale keeps bounding rect stable so dropdown doesn't shift */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              surface="shadow"
              size="icon"
              isolateScale
              className="shrink-0"
              icon={<EllipsisVertical />}
              aria-label="Project actions"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleRenameOpen}>
              <PenLine />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rename modal */}
      <Modal open={isRenameOpen} onClose={() => setIsRenameOpen(false)}>
        <ModalHeader>
          <ModalTitle>Rename project</ModalTitle>
        </ModalHeader>
        <div className="px-1 flex flex-col gap-1">
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            className={cn(
              "w-full h-9 px-2 rounded",
              "bg-(--bg-surface-base) outline-none shadow-(--shadow-border)",
              "font-sans text-body",
              "[font-weight:var(--font-weight-regular)] text-(--text-primary)",
            )}
            aria-label="Project name"
            suppressHydrationWarning
          />
          {error && (
            <span className="text-body [font-weight:var(--font-weight-semibold)] text-(--text-status-error)">
              {error}
            </span>
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
            disabled={!!error}
            onClick={handleRenameConfirm}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
