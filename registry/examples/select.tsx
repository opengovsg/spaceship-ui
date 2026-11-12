"use client";

import { useState } from "react";
import { Select } from "#/components/ds/ui";

const OPTIONS = [
  { value: "idea", label: "Validate an idea", description: "Test it before you build" },
  { value: "prototype", label: "Build a prototype", description: "Make something clickable" },
  { value: "handover", label: "Hand over to a vendor" },
];

export default function SelectExample() {
  const [value, setValue] = useState("idea");
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Select
        label="What do you want to do?"
        options={OPTIONS}
        value={value}
        onChange={setValue}
      />
      <Select
        label="Project stage"
        options={OPTIONS}
        value=""
        onChange={setValue}
        placeholder="Choose a stage"
        error="Pick a stage to continue."
      />
    </div>
  );
}
