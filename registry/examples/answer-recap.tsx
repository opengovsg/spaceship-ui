"use client";

import { AnswerRecap } from "#/components/ds/patterns";

export default function AnswerRecapExample() {
  return (
    <div className="flex w-full max-w-md flex-col">
      <AnswerRecap
        entries={[
          {
            question: "Who is this for?",
            answer: "Licensing officers at our statutory board.",
          },
          {
            question: "What slows them down today?",
            answer: "They check each application by hand across three systems.",
          },
        ]}
      />
    </div>
  );
}
