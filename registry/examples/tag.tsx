"use client";

import { Tag } from "#/components/ds/ui";

export default function TagExample() {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        <Tag variant="neutral">Draft</Tag>
        <Tag variant="success">Approved</Tag>
        <Tag variant="warning">In review</Tag>
        <Tag variant="error">Rejected</Tag>
        <Tag variant="info">New</Tag>
      </div>
      <div className="flex flex-wrap gap-2">
        <Tag size="sm" variant="success">Approved</Tag>
        <Tag size="sm" variant="info">New</Tag>
      </div>
    </div>
  );
}
