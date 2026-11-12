"use client";

import { GripVertical } from "lucide-react";
import { RadioGroup, RadioItem, CheckboxGroup, CheckboxItem } from "../ui";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "#/components/ds/lib/classnames";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SingleSelectQuestion = {
  type: "single";
  label: string;
  options: string[];
  required?: boolean;
};
export type MultiSelectQuestion = {
  type: "multi";
  label: string;
  options: string[];
  required?: boolean;
};
export type RankPrioritiesQuestion = {
  type: "rank";
  label: string;
  items: string[];
};
export type Question =
  | SingleSelectQuestion
  | MultiSelectQuestion
  | RankPrioritiesQuestion;

export type Stage = {
  title: string;
  questions: Question[];
};

// question index → selected value(s)
export type StageAnswers = Record<number, string | string[]>;

// ─── Stage Data ───────────────────────────────────────────────────────────────

export const STAGES: Stage[] = [
  {
    title: "Stage 1 — Problem Clarification",
    questions: [
      {
        type: "single",
        label: "Who is the primary user?",
        options: [
          "Government officer",
          "Admin & ops",
          "Public citizen",
          "Internal developer",
        ],
        required: true,
      },
      {
        type: "multi",
        label: "What pain points does this solve?",
        options: [
          "Too many manual steps",
          "Hard to find information",
          "Process takes too long",
          "Errors from copy-pasting",
          "No visibility into status",
        ],
        required: true,
      },
    ],
  },
  {
    title: "Stage 2 — Solution Clarification",
    questions: [
      {
        type: "single",
        label: "What will this feature produce?",
        options: [
          "A form",
          "A dashboard",
          "An automated action",
          "A report or export",
        ],
        required: true,
      },
      {
        type: "multi",
        label: "Which constraints apply?",
        options: [
          "Must work on mobile",
          "WCAG AA accessible",
          "No new backend",
          "Fits existing design system",
        ],
        required: true,
      },
    ],
  },
  {
    title: "Stage 3 — Implementation Confirmation",
    questions: [
      {
        type: "rank",
        label: "Rank what matters most",
        items: [
          "Correctness",
          "Speed of delivery",
          "Visual polish",
          "Edge case handling",
          "Test coverage",
        ],
      },
      {
        type: "single",
        label: "Ready to proceed?",
        options: [
          "Yes, build it",
          "Let me adjust the plan",
          "Start with a skeleton only",
        ],
        required: true,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isStageComplete(stage: Stage, answers: StageAnswers): boolean {
  return stage.questions.every((q, i) => {
    if (!("required" in q) || !q.required) return true;
    const answer = answers[i];
    if (q.type === "single")
      return typeof answer === "string" && answer.length > 0;
    if (q.type === "multi") return Array.isArray(answer) && answer.length > 0;
    return true;
  });
}

export function buildAnswerSummary(
  stage: Stage,
  answers: StageAnswers,
): string {
  const lines: string[] = [];
  stage.questions.forEach((q, i) => {
    const answer = answers[i];
    if (!answer || (Array.isArray(answer) && answer.length === 0)) return;
    const label = q.label.replace("?", "").trim();
    if (Array.isArray(answer)) {
      lines.push(
        q.type === "rank"
          ? `${label}: ${answer.join(" › ")}`
          : `${label}: ${answer.join(" · ")}`,
      );
    } else {
      lines.push(`${label}: ${answer}`);
    }
  });
  return lines.join("\n");
}

export function buildClosingMessage(allAnswers: StageAnswers[]): string {
  const s0 = allAnswers[0] ?? {};
  const s1 = allAnswers[1] ?? {};
  const s2 = allAnswers[2] ?? {};

  const primaryUser = s0[0] as string | undefined;
  const painPoints = s0[1] as string[] | undefined;
  const featureOutput = s1[0] as string | undefined;
  const constraints = s1[1] as string[] | undefined;
  const priorities = s2[0] as string[] | undefined;
  const readyToProceed = s2[1] as string | undefined;

  return `Thanks — I have everything I need. Here's what I'll build:

**Primary user:** ${primaryUser ?? "—"}
**Pain points:** ${painPoints?.join(", ") ?? "—"}
**Output:** ${featureOutput ?? "—"}
**Constraints:** ${constraints?.join(", ") ?? "—"}
**Priorities:** ${priorities?.join(" › ") ?? "—"}
**Approach:** ${readyToProceed ?? "—"}`;
}

// ─── Pill button shared classes ───────────────────────────────────────────────

export const PILL_BASE = [
  "rounded-full px-3 py-1.5",
  "text-body",
  "transition-colors duration-(--duration-base) ease-(--ease-in-out)",
  "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)",
].join(" ");

export const PILL_SELECTED =
  "bg-(--bg-interactive-primary-default) text-(--text-inverse)";
export const PILL_UNSELECTED =
  "bg-(--bg-interactive-secondary-default) text-(--text-primary) hover:bg-(--bg-interactive-secondary-hover)";

// ─── SingleSelect ─────────────────────────────────────────────────────────────

export function SingleSelect({
  question,
  value,
  onChange,
}: {
  question: SingleSelectQuestion;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
        {question.label}
      </p>
      <RadioGroup
        value={value ?? ""}
        onChange={onChange}
        indicator="none"
        dividers={false}
        surface="default"
        className="flex flex-row flex-wrap gap-2 bg-transparent rounded-none overflow-visible"
      >
        {question.options.map((opt) => (
          <RadioItem
            key={opt}
            value={opt}
            className={cn(
              PILL_BASE,
              "w-auto",
              PILL_UNSELECTED,
              "data-[state=checked]:bg-(--bg-interactive-primary-default)",
              "data-[state=checked]:text-(--text-inverse)",
              "data-[state=checked]:hover:bg-(--bg-interactive-primary-default)",
            )}
          >
            {opt}
          </RadioItem>
        ))}
      </RadioGroup>
    </div>
  );
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────

export function MultiSelect({
  question,
  value,
  onChange,
}: {
  question: MultiSelectQuestion;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
        {question.label}
      </p>
      <CheckboxGroup
        value={value}
        onChange={onChange}
        dividers={false}
        surface="default"
        className="flex flex-row flex-wrap gap-2 bg-transparent rounded-none overflow-visible"
      >
        {question.options.map((opt) => (
          <CheckboxItem
            key={opt}
            value={opt}
            className={cn(
              PILL_BASE,
              "w-auto",
              value.includes(opt) ? PILL_SELECTED : PILL_UNSELECTED,
            )}
          >
            {opt}
          </CheckboxItem>
        ))}
      </CheckboxGroup>
    </div>
  );
}

// ─── RankPriorities ───────────────────────────────────────────────────────────

export function SortableItem({ id, index }: { id: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5",
        "bg-(--bg-interactive-secondary-default)",
        isDragging && "opacity-50",
      )}
    >
      <span className="shrink-0 w-5 text-center text-body [font-weight:var(--font-weight-semibold)] text-(--text-tertiary)">
        {index + 1}
      </span>
      <button
        type="button"
        className="shrink-0 cursor-grab active:cursor-grabbing text-(--text-tertiary) touch-none focus-visible:outline-none"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${id}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-body text-(--text-primary)">{id}</span>
    </div>
  );
}

export function RankPriorities({
  question,
  value,
  onChange,
}: {
  question: RankPrioritiesQuestion;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-body [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
        {question.label}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {value.map((item, i) => (
              <SortableItem key={item} id={item} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
