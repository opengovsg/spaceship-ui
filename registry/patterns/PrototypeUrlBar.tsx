"use client";

import { Copy, Globe, CloudUpload } from "lucide-react";
import { Button } from "../ui";
import { cn } from "#/components/ds/lib/classnames";

export interface PrototypeUrlBarProps {
  /** The published prototype's URL, shown read-only. */
  url: string;
  onCopy?: () => void;
  onPublish?: () => void;
  /** Label for the publish button. */
  publishLabel?: string;
  /** Accessible label for the icon-only copy button. */
  copyLabel?: string;
  className?: string;
}

/**
 * The read-only URL row above a published prototype — globe icon, the URL
 * itself, a copy button, and a publish action. Distinct from `ShareableLink`,
 * which is an editable domain input for *creating* a link; this only
 * *displays* one that already exists.
 */
export function PrototypeUrlBar({
  url,
  onCopy,
  onPublish,
  publishLabel = "Publish",
  copyLabel = "Copy prototype URL",
  className,
}: PrototypeUrlBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-artifact-address) p-2",
        className,
      )}
    >
      <Globe aria-hidden className="size-4 shrink-0 text-(--text-secondary)" />
      <label className="sr-only" htmlFor="prototype-url">
        Prototype URL
      </label>
      <input
        id="prototype-url"
        readOnly
        value={url}
        className="min-w-0 flex-1 bg-transparent font-sans text-body text-(--text-primary) outline-none"
      />
      <Button
        variant="secondary"
        size="icon"
        leadingIcon={<Copy />}
        aria-label={copyLabel}
        onClick={onCopy}
      />
      <Button
        variant="success"
        trailingIcon={<CloudUpload />}
        onClick={onPublish}
      >
        {publishLabel}
      </Button>
    </div>
  );
}
