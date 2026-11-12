"use client";

import { useState } from "react";
import { Tabs } from "#/components/ds/ui";

const TABS = [
  { key: "problem", label: "Problem" },
  { key: "solution", label: "Solution" },
  { key: "prototype", label: "Prototype" },
];

export default function TabsExample() {
  const [active, setActive] = useState("problem");

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Tabs tabs={TABS} activeTab={active} onTabChange={setActive} />
      <p className="text-body text-(--text-secondary)">Showing: {active}</p>
    </div>
  );
}
