"use client";

import { SidebarHoverGroup } from "#/components/ds/ui";

const PROJECTS = ["Grant eligibility checker", "Room booking", "Queue tracker"];

export default function SidebarHoverGroupExample() {
  return (
    <SidebarHoverGroup className="w-full max-w-xs">
      {PROJECTS.map((name) => (
        <button
          key={name}
          type="button"
          data-sidebar-row
          className="w-full rounded-md px-3 py-2 text-left text-body text-(--text-primary)"
        >
          {name}
        </button>
      ))}
    </SidebarHoverGroup>
  );
}
