"use client";

import { useState } from "react";
import { BarChart3, MessageSquare, MousePointerClick } from "lucide-react";
import { TestingNav } from "#/components/ds/patterns";

const sections = [
  {
    label: "Analytics",
    items: [
      {
        id: "usage",
        title: "Usage report",
        description: "See how people use your prototype",
        icon: <BarChart3 />,
      },
      {
        id: "tracking",
        title: "Event tracking",
        description: "Track usage on your prototype",
        icon: <MousePointerClick />,
      },
    ],
  },
  {
    label: "Interviews",
    items: [
      {
        id: "interviews",
        title: "User interviews",
        description: "Talk to your test participants",
        icon: <MessageSquare />,
        disabled: true,
        disabledReason: "Interviews open after your prototype is shared.",
      },
    ],
  },
];

export default function TestingNavExample() {
  const [value, setValue] = useState("usage");
  return (
    <div className="w-full max-w-xs">
      <TestingNav sections={sections} value={value} onChange={setValue} />
    </div>
  );
}
