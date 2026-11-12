"use client";

import {
  ProgressBar,
  SummaryView,
  type ClarificationAnswer,
  type ClarificationQuestion,
} from "#/components/ds/ui/clarification-card-shared";

const QUESTIONS: ClarificationQuestion[] = [
  {
    label: "Who will use this service?",
    options: ["Residents", "Public officers", "Businesses"],
  },
  {
    type: "multi",
    label: "Which channels do they use today?",
    options: ["Phone", "Email", "Counter"],
  },
  {
    type: "rank",
    label: "Rank what matters most",
    items: ["Speed", "Accuracy", "Ease of use"],
  },
];

const ANSWERS: ClarificationAnswer[] = [
  { type: "single", index: 1 },
  { type: "multi", indices: [0, 2] },
  { type: "rank", order: ["Accuracy", "Speed", "Ease of use"] },
];

export default function ClarificationCardSharedExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ProgressBar total={3} current={1} onJumpTo={() => {}} />
      <SummaryView questions={QUESTIONS} answers={ANSWERS} />
    </div>
  );
}
