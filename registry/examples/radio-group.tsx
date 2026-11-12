"use client";

import { useState } from "react";
import { RadioGroup, RadioItem } from "#/components/ds/ui";

export default function RadioGroupExample() {
  const [value, setValue] = useState("weekly");

  return (
    <div className="w-full max-w-md">
      <RadioGroup value={value} onChange={setValue}>
        <RadioItem value="daily">Every day</RadioItem>
        <RadioItem value="weekly">Every week</RadioItem>
        <RadioItem value="monthly">Every month</RadioItem>
        <RadioItem value="never" disabled>
          Not at all
        </RadioItem>
      </RadioGroup>
    </div>
  );
}
