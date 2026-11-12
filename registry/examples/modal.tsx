"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "#/components/ds/ui";

export default function ModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete project</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader>
          <ModalTitle>Delete this project?</ModalTitle>
          <ModalDescription>
            Your prototype and notes will be removed. You cannot undo this.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button
            variant="secondary"
            surface="ghost"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => setOpen(false)}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
