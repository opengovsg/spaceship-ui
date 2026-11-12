"use client";

import { TaskList } from "#/components/ds/ui";

const ITEMS = [
  "Set up the case list page",
  "Add the client record summary",
  "Flag missing documents",
  "Add a status filter",
];

export default function TaskListExample() {
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <TaskList items={ITEMS} completedCount={2} isActive />
      <TaskList items={ITEMS} completedCount={4} showProgressBar={false} />
    </div>
  );
}
