"use client";

import { useState } from "react";
import { ChatInputBox } from "#/components/ds/ui";

export default function ChatInputBoxExample() {
  const [value, setValue] = useState("");
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <ChatInputBox
        autoFocus={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={() => setValue("")}
      />
      <ChatInputBox
        autoFocus={false}
        disabled
        disabledReason="Spaceship is still working on your last message."
        defaultValue=""
      />
    </div>
  );
}
