"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";
import { examples } from "@/examples.generated";
import { FitStage } from "./fit-stage";

/** One broken demo must not take the whole page down with it. */
class DemoBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <p className="text-caption text-content-tertiary">This demo failed to load.</p>;
    return this.props.children;
  }
}

const noop = () => () => {};

/** True only in the browser, after hydration. */
function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/**
 * Live demo of a registry item, sized to fit its box. Demos render in the browser
 * only: some use the clock, random ids or float maths, which never match a
 * server render, and they are live toys anyway.
 */
export function Demo({ name, className, designWidth, minScale }: { name: string; className?: string; designWidth?: number; minScale?: number }) {
  const Example = examples[name];
  const mounted = useMounted();
  if (!mounted) return <div className={className} aria-hidden />;
  return (
    <FitStage className={className} designWidth={designWidth} minScale={minScale}>
      <DemoBoundary>{Example ? <Example /> : <span className="text-caption text-content-tertiary">No example yet.</span>}</DemoBoundary>
    </FitStage>
  );
}
