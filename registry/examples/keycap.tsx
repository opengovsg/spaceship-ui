"use client";

import { Keycap, KeyCombo } from "#/components/ds/ui";

export default function KeycapExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <Keycap>Esc</Keycap>
        <Keycap variant="lit">Enter</Keycap>
        <Keycap pressed>Shift</Keycap>
      </div>
      <div className="flex items-center gap-2 text-body text-(--text-secondary)">
        Send message
        <KeyCombo>
          <Keycap>Cmd</Keycap>
          <Keycap>Enter</Keycap>
        </KeyCombo>
      </div>
    </div>
  );
}
