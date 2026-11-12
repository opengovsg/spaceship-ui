"use client";

import {
  FlowchartCanvas,
  type ColumnConfig,
  type FlowchartEdgeSpec,
  type FlowchartNodeSpec,
} from "#/components/ds/ui";

const COLUMNS: ColumnConfig[] = [
  { id: "problem", width: 320, align: "start", rowAlign: "start" },
  { id: "prototype", width: 320, align: "start", rowAlign: "start" },
  { id: "approval", width: 320, align: "start", rowAlign: "start" },
];

const NODES: FlowchartNodeSpec[] = [
  {
    id: "problem-1",
    row: "problem-1",
    column: "problem",
    kind: "problem",
    data: {
      title: "Problem Statement",
      status: "complete",
      lines: [
        {
          lead: "As a",
          body: "caseworker, I must assess eligibility for support.",
        },
        {
          lead: "But",
          body: "fragmented records and missing documents delay each assessment.",
        },
      ],
    },
  },
  {
    id: "prototype-a",
    row: "problem-1",
    column: "prototype",
    kind: "document",
    data: {
      title: "Prototype A",
      status: "draft",
      documentTitle: "Case assessment workspace",
      documentBody:
        "Give caseworkers one view of the client, their records and outstanding documents.",
    },
  },
  {
    id: "approval",
    row: "problem-1",
    column: "approval",
    kind: "futureStep",
    data: {
      title: "Approval / Funding Report",
      locked: true,
      caption: "Solution needs to be validated first",
    },
  },
];

const EDGES: FlowchartEdgeSpec[] = [
  { id: "e1", source: "problem-1", target: "prototype-a" },
  { id: "e2", source: "prototype-a", target: "approval", variant: "dotted" },
];

export default function FlowchartExample() {
  return (
    <div className="h-[420px] w-full">
      <FlowchartCanvas columns={COLUMNS} nodes={NODES} edges={EDGES} />
    </div>
  );
}
