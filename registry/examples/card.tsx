"use client";

import { Card } from "#/components/ds/ui";

export default function CardExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Card>
        <p className="text-body">
          Officers in your agency can book a meeting room in one step.
        </p>
      </Card>
      <Card title="Problem statement">
        <p className="text-body">
          Counter staff spend too long checking if a resident is eligible for a
          grant.
        </p>
      </Card>
    </div>
  );
}
