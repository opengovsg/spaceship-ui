"use client";

import { useState } from "react";
import { CheckboxGroup, CheckboxItem } from "#/components/ds/ui";

export default function CheckboxGroupExample() {
  const [value, setValue] = useState<string[]>(["officers"]);
  return (
    <div className="w-full max-w-md">
      <CheckboxGroup
        aria-label="Who will use this service"
        value={value}
        onChange={setValue}
      >
        <CheckboxItem value="officers">Public officers</CheckboxItem>
        <CheckboxItem value="citizens">Members of the public</CheckboxItem>
        <CheckboxItem value="businesses">Businesses</CheckboxItem>
        <CheckboxItem value="partners" disabled>
          Partner agencies
        </CheckboxItem>
      </CheckboxGroup>
    </div>
  );
}
