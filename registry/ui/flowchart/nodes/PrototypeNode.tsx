"use client";

import {
  Check,
  Clock,
  FlaskConical,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import { CardContentSlot } from "./CardContentSlot";
import { NodeFrame } from "./NodeFrame";
import { StatusBadge, type StatusBadgeProps } from "./StatusBadge";
import type { PrototypeBadgeKind, PrototypeNodeData } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

type BadgeTone = NonNullable<StatusBadgeProps["tone"]>;

const BADGE_LABEL: Record<PrototypeBadgeKind, string> = {
  "AWAITING APPROVAL": "Awaiting approval",
  BUILDING: "Building…",
  BUILT: "Built",
  UNTESTED: "Untested",
  TESTED: "Tested",
  INCOMPLETE: "Incomplete",
  COMPLETE: "Complete",
};

const BADGE_TONE: Record<PrototypeBadgeKind, BadgeTone> = {
  // Amber rather than neutral: the build is blocked on the user approving the
  // plan, so this is a call to act, not a passive pipeline state.
  "AWAITING APPROVAL": "warning",
  BUILDING: "neutral",
  BUILT: "success",
  UNTESTED: "error",
  TESTED: "success",
  INCOMPLETE: "warning",
  COMPLETE: "success",
};

const BADGE_ICON: Partial<Record<PrototypeBadgeKind, LucideIcon>> = {
  "AWAITING APPROVAL": Clock,
  BUILDING: LoaderCircle,
  BUILT: Check,
  UNTESTED: FlaskConical,
  TESTED: Check,
  COMPLETE: Check,
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PrototypeNodeProps {
  data: PrototypeNodeData;
  className?: string;
}

// ─── PrototypeNode ────────────────────────────────────────────────────────────

/**
 * A prototype card on the canvas. It carries a pair of independent status pills
 * — build state and test state — because a prototype can be built without being
 * tested, and that gap is precisely what gates the report.
 */
export function PrototypeNode({ data, className }: PrototypeNodeProps) {
  const badges = data.badges.map((kind) => {
    const Icon = BADGE_ICON[kind];
    return (
      <StatusBadge
        key={kind}
        tone={BADGE_TONE[kind]}
        icon={
          Icon ? (
            <Icon
              aria-hidden
              className={
                kind === "BUILDING" ? "motion-safe:animate-spin" : undefined
              }
            />
          ) : undefined
        }
      >
        {BADGE_LABEL[kind]}
      </StatusBadge>
    );
  });

  return (
    <NodeFrame title={data.title} className={className} badges={badges}>
      <CardContentSlot
        state={data.contentState}
        documentTitle={data.documentTitle}
        documentBody={data.documentBody}
        label={data.label}
        onClick={data.onClick}
        onEdit={data.onEdit}
      />
    </NodeFrame>
  );
}
