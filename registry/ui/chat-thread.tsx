"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  Children,
} from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ArrowDown } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";

export interface ChatThreadOverlayState {
  nearBottom: boolean;
  scrollToBottom: () => void;
  focusLatest: () => void;
  actions?: ReactNode;
  availableHeight: number;
  reserveHeight: (height: number) => void;
}

/** Opt-in conversation overlay; other threads retain their new-message pill. */
const ChatThreadOverlayContext = createContext<
  ((state: ChatThreadOverlayState) => ReactNode) | null
>(null);
export const ChatThreadOverlayProvider = ChatThreadOverlayContext.Provider;

export interface ChatThreadProps {
  children: ReactNode;
  className?: string;
  autoScroll?: boolean;
  /** Opt in to a keyboard-scrollable, named history region. */
  viewportTabIndex?: -1 | 0;
  viewportAriaLabel?: string;
  /** Actions shown by the enclosing opt-in conversation overlay. */
  overlayActions?: ReactNode;
  /** Priority notice replacing all floating thread controls while present. */
  overlayNotice?: ReactNode;
  /** Tracks appended messages when direct children group multiple messages. */
  lastMessageKey?: string | number;
  /**
   * Fires when the viewport crosses the near-bottom threshold in either
   * direction. Callers use this to auto-collapse a docked element (e.g. the
   * in-progress `TaskList`) while the user reads back through the thread,
   * and auto-expand it once they return to the bottom.
   */
  onNearBottomChange?: (nearBottom: boolean) => void;
}

export interface ChatThreadHandle {
  /**
   * Jumps to the bottom immediately and treats the view as pinned there for
   * future auto-scroll. Call this the moment the user sends a message, so
   * sending always shows the bottom regardless of prior scroll position.
   */
  scrollToBottom: () => void;
}

// Mirrors v1's `ConversationCard.tsx` near-bottom slack (expressed here in
// normal, not reversed, scroll-math terms).
const NEAR_BOTTOM_THRESHOLD_PX = 120;

export const ChatThread = forwardRef<ChatThreadHandle, ChatThreadProps>(
  function ChatThread(
    {
      children,
      className,
      onNearBottomChange,
      autoScroll = true,
      viewportTabIndex = -1,
      viewportAriaLabel,
      lastMessageKey,
      overlayActions,
      overlayNotice,
    },
    ref,
  ) {
    const renderOverlay = useContext(ChatThreadOverlayContext);
    const [nearBottom, setNearBottom] = useState(true);
    const [overlayHeight, setOverlayHeight] = useState(60);
    const [availableHeight, setAvailableHeight] = useState(0);
    const viewportRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const overlayHadFocus = useRef(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const hasMountedRef = useRef(false);
    const isNearBottomRef = useRef(true);
    const rafIdRef = useRef<number | undefined>(undefined);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [edges, setEdges] = useState({ top: false, bottom: false });
    const updateEdges = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      setAvailableHeight(viewport.clientHeight);
      const overflow = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight,
      );
      const position = Math.min(overflow, Math.max(0, viewport.scrollTop));
      const top = position > 1;
      const bottom = overflow - position > 1;
      setEdges((previous) =>
        previous.top === top && previous.bottom === bottom
          ? previous
          : { top, bottom },
      );
    }, []);
    useLayoutEffect(() => {
      updateEdges();
      const viewport = viewportRef.current;
      const content = contentRef.current;
      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(updateEdges);
      if (viewport) observer?.observe(viewport);
      if (content) observer?.observe(content);
      window.addEventListener("resize", updateEdges);
      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", updateEdges);
      };
    }, [children, updateEdges]);

    const hasNotice = Boolean(overlayNotice);
    useLayoutEffect(() => {
      const overlay = overlayRef.current;
      if (
        overlayHadFocus.current &&
        !overlay?.contains(document.activeElement)
      ) {
        viewportRef.current?.focus({ preventScroll: true });
        overlayHadFocus.current = false;
      }
      if (!hasNotice || !overlay) return;
      const measure = () =>
        setOverlayHeight(overlay.getBoundingClientRect().height + 12);
      measure();
      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(measure);
      observer?.observe(overlay);
      return () => observer?.disconnect();
    }, [hasNotice, overlayNotice]);

    const childArray = Children.toArray(children);
    const lastChild = childArray.at(-1);
    const lastChildKey =
      lastMessageKey ??
      (lastChild && typeof lastChild === "object" && "key" in lastChild
        ? lastChild.key
        : null) ??
      childArray.length;

    // Only ever an instant, idempotent write — never a `smooth`/animated
    // scroll. Mixing an animated scroll with instant per-tick writes on the
    // same container (needed below for the typing-animation's growing
    // height) is what caused the previous jump/flash bugs: the browser's
    // smooth scroll keeps getting retargeted/cancelled by each instant call.
    // Using one mechanism everywhere means there's nothing to fight.
    const scrollInstantly = useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollTop = viewport.scrollHeight;
      updateEdges();
    }, [updateEdges]);

    const scrollToBottom = useCallback(() => {
      if (!isNearBottomRef.current) onNearBottomChange?.(true);
      isNearBottomRef.current = true;
      setNearBottom(true);
      setNewMessageCount(0);
      scrollInstantly();
    }, [scrollInstantly, onNearBottomChange]);

    const focusLatest = useCallback(() => {
      viewportRef.current?.focus({ preventScroll: true });
    }, []);

    useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);

    // rAF-throttled, same shape as `ConversationCard.tsx`'s scroll handler.
    const handleScroll = useCallback(() => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        updateEdges();
        const distanceFromBottom =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
        const nearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
        if (nearBottom !== isNearBottomRef.current) {
          if (
            !nearBottom &&
            overlayRef.current?.contains(document.activeElement) &&
            document.activeElement?.closest("[data-chat-thread-hide-away]")
          ) {
            // Only departing actions lose focus; persistent overlay controls
            // remain operable while the user reads earlier messages.
            viewport.focus({ preventScroll: true });
          }
          isNearBottomRef.current = nearBottom;
          setNearBottom(nearBottom);
          onNearBottomChange?.(nearBottom);
        }
        if (nearBottom) setNewMessageCount(0);
      });
    }, [onNearBottomChange, updateEdges]);

    useEffect(() => {
      return () => {
        if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      };
    }, []);

    // A new message arrived: follow it if the user hasn't scrolled away from
    // the bottom, otherwise surface the "N new messages" pill instead of
    // yanking their view down.
    useEffect(() => {
      if (!autoScroll) return;
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }
      if (isNearBottomRef.current) {
        scrollInstantly();
      } else {
        setNewMessageCount((count) => count + 1);
      }
    }, [lastChildKey, scrollInstantly, autoScroll]);

    // A message can keep growing after it's appended — e.g. ChatMessage's
    // word-by-word typing animation, then the streaming caret disappearing
    // once it completes. The effect above only fires when a message is
    // *added*, so without this, the view would stay at the scroll position
    // captured when the latest message was still mostly empty. Re-anchoring
    // on every resize (skipping the initial observation, which fires
    // immediately on `observe()` for the current size) uses the exact same
    // instant `scrollInstantly` as above, gated by the same near-bottom
    // check, so it never conflicts with it.
    useEffect(() => {
      const content = contentRef.current;
      if (!content || typeof ResizeObserver === "undefined") return;
      let hasObservedOnce = false;
      const observer = new ResizeObserver(() => {
        if (!hasObservedOnce) {
          hasObservedOnce = true;
          return;
        }
        if (autoScroll && isNearBottomRef.current) scrollInstantly();
      });
      observer.observe(content);
      return () => observer.disconnect();
    }, [scrollInstantly, autoScroll]);

    return (
      <ScrollAreaPrimitive.Root
        className={cn("relative min-h-0 min-w-0 overflow-hidden", className)}
      >
        {/*
          Layout/padding go on this inner div, not on Viewport: Radix wraps
          Viewport's children in its own `display: table` div, so padding
          placed on Viewport itself doesn't reliably count toward
          scrollHeight — that clipped the last message's final line ~10px
          above the bottom. Short conversations start at the top. Radix's
          `display: table` wrapper computes its own width
          using table auto-layout — shrink-to-fit its content's
          preferred size, uncapped by the viewport — which is exactly what
          Radix wants for content that's meant to scroll horizontally, but
          it lets unbreakable content (a long code line, a bare URL) blow
          the thread out sideways instead of wrapping. `[&>div]:!block`
          overrides the wrapper back to normal block layout — still a flex
          item of Viewport, but now width-
          constrained by its container, so children wrap instead of forcing
          horizontal scroll.
        */}
        <ScrollAreaPrimitive.Viewport
          ref={viewportRef}
          tabIndex={viewportTabIndex}
          role={viewportAriaLabel ? "region" : undefined}
          aria-label={viewportAriaLabel}
          onScroll={handleScroll}
          style={{
            maskImage:
              edges.top || edges.bottom
                ? `linear-gradient(to bottom, ${edges.top ? "transparent, black 16px" : "black 0"}, ${edges.bottom ? "black calc(100% - 16px), transparent" : "black 100%"})`
                : undefined,
          }}
          className="flex h-full w-full flex-col scroll-py-4 [&>div]:!block [&>div]:!min-w-0"
        >
          <div
            ref={contentRef}
            className="mx-auto flex w-[calc(100%_-_2rem)] min-w-0 max-w-2xl flex-col gap-6 px-2 py-4"
          >
            {children}
            {(hasNotice || renderOverlay) && (
              <div
                aria-hidden
                style={{ height: overlayHeight }}
                className="shrink-0"
              />
            )}
          </div>
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar
          orientation="vertical"
          className="flex w-2 touch-none select-none transition-colors px-0.5 py-2"
        >
          <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-(--text-tertiary)" />
        </ScrollAreaPrimitive.Scrollbar>
        {(hasNotice || renderOverlay) && (
          <div
            ref={overlayRef}
            onFocusCapture={() => {
              overlayHadFocus.current = true;
            }}
            onBlurCapture={(event) => {
              if (event.relatedTarget) {
                overlayHadFocus.current = event.currentTarget.contains(
                  event.relatedTarget,
                );
              }
            }}
            className="pointer-events-none absolute inset-x-4 bottom-3 z-30 flex justify-center"
          >
            {hasNotice ? (
              <div
                className="pointer-events-auto -m-1 w-[calc(100%_+_0.5rem)] max-w-[calc(42rem_+_0.5rem)] overflow-y-auto overscroll-contain p-1"
                style={{
                  maxHeight: availableHeight
                    ? Math.max(0, availableHeight - 24)
                    : "100%",
                }}
              >
                {overlayNotice}
              </div>
            ) : (
              renderOverlay?.({
                nearBottom,
                scrollToBottom,
                focusLatest,
                actions: overlayActions,
                availableHeight,
                reserveHeight: setOverlayHeight,
              })
            )}
          </div>
        )}
        {!hasNotice && !renderOverlay && autoScroll && newMessageCount > 0 && (
          <button
            type="button"
            onClick={scrollToBottom}
            className={cn(
              "absolute bottom-3 left-1/2 z-10 -translate-x-1/2",
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 shadow-md",
              "bg-(--bg-status-info) text-(--text-primary)",
              "text-body [font-weight:var(--font-weight-semibold)] font-(family-name:--font-family-secondary)",
              "hover:brightness-95 transition-[filter]",
            )}
          >
            <ArrowDown className="size-3.5" />
            {newMessageCount} new message{newMessageCount === 1 ? "" : "s"}
          </button>
        )}
      </ScrollAreaPrimitive.Root>
    );
  },
);

ChatThread.displayName = "ChatThread";
