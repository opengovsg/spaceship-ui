import { type RefObject, useLayoutEffect, useReducer } from "react";

/** Remeasure autosized text when a split pane changes width without a window resize. */
export function useTextareaWidth(
  ref: RefObject<HTMLElement | null>,
  fieldKey?: string | number,
) {
  const [, remeasure] = useReducer((revision: number) => revision + 1, 0);
  useLayoutEffect(() => {
    const field = ref.current;
    if (!field || typeof ResizeObserver === "undefined") return;
    let width = field.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const next = field.getBoundingClientRect().width;
      if (next === width) return;
      width = next;
      remeasure();
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [ref, fieldKey]);
}
