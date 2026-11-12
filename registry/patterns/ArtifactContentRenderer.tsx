"use client";

import { MarkdownProse } from "#/components/ds/ui";
import { Eye, Smartphone } from "lucide-react";
import { type Artifact } from "./artifact-types";

interface ArtifactContentRendererProps {
  artifact: Artifact;
}

export function ArtifactContentRenderer({
  artifact,
}: ArtifactContentRendererProps) {
  if (artifact.type === "preview") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 bg-(--bg-surface-secondary)">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-(--bg-surface-tertiary) shadow-(--shadow-border)">
          <Eye className="size-8 text-(--text-tertiary)" />
        </div>
        <div className="text-center">
          <p className="font-sans text-body [font-weight:var(--font-weight-bold)] text-(--text-secondary)">
            Live Preview
          </p>
          <p className="font-sans text-body text-(--text-tertiary) mt-1">
            Preview will appear here once code is generated
          </p>
        </div>
      </div>
    );
  }

  if (artifact.type === "prototype") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 bg-(--bg-surface-secondary)">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-(--bg-surface-tertiary) shadow-(--shadow-border)">
          <Smartphone className="size-8 text-(--text-tertiary)" />
        </div>
        <div className="text-center">
          <p className="font-sans text-body [font-weight:var(--font-weight-bold)] text-(--text-secondary)">
            Prototype Ready
          </p>
          <p className="font-sans text-body text-(--text-tertiary) mt-1">
            Share this link with your test participants to begin user testing
          </p>
        </div>
      </div>
    );
  }

  if (artifact.type === "code") {
    return (
      <div className="min-h-full w-full bg-(--bg-surface-secondary) p-4">
        <pre className="font-mono text-caption text-(--text-primary) whitespace-pre overflow-x-auto w-full">
          <code>{artifact.content}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-(--bg-surface-base) p-2">
      <MarkdownProse>{artifact.content}</MarkdownProse>
    </div>
  );
}
