"use client";

import type { ReactNode } from "react";
import { FileText, LoaderCircle, Check } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import { CardContentSlot } from "./CardContentSlot";
import { NodeFrame } from "./NodeFrame";
import { StatusBadge, type statusBadgeVariants } from "./StatusBadge";
import type { DocumentNodeData } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadgeProps(status: DocumentNodeData["status"]): {
  tone: NonNullable<VariantProps<typeof statusBadgeVariants>["tone"]>;
  label: string;
  icon?: ReactNode;
} {
  switch (status) {
    case "draft":
    case "scoping":
      return {
        tone: "neutral",
        label: "Draft",
        icon: <FileText />,
      };
    case "building":
      return {
        tone: "info",
        label: "Building…",
        icon: <LoaderCircle className="motion-safe:animate-spin" aria-hidden />,
      };
    case "refining":
      return {
        tone: "success",
        label: "Built",
        icon: <Check />,
      };
    case "validated":
      return {
        tone: "success",
        label: "Validated",
        icon: <Check />,
      };
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DocumentNodeProps {
  data: DocumentNodeData;
  className?: string;
}

// ─── DocumentNode ─────────────────────────────────────────────────────────────

/** Document preview card (e.g. a generated prototype plan) with a validation-status badge. */
export function DocumentNode({ data, className }: DocumentNodeProps) {
  const { tone, label, icon } = getStatusBadgeProps(data.status);

  return (
    <NodeFrame
      title={data.title}
      className={className}
      badge={
        <StatusBadge tone={tone} icon={icon}>
          {label}
        </StatusBadge>
      }
    >
      <CardContentSlot
        state="filled"
        documentTitle={data.documentTitle}
        documentBody={data.documentBody}
        hoverCta={data.hoverCta}
      />
    </NodeFrame>
  );
}
