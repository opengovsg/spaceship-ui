"use client";

import { useState } from "react";
import { Callout } from "#/components/ds/ui";

export default function CalloutExample() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Callout
        color="info"
        variant="floating"
        title="Your prototype is being built"
      >
        This usually takes a few minutes.
      </Callout>
      <Callout color="warning" variant="floating" title="Link not shared yet">
        Share the prototype link with your test participants.
      </Callout>
      {!dismissed && (
        <Callout
          color="success"
          variant="notification"
          title="Project renamed"
          onDismiss={() => setDismissed(true)}
        />
      )}
    </div>
  );
}
