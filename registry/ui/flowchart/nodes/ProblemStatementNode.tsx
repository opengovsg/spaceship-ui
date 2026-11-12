"use client";

import { useMemo } from "react";
import { ProblemStatementLines } from "../../ProblemStatementLines";
import { CardContentSlot } from "./CardContentSlot";
import { NodeFrame } from "./NodeFrame";
import { StatusBadge } from "./StatusBadge";
import type { ProblemStatementData, ProblemStatementLine } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProblemStatementNodeProps {
  data: ProblemStatementData;
  className?: string;
}

// ─── ProblemStatementNode ────────────────────────────────────────────────────

export function ProblemStatementNode({
  data,
  className,
}: ProblemStatementNodeProps) {
  const displayedLines = useMemo(() => {
    const isProblemStatementEmpty =
      data.lines.length === 0 ||
      (data.lines.length === 1 && !data.lines[0]?.body);
    return isProblemStatementEmpty
      ? ([
          { body: "Problem statement not completed" },
        ] as ProblemStatementLine[])
      : data.lines;
  }, [data.lines]);

  return (
    <NodeFrame
      title={data.title}
      className={className}
      badge={
        data.status === "incomplete" ? (
          <StatusBadge tone="warning">Incomplete</StatusBadge>
        ) : undefined
      }
    >
      <CardContentSlot state="filled" hoverCta={data.hoverCta}>
        <div className="min-h-[72px]">
          <ProblemStatementLines lines={displayedLines} size="xs" />
        </div>
      </CardContentSlot>
    </NodeFrame>
  );
}
