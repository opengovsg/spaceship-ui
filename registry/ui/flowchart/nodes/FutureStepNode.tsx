"use client";

import { CardContentSlot } from "./CardContentSlot";
import { NodeFrame } from "./NodeFrame";
import type { FutureStepData } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FutureStepNodeProps {
  data: FutureStepData;
  className?: string;
}

// ─── FutureStepNode ───────────────────────────────────────────────────────────

/** A pipeline stage that isn't available yet — locked until an upstream prerequisite is met. */
export function FutureStepNode({ data, className }: FutureStepNodeProps) {
  return (
    <NodeFrame
      title={data.title}
      className={className}
      titleClassName="w-full text-center"
    >
      <CardContentSlot state="locked" label={data.caption} />
    </NodeFrame>
  );
}
