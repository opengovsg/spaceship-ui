"use client";

import { ScrollFade } from "#/components/ds/ui";

const NOTES = [
  "Caseworkers re-enter the same details in five systems.",
  "Missing documents are only found during assessment.",
  "Officers cannot see which cases are ready to assess.",
  "Approvers wait for a manual status update by email.",
  "Reports are compiled by hand at the end of each month.",
  "New officers take weeks to learn where records live.",
  "Applicants call the agency to ask for case updates.",
];

export default function ScrollFadeExample() {
  return (
    <ScrollFade
      aria-label="Pain points"
      className="h-40 w-full max-w-md rounded-lg bg-(--bg-surface-base)"
      contentClassName="flex flex-col gap-3 p-4"
    >
      {NOTES.map((note) => (
        <p key={note} className="text-body text-(--text-primary)">
          {note}
        </p>
      ))}
    </ScrollFade>
  );
}
