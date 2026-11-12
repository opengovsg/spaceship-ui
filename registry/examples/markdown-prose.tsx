"use client";

import { MarkdownProse } from "#/components/ds/ui";

const markdown = `## Problem statement

Licensing officers check each application by hand across three systems.

- Takes about 40 minutes per application
- Two officers review every case

| Step | Owner |
| --- | --- |
| Intake | Front desk |
| Review | Licensing officer |
`;

export default function MarkdownProseExample() {
  return (
    <div className="w-full max-w-md">
      <MarkdownProse surface="shadow-border">{markdown}</MarkdownProse>
    </div>
  );
}
