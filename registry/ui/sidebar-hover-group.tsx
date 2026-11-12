"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "#/components/ds/lib/classnames";
import { springs } from "#/components/ds/lib/motion";

/** One highlight follows the pointer or keyboard focus between sidebar rows. */
export function SidebarHoverGroup({
  children,
  className,
  highlightClassName,
  disableMotion = false,
  axis = "vertical",
}: {
  children: ReactNode;
  className?: string;
  highlightClassName?: string;
  disableMotion?: boolean;
  axis?: "vertical" | "horizontal";
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLElement | null>(null);
  const [highlight, setHighlight] = useState<{
    x: number;
    width: number;
    y: number;
    height: number;
    error: boolean;
  } | null>(null);
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  const followRow = (target: EventTarget | null) => {
    if (
      target instanceof Element &&
      target.closest("[data-sidebar-hover-disabled]")
    ) {
      activeRowRef.current = null;
      setVisible(false);
      return;
    }
    const row =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-sidebar-row]")
        : null;
    const content = contentRef.current;
    if (!row || !content) return;
    if (!content.contains(row)) {
      activeRowRef.current = null;
      setVisible(false);
      return;
    }
    activeRowRef.current = row;
    setVisible(true);
    const next = {
      x:
        row.getBoundingClientRect().left - content.getBoundingClientRect().left,
      width: row.offsetWidth,
      y: row.getBoundingClientRect().top - content.getBoundingClientRect().top,
      height: row.offsetHeight,
      error: row.dataset.sidebarHoverTone === "error",
    };
    setHighlight((previous) =>
      previous?.x === next.x &&
      previous.width === next.width &&
      previous.y === next.y &&
      previous.height === next.height &&
      previous.error === next.error
        ? previous
        : next,
    );
  };

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(() => followRow(activeRowRef.current));
    observer.observe(content);
    return () => observer.disconnect();
  }, [axis]);

  return (
    <div
      ref={contentRef}
      className={cn(
        "relative flex gap-1",
        axis === "vertical" ? "flex-col" : "flex-row",
        className,
      )}
      onPointerMove={(event) => followRow(event.target)}
      onPointerLeave={(event) => {
        if (event.currentTarget.contains(document.activeElement))
          followRow(document.activeElement);
        else {
          activeRowRef.current = null;
          setVisible(false);
        }
      }}
      onFocusCapture={(event) => followRow(event.target)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          activeRowRef.current = null;
          setVisible(false);
        }
      }}
    >
      {highlight && (
        <motion.span
          aria-hidden="true"
          data-sidebar-hover-highlight=""
          data-sidebar-hover-tone={highlight.error ? "error" : undefined}
          className={cn(
            "pointer-events-none absolute left-0 top-0 rounded-lg",
            axis === "vertical" && "right-0",
            highlight.error
              ? "bg-(--bg-ghost-error-hover)"
              : "bg-(--bg-ghost-neutral-hover)",
            highlightClassName,
          )}
          initial={false}
          animate={{
            opacity: visible ? 1 : 0,
            x: axis === "horizontal" ? highlight.x : 0,
            y: highlight.y,
            width: axis === "horizontal" ? highlight.width : undefined,
            height: highlight.height,
          }}
          transition={
            disableMotion || reduceMotion
              ? { duration: 0 }
              : axis === "horizontal"
                ? springs.snappy
                : springs.interactive
          }
        />
      )}
      {children}
    </div>
  );
}
