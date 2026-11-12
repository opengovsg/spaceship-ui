"use client";

import { useState } from "react";
import { SegmentedControl } from "#/components/ds/ui/segmented-control";
import { CopyButton } from "./copy-button";
import { Demo } from "./demo";

/** Fluid-style framed box: the live demo, or the example's code, one tab at a time. */
export function PreviewCode({ name, code, designWidth }: { name: string; code?: string; designWidth: number }) {
  const [tab, setTab] = useState("preview");
  return (
    <div className="overflow-hidden rounded-xl bg-(--bg-surface-primary) shadow-(--shadow-border)">
      <div className="flex items-center gap-2 px-3 pt-3">
        <SegmentedControl
          label="Show"
          value={tab}
          onChange={setTab}
          options={[
            { value: "preview", label: "Preview" },
            { value: "code", label: "Code", disabled: !code, disabledReason: "No example yet" },
          ]}
          className="w-44"
        />
        {tab === "code" && code && (
          <div className="ml-auto">
            <CopyButton text={code} label="Copy code" />
          </div>
        )}
      </div>
      {tab === "preview" ? (
        <Demo name={name} className="min-h-[360px]" designWidth={designWidth} minScale={0.6} />
      ) : (
        <pre className="max-h-[560px] overflow-auto p-5 font-mono text-caption leading-relaxed text-content">{code}</pre>
      )}
    </div>
  );
}
