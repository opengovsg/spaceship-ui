// ─── Artifact Types ────────────────────────────────────────────────────────
// DS-level types and constants for artifact navigation patterns.
// These live in components/patterns/ so DS components can import them
// without depending on app/ (which is viewer infrastructure).

export type ArtifactType =
  | "prd"
  | "research"
  | "implementation"
  | "code"
  | "preview"
  | "brief"
  | "proposal"
  | "security"
  | "prototype";

export type ArtifactStatus = "draft" | "in-progress" | "complete";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  status: ArtifactStatus;
  content: string;
  updatedAt: string;
}

export interface ArtifactNavigationProps {
  artifacts: Artifact[];
  activeId: string;
  onSelect: (id: string) => void;
  changedIds?: Set<string>;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
}

export const ARTIFACT_TYPE_LABEL: Record<ArtifactType, string> = {
  prd: "PRD",
  research: "User Research",
  implementation: "Impl. Plan",
  code: "Code",
  preview: "Preview",
  brief: "Project Brief",
  proposal: "Proposal",
  security: "Security Review",
  prototype: "Prototype",
};

export const ARTIFACT_STATUS_VARIANT: Record<
  ArtifactStatus,
  "neutral" | "warning" | "success"
> = {
  draft: "neutral",
  "in-progress": "warning",
  complete: "success",
};

export const ARTIFACT_STATUS_LABEL: Record<ArtifactStatus, string> = {
  draft: "Draft",
  "in-progress": "In Progress",
  complete: "Complete",
};
