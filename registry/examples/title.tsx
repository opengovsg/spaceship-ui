"use client";

import { Title } from "#/components/ds/ui/Title";

export default function TitleExample() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Title>Turn your idea into a prototype</Title>
      <Title family="mono">Validate before you build</Title>
    </div>
  );
}
