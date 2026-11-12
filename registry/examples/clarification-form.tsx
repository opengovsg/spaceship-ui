"use client";

import { useState } from "react";
import {
  MultiSelect,
  RankPriorities,
  SingleSelect,
} from "#/components/ds/patterns";

export default function ClarificationFormExample() {
  const [user, setUser] = useState<string | undefined>();
  const [pains, setPains] = useState<string[]>([]);
  const [priorities, setPriorities] = useState([
    "Speed",
    "Accuracy",
    "Ease of use",
  ]);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <SingleSelect
        question={{
          type: "single",
          label: "Who is the primary user?",
          options: ["Government officer", "Admin and ops", "Public citizen"],
        }}
        value={user}
        onChange={setUser}
      />
      <MultiSelect
        question={{
          type: "multi",
          label: "What pain points does this solve?",
          options: [
            "Too many manual steps",
            "Hard to find information",
            "Errors from copy-pasting",
          ],
        }}
        value={pains}
        onChange={setPains}
      />
      <RankPriorities
        question={{
          type: "rank",
          label: "Rank what matters most",
          items: priorities,
        }}
        value={priorities}
        onChange={setPriorities}
      />
    </div>
  );
}
