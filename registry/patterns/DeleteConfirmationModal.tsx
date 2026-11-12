"use client";

import type { ReactNode } from "react";
import {
  Button,
  Modal,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "#/components/ds/ui";

export interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
  /** e.g. `Delete ${name}?` */
  title: string;
  /** Consequences of the delete, caller-composed. */
  description: ReactNode;
  /** Inline failure, kept open so the user can retry — mirrors `ExploreSolutionsModal`. */
  errorMessage: string | null;
  /** Defaults to "Delete" — override for callers whose action reads better under a different verb (e.g. "Discard"). */
  confirmLabel?: string;
  /** Defaults to "Deleting..." — shown on the confirm button while `isConfirming`. */
  confirmingLabel?: string;
  returnFocusFallback?: () => HTMLElement | null;
}

/**
 * Generic destructive confirmation modal, composed by both the sidebar's
 * project-delete flow and a solution page's own delete flow — each supplies
 * its own title/description copy. Built on the generic `Modal` primitives,
 * same shape as `ExploreSolutionsModal` but with a destructive confirm
 * button instead of a success one.
 */
export function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  isConfirming,
  title,
  description,
  errorMessage,
  confirmLabel = "Delete",
  confirmingLabel = "Deleting...",
  returnFocusFallback,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      returnFocusFallback={returnFocusFallback}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription>{description}</ModalDescription>
      </ModalHeader>

      {errorMessage && (
        <p
          role="alert"
          className="px-1 text-body font-semibold text-(--text-status-error)"
        >
          {errorMessage}
        </p>
      )}

      <ModalFooter>
        <Button
          variant="secondary"
          surface="shadow"
          onClick={onClose}
          disabled={isConfirming}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? confirmingLabel : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
