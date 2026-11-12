"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { PanelResizeHandle, useResizablePanel } from "#/components/ds/ui";

export default function PanelResizeHandleExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { panelRef, size, bindings } = useResizablePanel({
    axis: "width",
    initial: 200,
    min: 120,
    getMax: () => (containerRef.current?.offsetWidth ?? 480) - 120,
    containerRef,
  });

  return (
    <div
      ref={containerRef}
      className="flex h-40 w-full max-w-md items-stretch"
    >
      <motion.div
        ref={panelRef}
        style={{ width: size }}
        className="shrink-0 rounded-lg bg-(--bg-surface-secondary) p-3 text-body text-(--text-secondary)"
      >
        Chat
      </motion.div>
      <PanelResizeHandle label="Resize chat panel" {...bindings} />
      <div className="min-w-0 flex-1 rounded-lg bg-(--bg-surface-secondary) p-3 text-body text-(--text-secondary)">
        Preview
      </div>
    </div>
  );
}
