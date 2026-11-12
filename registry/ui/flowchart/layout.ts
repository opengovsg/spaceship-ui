import type { ColumnConfig, ColumnId, FlowchartNodeSpec } from "./types";

/** Default horizontal gap between the edge of one column and the start of the next. */
export const DEFAULT_COLUMN_GAP_X = 110;

/** Vertical gap between stacked nodes within the same column. */
export const ROW_GAP_Y = 32;

/** Used for a node's height before it's been measured by a ResizeObserver. */
export const ESTIMATED_NODE_HEIGHT = 160;

/**
 * A board's rhythm — gap is a relation between columns, not a property of a
 * single one, so it's threaded through as an option rather than a
 * `ColumnConfig` field.
 */
export interface LayoutOptions {
  /** Defaults to {@link DEFAULT_COLUMN_GAP_X}. */
  columnGap?: number;
  /** Defaults to {@link ROW_GAP_Y}. */
  rowGap?: number;
  /** Global row order for sparse columns; missing cells reserve their row space. */
  rowOrder?: string[];
}

export interface PositionedNode {
  spec: FlowchartNodeSpec;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Computes the fixed x-position (left edge) for each column, left to right,
 * in the order the columns are given.
 */
export function computeColumnX(
  columns: ColumnConfig[],
  options: LayoutOptions = {},
): Record<ColumnId, number> {
  const gap = options.columnGap ?? DEFAULT_COLUMN_GAP_X;
  const xById: Record<ColumnId, number> = {};
  let cursor = 0;
  for (const col of columns) {
    xById[col.id] = cursor;
    cursor += col.width + gap;
  }
  return xById;
}

/**
 * Chunks a column's specs (in their given order) into "cells": consecutive
 * specs sharing the same defined `row` collapse into one cell (stacked
 * together internally); a spec with no `row` always starts its own solo
 * cell, never merging with a neighbour.
 */
function groupIntoCells(specs: FlowchartNodeSpec[]): FlowchartNodeSpec[][] {
  const cells: FlowchartNodeSpec[][] = [];
  for (const spec of specs) {
    const lastCell = cells[cells.length - 1];
    const lastRow = lastCell?.[0]?.row;
    if (lastCell && spec.row !== undefined && spec.row === lastRow) {
      lastCell.push(spec);
    } else {
      cells.push([spec]);
    }
  }
  return cells;
}

/**
 * Lays out every node: fixed x per column (all nodes of a column share the
 * same x), and nodes within a column stacked top-to-bottom without overlap.
 * Columns can be top-aligned or centered relative to the tallest column, so
 * a column with one short card can sit centered next to a taller column.
 *
 * Nodes sharing a `row` value (regardless of column) are padded to a common
 * "slot" height — the tallest column's contribution for that row — and
 * centered within it, so e.g. a Solution node stays vertically aligned with
 * its Report/Approval nodes even when one side has more stacked content.
 */
export function computeLayout(
  nodeSpecs: FlowchartNodeSpec[],
  columns: ColumnConfig[],
  measuredHeights: Record<string, number>,
  options: LayoutOptions = {},
): PositionedNode[] {
  const rowGap = options.rowGap ?? ROW_GAP_Y;
  // An indented child keeps the same width; reserve its indentation before
  // placing the next column so the connector gap cannot collapse.
  const columnX = computeColumnX(
    columns.map((column) => ({
      ...column,
      width:
        column.width +
        Math.max(
          0,
          ...nodeSpecs
            .filter((node) => node.column === column.id)
            .map((node) =>
              Math.min(Math.max(node.inset ?? 0, 0), column.width),
            ),
        ),
    })),
    options,
  );
  const columnById = new Map(columns.map((c) => [c.id, c]));

  const byColumn = new Map<ColumnId, FlowchartNodeSpec[]>();
  for (const col of columns) byColumn.set(col.id, []);
  for (const spec of nodeSpecs) {
    const list = byColumn.get(spec.column);
    if (!list) continue; // node references a column that isn't configured; skip it
    list.push(spec);
  }

  const heightOf = (id: string) => measuredHeights[id] ?? ESTIMATED_NODE_HEIGHT;
  const cellHeight = (cell: FlowchartNodeSpec[]) =>
    cell.reduce((sum, s) => sum + heightOf(s.id), 0) +
    rowGap * Math.max(0, cell.length - 1);

  const cellsByColumn = new Map<ColumnId, FlowchartNodeSpec[][]>();
  for (const [colId, specs] of byColumn) {
    cellsByColumn.set(colId, groupIntoCells(specs));
  }

  const rowSlotHeight = new Map<string, number>();
  for (const cells of cellsByColumn.values()) {
    for (const cell of cells) {
      const row = cell[0]?.row;
      if (row === undefined) continue;
      const height = cellHeight(cell);
      rowSlotHeight.set(row, Math.max(rowSlotHeight.get(row) ?? 0, height));
    }
  }
  const slotHeightOf = (cell: FlowchartNodeSpec[]) => {
    const row = cell[0]?.row;
    return row !== undefined ? (rowSlotHeight.get(row) ?? 0) : cellHeight(cell);
  };

  const columnTotalHeight = new Map<ColumnId, number>();
  for (const [colId, cells] of cellsByColumn) {
    const total =
      cells.reduce((sum, cell) => sum + slotHeightOf(cell), 0) +
      rowGap * Math.max(0, cells.length - 1);
    columnTotalHeight.set(colId, total);
  }
  const maxColumnHeight = Math.max(
    0,
    ...Array.from(columnTotalHeight.values()),
  );

  // Columns linked by at least one shared `row` (e.g. `solution` and
  // `report`) must share a single vertical offset, not each be centered
  // independently against `maxColumnHeight` — otherwise a column with extra
  // unrowed content (e.g. a trailing "create new" CTA) grows taller than its
  // linked sibling, and centering each independently pushes the shorter one
  // down by half the difference, breaking the row alignment from the very
  // first row instead of just at the point the extra content appears.
  const clusterParent = new Map<ColumnId, ColumnId>(
    columns.map((c) => [c.id, c.id]),
  );
  const find = (id: ColumnId): ColumnId => {
    let root = id;
    while (clusterParent.get(root) !== root) root = clusterParent.get(root)!;
    clusterParent.set(id, root);
    return root;
  };
  const union = (a: ColumnId, b: ColumnId) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) clusterParent.set(rootA, rootB);
  };

  const columnsByRow = new Map<string, ColumnId[]>();
  for (const [colId, cells] of cellsByColumn) {
    for (const cell of cells) {
      const row = cell[0]?.row;
      if (row === undefined) continue;
      const list = columnsByRow.get(row) ?? [];
      list.push(colId);
      columnsByRow.set(row, list);
    }
  }
  for (const cols of columnsByRow.values()) {
    for (let i = 1; i < cols.length; i += 1) {
      const first = cols[0];
      const col = cols[i];
      if (first && col) union(first, col);
    }
  }

  const clusterTotalHeight = new Map<ColumnId, number>();
  for (const colId of columnById.keys()) {
    const root = find(colId);
    const total = columnTotalHeight.get(colId) ?? 0;
    clusterTotalHeight.set(
      root,
      Math.max(clusterTotalHeight.get(root) ?? 0, total),
    );
  }

  const result: PositionedNode[] = [];
  for (const [colId, cells] of cellsByColumn) {
    const col = columnById.get(colId);
    if (!col) continue;
    const x = columnX[colId] ?? 0;
    const align = col.align ?? "center";
    const total = clusterTotalHeight.get(find(colId)) ?? 0;
    let y = align === "center" ? (maxColumnHeight - total) / 2 : 0;

    for (const cell of cells) {
      const slotHeight = slotHeightOf(cell);
      let cursor =
        y +
        (col.rowAlign === "start" ? 0 : (slotHeight - cellHeight(cell)) / 2);

      for (const spec of cell) {
        const height = heightOf(spec.id);
        const inset = Math.min(Math.max(spec.inset ?? 0, 0), col.width);
        result.push({
          spec,
          x: x + inset,
          y: cursor,
          width: col.width,
          height,
        });
        cursor += height + rowGap;
      }

      y += slotHeight + rowGap;
    }
  }

  if (options.rowOrder) {
    let top = 0;
    for (const row of options.rowOrder) {
      const slotHeight = rowSlotHeight.get(row) ?? 0;
      for (const col of columns) {
        const members = result.filter(
          (node) => node.spec.row === row && node.spec.column === col.id,
        );
        const total =
          members.reduce((sum, node) => sum + node.height, 0) +
          rowGap * Math.max(0, members.length - 1);
        let cursor =
          top + (col.rowAlign === "start" ? 0 : (slotHeight - total) / 2);
        for (const node of members) {
          node.y = cursor;
          cursor += node.height + rowGap;
        }
      }
      top += slotHeight + rowGap;
    }
  }
  return result;
}
