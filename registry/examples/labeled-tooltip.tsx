"use client";

import { Button, LabeledTooltip } from "#/components/ds/ui";

export default function LabeledTooltipExample() {
  return (
    <div className="flex items-start gap-3">
      <LabeledTooltip label="Copy the prototype link">
        <Button variant="secondary">Share</Button>
      </LabeledTooltip>
      <LabeledTooltip label="Open in a new tab" direction="down">
        <Button variant="secondary">Preview</Button>
      </LabeledTooltip>
    </div>
  );
}
