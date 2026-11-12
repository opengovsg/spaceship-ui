import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useSystemReducedMotion } from "../../use-reduced-motion";
import { DocumentNode } from "./DocumentNode";
import { FutureStepNode } from "./FutureStepNode";
import { NewItemCTANode } from "./NewItemCTANode";
import { NodeFrame } from "./NodeFrame";
import { ProblemStatementNode } from "./ProblemStatementNode";
import { PrototypeNode } from "./PrototypeNode";
import type {
  DocumentNodeData,
  FutureStepData,
  NewItemCTAData,
  ProblemStatementData,
  PrototypeNodeData,
} from "../types";

// Keys here must match `FlowchartNodeSpec['kind']` values in types.ts. The type
// annotation pins each renderer's `data` prop to its matching shape in types.ts.
export const nodeTypes: {
  content: (props: {
    data: { content: React.ReactNode };
  }) => React.ReactElement;
  problem: (props: { data: ProblemStatementData }) => React.ReactElement;
  futureStep: (props: { data: FutureStepData }) => React.ReactElement;
  document: (props: { data: DocumentNodeData }) => React.ReactElement;
  newItemCta: (props: { data: NewItemCTAData }) => React.ReactElement;
  prototype: (props: { data: PrototypeNodeData }) => React.ReactElement;
} = {
  content: ({ data }) => <>{data.content}</>,
  problem: ProblemStatementNode,
  futureStep: FutureStepNode,
  document: DocumentNode,
  prototype: PrototypeNode,
  // NewItemCTANode takes flat `icon`/`label`/`onClick` props (it's also usable
  // standalone outside the node registry, with no title) — the frame + title
  // are added here, at the flowchart-node adaptation layer.
  newItemCta: NewItemCTAFlowNode,
};

function NewItemCTAFlowNode({
  data,
  disableMotion = false,
}: {
  data: NewItemCTAData;
  disableMotion?: boolean;
}) {
  const controls = useAnimation();
  const reduceMotion = useSystemReducedMotion();
  const previousPulseToken = useRef(data.pulseToken);

  useEffect(() => {
    if (previousPulseToken.current === data.pulseToken) return;
    previousPulseToken.current = data.pulseToken;
    if (disableMotion || reduceMotion || data.pulseToken === undefined) return;
    void controls.start({
      scale: [1, 1.06, 1],
      transition: { duration: 0.5, ease: "easeInOut" },
    });
  }, [data.pulseToken, disableMotion, reduceMotion, controls]);

  return (
    <motion.div
      initial={false}
      animate={controls}
      style={{ willChange: "transform" }}
    >
      <NodeFrame title={data.title}>
        <div className="p-2">
          <NewItemCTANode
            icon={data.icon}
            label={data.label}
            onClick={data.onClick}
            disableMotion={disableMotion}
          />
        </div>
      </NodeFrame>
    </motion.div>
  );
}
