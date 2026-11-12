/* ------------------------------------------------------------------ */
/*  Motion tokens — synced from spaceship-design-system/tokens/motion.ts */
/*                                                                      */
/*  JS-side Framer Motion presets (springs / scales / staggers) plus    */
/*  the duration/easing token metadata. Keep in sync with the design    */
/*  system; the CSS custom properties (--duration-*, --ease-*) live in   */
/*  src/components/ds/tokens/tokens.css.                                                      */
/* ------------------------------------------------------------------ */

export type MotionToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const durationTokens: MotionToken[] = [
  { name: "instant", cssVar: "--duration-instant", value: "50ms" },
  { name: "fast", cssVar: "--duration-fast", value: "100ms" },
  { name: "base", cssVar: "--duration-base", value: "200ms" },
  { name: "slow", cssVar: "--duration-slow", value: "300ms" },
  { name: "slower", cssVar: "--duration-slower", value: "500ms" },
];

export const easingTokens: MotionToken[] = [
  { name: "linear", cssVar: "--ease-linear", value: "linear" },
  { name: "ease-in", cssVar: "--ease-in", value: "cubic-bezier(0.4, 0, 1, 1)" },
  {
    name: "ease-out",
    cssVar: "--ease-out",
    value: "cubic-bezier(0, 0, 0.2, 1)",
  },
  {
    name: "ease-in-out",
    cssVar: "--ease-in-out",
    value: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  {
    name: "spring",
    cssVar: "--ease-spring",
    value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
];

/* ------------------------------------------------------------------ */
/*  Framer Motion presets (JS-only — not CSS custom properties)       */
/* ------------------------------------------------------------------ */

/** Spring transition preset for motion/react components. */
export type SpringPreset =
  | { type: "spring"; stiffness: number; damping: number }
  | { type: "spring"; visualDuration: number; bounce: number };

/** Scale interaction preset (hover + tap) for motion/react components. */
export type ScalePreset = {
  hover: number;
  tap: number;
};

/**
 * Named spring presets — import directly into DS components.
 * Rule: damping ratio ζ = damping / (2 × √stiffness) must be ≥ 0.7.
 */
export const springs = {
  /**
   * Fast, responsive spring for direct user interactions.
   * Feel: snappy with minimal overshoot — the UI reacts immediately to user input.
   * Use for: button taps, toggles, modal enter/exit, radio/checkbox indicators,
   *          tab-bar active indicator, card enter/exit, slide transitions.
   * Components: Button, Modal, RadioGroup, CheckboxGroup, TabBar, ClarificationCard,
   *             TaskList, EditableTitle, ChatPanel dock swap.
   */
  interactive: { type: "spring" as const, stiffness: 400, damping: 30 }, // ζ ≈ 0.75

  /**
   * Slow, critically-damped spring with no overshoot.
   * Feel: smooth and ambient — motion that breathes rather than snaps.
   * Use for: container height morphs, layout-id shared transitions,
   *          background/ambient animations, thinking/loading states.
   * Components: ThinkingDots, ThinkingSaucer, ChatPanel height morph,
   *             Homepage layout-id transition.
   */
  gentle: { type: "spring" as const, stiffness: 160, damping: 24 }, // ζ ≈ 0.95

  /**
   * Medium spring for expand/collapse and layout shifts.
   * Feel: balanced — fast enough to feel responsive, soft enough to not jolt.
   * Use for: tab expand/collapse, folder-tab layout morphs, action reveal animations.
   * Components: FolderTabs.
   */
  layout: { type: "spring" as const, stiffness: 200, damping: 24 }, // ζ ≈ 0.85

  /**
   * Critically-damped spring with zero overshoot.
   * Feel: precise and controlled — settles exactly at target without ringing.
   * Use for: drag-to-resize snap, card height morphs, layoutId shared transitions.
   * Components: ApprovalCard, ClarificationCard (via useDragResize).
   */
  snappy: { type: "spring" as const, visualDuration: 0.2, bounce: 0 }, // ζ = 1.0
} satisfies Record<string, SpringPreset>;

/**
 * Named scale presets — import directly into DS components.
 */
export const scales = {
  prominent: { hover: 1, tap: 0.96 },
  subtle: { hover: 1, tap: 0.96 },
} satisfies Record<string, ScalePreset>;

// ─── Stagger presets ─────────────────────────────────────────────────────────

/** Stagger timing preset for orchestrating child animations. */
export type StaggerPreset = {
  /** Delay between each child's animation start (seconds). */
  staggerChildren: number;
  /** Delay before the first child begins animating (seconds). */
  delayChildren: number;
  /** Delay between each child's exit animation, played in reverse order (seconds). */
  exitStagger: number;
};

export const staggers = {
  /**
   * Quick cascade for small action buttons appearing inside a container.
   * Feel: popcorn — items pop in rapidly one after another.
   * Use for: action icons revealed on tab activation, toolbar items.
   * Components: FolderTabs action buttons.
   */
  actions: { staggerChildren: 0.04, delayChildren: 0.02, exitStagger: 0.03 },
} satisfies Record<string, StaggerPreset>;

/* Viewer display arrays */

export type FramerMotionToken = {
  name: string;
  value: string;
  usedBy: string;
};

export const springPresetTokens: FramerMotionToken[] = [
  {
    name: "interactive",
    value: "stiffness: 400, damping: 30 (ζ ≈ 0.75)",
    usedBy:
      "Button, Modal, RadioGroup, CheckboxGroup, TabBar, ClarificationCard, TaskList",
  },
  {
    name: "gentle",
    value: "stiffness: 160, damping: 24 (ζ ≈ 0.95)",
    usedBy: "ThinkingDots, ThinkingSaucer, ChatPanel height morph",
  },
  {
    name: "layout",
    value: "stiffness: 200, damping: 24 (ζ ≈ 0.85)",
    usedBy: "FolderTabs",
  },
  {
    name: "snappy",
    value: "visualDuration: 0.2, bounce: 0 (ζ = 1.0)",
    usedBy: "ApprovalCard, ClarificationCard (useDragResize)",
  },
];

export const scalePresetTokens: FramerMotionToken[] = [
  {
    name: "prominent",
    value: "hover: 1, tap: 0.96",
    usedBy: "Button (default surface)",
  },
  {
    name: "subtle",
    value: "hover: 1, tap: 0.96",
    usedBy: "Button (shadow surface)",
  },
];

export const staggerPresetTokens: FramerMotionToken[] = [
  {
    name: "actions",
    value: "stagger: 0.04s, delay: 0.02s, exit stagger: 0.03s",
    usedBy: "FolderTabs action buttons",
  },
];
