import type { ReactNode } from "react";
import type { Viewport } from "./viewport";

/**
 * Generic id for a column. Consumers define their own set of column ids
 * (e.g. 'problem' | 'prototype' | 'approval') and pass a matching `columns`
 * config into <FlowchartCanvas />.
 */
export type ColumnId = string;

export interface ColumnConfig {
  /** Stable identifier, referenced by nodes via `node.column`. */
  id: ColumnId;
  /** Fixed pixel width used for layout and for the node's rendered width. */
  width: number;
  /** Vertical alignment of this column's node stack relative to the tallest column. */
  align?: "start" | "center";
  /** Align cards to the top or center of their shared row slot. */
  rowAlign?: "start" | "center";
}

/** A single "As a / I must / but / This happens / This costs / It happens" line. */
export interface ProblemStatementLine {
  /** Muted lead-in text, e.g. "As a". Omit for lines with no lead-in. */
  lead?: string;
  /** Emphasized (dark) text that follows the lead-in. */
  body: string;
}

/** Frosted-glass CTA shown over a node's content area on hover. */
export interface NodeHoverCta {
  /** Retained for compatibility; cards use the shared Open icon. */
  icon: ReactNode;
  /** Accessible action name; the visible label is always Open. */
  label: string;
  onClick: () => void;
}

export interface ProblemStatementData extends Record<string, unknown> {
  title: string;
  status: "incomplete" | "complete";
  lines: ProblemStatementLine[];
  hoverCta?: NodeHoverCta;
}

/** A pipeline stage that isn't available yet — locked until an upstream prerequisite is met. */
export interface FutureStepData extends Record<string, unknown> {
  title: string;
  locked: boolean;
  /** Text shown under the lock icon, or as the unlocked body if `locked` is false. */
  caption: string;
}

/** A document preview card (e.g. a generated prototype plan) with a validation-status badge. */
export interface DocumentNodeData extends Record<string, unknown> {
  title: string;
  status: "draft" | "scoping" | "building" | "refining" | "validated";
  documentTitle: string;
  /** Full body text; clipped to a fixed preview height with a linear fade. */
  documentBody: string;
  hoverCta?: NodeHoverCta;
}

/** The three states a canvas card's body can be in. */
export type CardContentState = "locked" | "cta" | "filled";

/** Status pills a prototype card can carry. Rendered in the order given, max two. */
export type PrototypeBadgeKind =
  | "AWAITING APPROVAL"
  | "BUILDING"
  | "BUILT"
  | "UNTESTED"
  | "TESTED"
  | "INCOMPLETE"
  | "COMPLETE";

/**
 * A prototype card. Unlike {@link DocumentNodeData} it carries a pair of
 * independent status pills (build state and test state) and its body can be
 * locked or a call to action, not only a document preview.
 */
export interface PrototypeNodeData extends Record<string, unknown> {
  /** Frame title, e.g. "Prototype A". */
  title: string;
  badges: PrototypeBadgeKind[];
  contentState: CardContentState;
  /** `filled` — document preview. */
  documentTitle?: string;
  documentBody?: string;
  /** `locked` and `cta` — the single line of copy. */
  label?: string;
  /** `cta` — invoked when the card is clicked. */
  onClick?: () => void;
  /** `filled` — enables the shared Open affordance. */
  onEdit?: () => void;
}

/** A clickable card that prompts creating a new item (e.g. "Create a new prototype"). */
export interface NewItemCTAData extends Record<string, unknown> {
  /** Frame title shown above the CTA, e.g. "Prototype C". */
  title: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  /** Change this token to pulse the node. Its initial value never animates. */
  pulseToken?: number;
}

interface FlowNodeBase {
  /** Indent the card without shrinking it; layout reserves the extra column space. */
  inset?: number;
  id: string;
  column: ColumnId;
  /**
   * Nodes across different columns that share a `row` value are vertically
   * centered as one unit — e.g. a Solution node and its Report/Approval
   * nodes, so the shorter side pads to match the taller one instead of the
   * two columns drifting apart. Omit for independent stacking (the default).
   */
  row?: string;
}

export type ProblemStatementNodeSpec = FlowNodeBase & {
  kind: "problem";
  data: ProblemStatementData;
};

export type FutureStepNodeSpec = FlowNodeBase & {
  kind: "futureStep";
  data: FutureStepData;
};

export type DocumentNodeSpec = FlowNodeBase & {
  kind: "document";
  data: DocumentNodeData;
};

export type NewItemCTANodeSpec = FlowNodeBase & {
  kind: "newItemCta";
  data: NewItemCTAData;
};

export type PrototypeNodeSpec = FlowNodeBase & {
  kind: "prototype";
  data: PrototypeNodeData;
};

/** Host-supplied content participates in canvas sizing, panning and connectors. */
export type ContentNodeSpec = FlowNodeBase & {
  kind: "content";
  data: { content: ReactNode };
};

/** Union of every node spec the canvas knows how to render. Extend this when adding node kinds. */
export type FlowchartNodeSpec =
  | ProblemStatementNodeSpec
  | FutureStepNodeSpec
  | DocumentNodeSpec
  | NewItemCTANodeSpec
  | PrototypeNodeSpec
  | ContentNodeSpec;

export interface FlowchartEdgeSpec {
  /** Connect the parent bottom to indented children with a rounded branch. */
  routing?: "bottom-left";
  id: string;
  source: string;
  target: string;
  /**
   * `"dotted"` marks a connection to something not yet reachable — the board
   * uses it for the edge into a locked report. Defaults to `"solid"`.
   */
  variant?: "solid" | "dotted";
}

export interface FlowchartCanvasHandle {
  /**
   * Pans — and, if `scale` is given, also zooms — so the column is centered
   * in the viewport. `scale` defaults to the current scale (a pure pan) and
   * is clamped to `[fitScale, maxScale]`.
   */
  focusColumn: (
    columnId: ColumnId,
    options?: { duration?: number; scale?: number },
  ) => void;
  /** Re-fits the whole board and re-arms automatic re-fit on resize. */
  fitToContent: (options?: { duration?: number }) => void;
  /** Zooms about the viewport center. Clamped to `[fitScale, maxScale]`. */
  zoomTo: (scale: number, options?: { duration?: number }) => void;
  /** The current pan/zoom camera. */
  getViewport: () => Viewport;
}
