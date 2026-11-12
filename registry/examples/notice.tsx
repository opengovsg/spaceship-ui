"use client";

import { Notice } from "#/components/ds/ui";

export default function NoticeExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Notice tone="error" description="Check your connection and try again.">
        We could not save your changes
      </Notice>
      <Notice tone="info" description="You can edit it again any time.">
        Your prototype is shared with your team
      </Notice>
      <Notice tone="success">Prototype published</Notice>
    </div>
  );
}
