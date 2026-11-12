/** The branch drops from beneath the parent, inside its left edge. */
export const BRANCH_INSET = 16;

const BRANCH_CORNER_RADIUS = 12;

type AnchorNode = { x: number; y: number; height: number };

export function bottomBranchPath(
  source: AnchorNode,
  target: AnchorNode,
): string {
  const branchX = source.x + BRANCH_INSET;
  const sourceY = source.y + source.height;
  const targetY = target.y + target.height / 2;
  const dx = target.x - branchX;
  const dy = targetY - sourceY;
  const radius = Math.min(BRANCH_CORNER_RADIUS, Math.abs(dx), Math.abs(dy));

  // Aligned anchors need only a straight segment; avoid a degenerate curve.
  if (radius === 0) return `M ${branchX},${sourceY} L ${target.x},${targetY}`;

  // The quadratic corner leaves the shared trunk vertically and arrives at
  // the child horizontally. Clamp both legs so short branches cannot overshoot.
  const turnY = targetY - Math.sign(dy) * radius;
  const turnX = branchX + Math.sign(dx) * radius;
  return `M ${branchX},${sourceY} V ${turnY} Q ${branchX},${targetY} ${turnX},${targetY} H ${target.x}`;
}
