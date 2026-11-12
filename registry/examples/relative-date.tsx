"use client";

import { useState } from "react";

import { RelativeDate } from "#/components/ds/ui/relative-date";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export default function RelativeDateExample() {
  const [now] = useState(() => Date.now());
  return (
    <ul className="flex flex-col gap-2 text-body">
      <li>
        Edited <RelativeDate date={new Date(now - 5 * MINUTE)} />
      </li>
      <li>
        Shared <RelativeDate date={new Date(now - 3 * HOUR)} />
      </li>
      <li>
        Created{" "}
        <RelativeDate date={new Date(now - 40 * DAY)} format="d MMM yyyy" />
      </li>
    </ul>
  );
}
