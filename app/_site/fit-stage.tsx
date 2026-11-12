"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "#/components/ds/lib/classnames";

/*
 * Some components focus themselves when they appear (ChatInputBox's autoFocus),
 * which scrolls the page to them. Right in the app, wrong on a showcase. Until
 * the visitor clicks or types, focus calls from inside a demo do nothing.
 * Installed once, before any demo mounts, because a child's effects run before
 * its parent's.
 */
if (typeof window !== "undefined" && !(window as { __demoFocusGuard?: boolean }).__demoFocusGuard) {
  (window as { __demoFocusGuard?: boolean }).__demoFocusGuard = true;
  let touched = false;
  const markTouched = () => {
    touched = true;
  };
  window.addEventListener("pointerdown", markTouched, { capture: true, once: true });
  window.addEventListener("keydown", markTouched, { capture: true, once: true });
  const focus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
    if (!touched && this.closest("[data-demo]")) return;
    return focus.call(this, options);
  };
}

/**
 * Lays a demo out at a real width (the box, or `designWidth` if that is wider),
 * then shrinks it (never below `minScale`) so it fits the box. Big patterns like
 * ChatPanel keep their real layout and still fit a tile.
 */
export function FitStage({
  children,
  className,
  designWidth,
  minScale = 0.45,
  pad = 32,
}: {
  children: ReactNode;
  className?: string;
  designWidth?: number;
  minScale?: number;
  pad?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ width?: number; scale: number }>({ scale: 1 });

  useLayoutEffect(() => {
    const b = box.current;
    const i = inner.current;
    if (!b || !i) return;
    const measure = () => {
      const availW = b.clientWidth - pad;
      const availH = b.clientHeight - pad;
      if (availW <= 0) return;
      const width = Math.max(availW, designWidth ?? 0);
      const h = i.scrollHeight;
      const s = Math.min(1, availW / width, h ? availH / h : 1);
      setLayout((prev) => {
        const next = { width, scale: Math.max(minScale, s) };
        return prev.width === next.width && Math.abs(prev.scale - next.scale) < 0.01 ? prev : next;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(b);
    ro.observe(i);
    return () => ro.disconnect();
  }, [designWidth, minScale, pad]);

  return (
    <div ref={box} data-demo className={cn("relative flex items-center justify-center overflow-hidden", className)}>
      <div
        ref={inner}
        className="flex shrink-0 origin-center items-center justify-center"
        style={{ width: layout.width, transform: layout.scale < 1 ? `scale(${layout.scale})` : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
