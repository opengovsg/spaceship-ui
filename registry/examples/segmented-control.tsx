"use client";

import { useState } from "react";
import { SegmentedControl } from "#/components/ds/ui/segmented-control";

export default function SegmentedControlExample() {
  const [value, setValue] = useState("problem");

  return (
    <div className="w-full max-w-md">
      <SegmentedControl
        label="Project stage"
        value={value}
        onChange={setValue}
        options={[
          { value: "problem", label: "Problem" },
          { value: "solution", label: "Solution" },
          { value: "prototype", label: "Prototype" },
        ]}
      />
    </div>
  );
}
