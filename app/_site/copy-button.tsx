"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "#/components/ds/ui/button";

/** Copies text and shows a tick for a moment. Says so plainly if the browser blocks it. */
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1600);
  };
  const shown = state === "done" ? "Copied" : state === "failed" ? "Couldn't copy" : label;
  return (
    <Button
      variant="secondary"
      surface="ghost"
      size="icon-sm"
      aria-label={shown}
      title={shown}
      onClick={copy}
      leadingIcon={state === "done" ? <Check /> : <Copy />}
    />
  );
}

/** A one-line command with a copy button, the way docs sites show install commands. */
export function CommandLine({ command }: { command: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-(--bg-surface-secondary) py-1.5 pl-4 pr-1.5">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-caption text-content">{command}</code>
      <CopyButton text={command} />
    </div>
  );
}
