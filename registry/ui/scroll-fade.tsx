"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";

export const scrollFadeVariants = cva(
  [
    "relative flex min-h-0 flex-col overflow-hidden",
    "[--scroll-fade-surface:var(--bg-surface-base)]",
  ],
  {
    variants: {
      surface: { default: "", "shadow-border": "shadow-(--shadow-border)" },
    },
    defaultVariants: { surface: "default" },
  },
);

export interface ScrollFadeProps extends VariantProps<
  typeof scrollFadeVariants
> {
  children?: ReactNode;
  className?: string;
  viewportClassName?: string;
  contentClassName?: string;
  "aria-label"?: string;
}

/** Fade only an edge that has more content to scroll, on any background. */
export function ScrollFade({
  children,
  surface,
  className,
  viewportClassName,
  contentClassName,
  "aria-label": label,
}: ScrollFadeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return undefined;
    const update = () => {
      const overflow = viewport.scrollHeight - viewport.clientHeight;
      const top = overflow > 1 && viewport.scrollTop > 1;
      const bottom = overflow > 1 && overflow - viewport.scrollTop > 1;
      setEdges((previous) =>
        previous.top === top && previous.bottom === bottom
          ? previous
          : { top, bottom },
      );
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(update);
    observer?.observe(viewport);
    observer?.observe(content);
    return () => {
      observer?.disconnect();
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [children]);

  return (
    <div className={cn(scrollFadeVariants({ surface }), className)}>
      <div
        ref={viewportRef}
        aria-label={label}
        style={{
          maskImage:
            edges.top || edges.bottom
              ? `linear-gradient(to bottom, ${edges.top ? "transparent, black 16px" : "black 0"}, ${edges.bottom ? "black calc(100% - 16px), transparent" : "black 100%"})`
              : undefined,
        }}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto scroll-py-4 [scrollbar-color:var(--text-tertiary)_transparent]",
          viewportClassName,
        )}
      >
        <div ref={contentRef} className={cn(contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
