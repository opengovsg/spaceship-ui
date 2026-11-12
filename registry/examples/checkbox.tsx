"use client";

import { useState } from "react";
import { Checkbox } from "#/components/ds/ui";

export default function CheckboxExample() {
  const [agreed, setAgreed] = useState(true);
  const [notify, setNotify] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Checkbox
        label="Share this prototype with my team"
        checked={agreed}
        onCheckedChange={setAgreed}
      />
      <Checkbox
        label="Email me when the build is ready"
        size="sm"
        checked={notify}
        onCheckedChange={setNotify}
      />
      <Checkbox label="Archived projects (unavailable)" disabled />
    </div>
  );
}
