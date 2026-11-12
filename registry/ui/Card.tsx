import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";

export const cardVariants = cva(
  ["rounded-lg", "bg-(--bg-surface-base)", "flex flex-col gap-3 p-4"],
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

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  title?: string;
  /** Custom header content — takes precedence over `title` when provided. */
  header?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { title, header, surface, className, children, ...props },
  ref,
) {
  const headerContent =
    header ??
    (title && (
      <h3 className="font-sans text-caption font-semibold normal-case text-(--text-secondary)">
        {title}
      </h3>
    ));

  if (!title) {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(cardVariants({ surface }), className)}
      >
        {headerContent}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "flex flex-col gap-3 rounded-lg bg-(--bg-surface-secondary) p-4 shadow-(--shadow-card)",
        className,
      )}
    >
      {headerContent}
      <div className={cn(cardVariants({ surface }), "min-h-0 flex-1")}>
        {children}
      </div>
    </div>
  );
});
