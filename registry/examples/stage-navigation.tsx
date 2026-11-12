"use client";

import { useState } from "react";
import { FileText, FlaskConical, Lightbulb, Rocket } from "lucide-react";
import { StageNavigation } from "#/components/ds/ui";

const tabs = [
  { id: "problem", label: "Problem", icon: <Lightbulb /> },
  { id: "prototype", label: "Prototype", icon: <FileText /> },
  { id: "testing", label: "Testing", icon: <FlaskConical /> },
  {
    id: "launch",
    label: "Launch",
    icon: <Rocket />,
    disabled: true,
    disabledReason: "Launch becomes available when the prototype is ready.",
  },
];

export default function StageNavigationExample() {
  const [active, setActive] = useState("problem");
  return (
    <div className="w-full max-w-md">
      <StageNavigation
        tabs={tabs}
        activeTabId={active}
        onChange={setActive}
      />
    </div>
  );
}
