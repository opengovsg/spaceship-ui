import type { ReactNode } from "react";
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "./modal";

export interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  rightContent?: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
  closeOnBackdropClick?: boolean;
}

/** Application dialog layout, composed from the shared accessible modal. */
export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  rightContent,
  footer,
  size = "md",
  closeOnBackdropClick = true,
}: AppModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size={size}
      closeOnBackdropClick={closeOnBackdropClick}
    >
      <ModalHeader className="flex-row justify-between items-start">
        <ModalTitle>{title}</ModalTitle>
        {rightContent}
      </ModalHeader>
      <div className="min-h-0 overflow-y-auto text-(--text-primary)">
        {children}
      </div>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </Modal>
  );
}
