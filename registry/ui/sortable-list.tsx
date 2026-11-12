"use client";

import { type ReactNode } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { GripVertical } from "lucide-react";
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
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const sortableListVariants = cva(
  ["flex flex-col", "bg-(--bg-surface-base)", "rounded-xl overflow-hidden"],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border": "shadow-(--shadow-border)",
      },
    },
    defaultVariants: { surface: "shadow-border" },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SortableListProps extends VariantProps<
  typeof sortableListVariants
> {
  items: string[];
  onReorder: (items: string[]) => void;
  renderItem?: (item: string, index: number) => ReactNode;
  dividers?: boolean;
  className?: string;
}

export interface SortableItemProps {
  id: string;
  index: number;
  children: ReactNode;
  showDivider: boolean;
}

// ─── SortableItem ─────────────────────────────────────────────────────────────

export function SortableItem({
  id,
  index,
  children,
  showDivider,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <>
      {showDivider && (
        <SeparatorPrimitive.Root className="mx-4 h-px bg-(--bg-surface-secondary)" />
      )}
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn(
          "flex items-center gap-3 w-full px-4 py-3 rounded-lg",
          "transition-colors duration-(--duration-fast) ease-(--ease-in-out)",
          isDragging
            ? "bg-(--bg-interactive-tertiary-hover) opacity-50"
            : "hover:bg-(--bg-interactive-tertiary-hover) focus-within:bg-(--bg-interactive-tertiary-hover) active:bg-(--bg-interactive-tertiary-pressed)",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center shrink-0 w-6 h-6 rounded",
            "bg-(--bg-interactive-tertiary-pressed)",
            "text-caption font-semibold",
            "text-(--text-primary)",
          )}
        >
          {index + 1}
        </span>
        {children}

        {/* Drag handle */}
        <button
          type="button"
          className="shrink-0 cursor-grab active:cursor-grabbing text-(--text-tertiary) touch-none rounded-sm focus-visible:outline-none"
          aria-label={`Drag to reorder ${id}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </>
  );
}

// ─── SortableList ─────────────────────────────────────────────────────────────

export function SortableList({
  items,
  onReorder,
  renderItem,
  dividers = true,
  surface,
  className,
}: SortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <div
      className={cn(
        sortableListVariants({ surface }),
        !dividers && "gap-1",
        className,
      )}
    >
      <VisuallyHidden>
        Drag items to reorder. Use arrow keys when focused on a drag handle.
      </VisuallyHidden>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item, i) => (
            <SortableItem
              key={item}
              id={item}
              index={i}
              showDivider={dividers && i > 0}
            >
              {renderItem ? (
                renderItem(item, i)
              ) : (
                <span className="flex-1 text-body text-(--text-primary)">
                  {item}
                </span>
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
