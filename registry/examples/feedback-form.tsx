"use client";

import { FeedbackForm } from "#/components/ds/ui";

export default function FeedbackFormExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <FeedbackForm onSubmit={() => {}} />
      <FeedbackForm
        submitLabel="Send feedback"
        placeholder="Tell us what to change in the prototype..."
        onSubmit={() => {}}
      />
    </div>
  );
}
