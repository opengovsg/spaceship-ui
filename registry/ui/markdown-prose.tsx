"use client";

import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/components/ds/lib/classnames";

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const markdownProseVariants = cva(
  [
    "w-full min-w-0 font-sans",
    "text-body text-(--text-secondary)",
    // Lets the caller's own spacing (a card's p-4, an ApprovalCard's p-4) own
    // the edges instead of the first/last block adding its own margin on top.
    "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
    // Headings — h1 is the document title (matches an ArtifactPanel h2 above
    // it in the visual hierarchy without competing with it at full browser
    // default size); h2/h3/h4 step down from there.
    "[&_h1]:text-title [&_h1]:font-semibold [&_h1]:text-(--text-primary) [&_h1]:mt-0 [&_h1]:mb-4",
    "[&_h2]:text-subtitle [&_h2]:font-semibold [&_h2]:text-(--text-primary) [&_h2]:mt-8 [&_h2]:mb-3 [&_h2:first-child]:mt-0",
    "[&_h3]:text-body [&_h3]:font-semibold [&_h3]:text-(--text-primary) [&_h3]:mt-5 [&_h3]:mb-2",
    "[&_h4]:text-body [&_h4]:font-semibold [&_h4]:text-(--text-primary) [&_h4]:mt-4 [&_h4]:mb-1",
    "[&_h5]:text-body [&_h5]:font-semibold [&_h5]:text-(--text-primary) [&_h5]:mt-4 [&_h5]:mb-1",
    "[&_h6]:text-body [&_h6]:font-semibold [&_h6]:text-(--text-primary) [&_h6]:mt-4 [&_h6]:mb-1",
    // Body text
    "[&_p]:mb-3 [&_p:last-child]:mb-0",
    "[&_strong]:[font-weight:var(--font-weight-semibold)] [&_strong]:text-(--text-primary)",
    "[&_em]:italic",
    "[&_a]:text-(--text-interactive-primary) [&_a]:underline [&_a]:underline-offset-2",
    // Lists
    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:mb-3",
    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:mb-3",
    "[&_li]:marker:text-(--text-tertiary)",
    "[&_li>ul]:mt-1 [&_li>ul]:mb-0 [&_li>ol]:mt-1 [&_li>ol]:mb-0",
    // Blockquote — reads as an aside, not body copy
    "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-(--border-default) [&_blockquote]:pl-4 [&_blockquote]:text-(--text-tertiary)",
    "[&_hr]:my-6 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-(--border-default)",
    // Code — the literal register, mono regardless of body font
    "[&_code]:font-mono [&_code]:text-caption [&_code]:bg-(--bg-surface-secondary) [&_code]:text-(--text-primary) [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm",
    "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-(--bg-surface-secondary) [&_pre]:p-3",
    "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none",
    // Tables — the wrapping scroll port is added by the `table` component
    // override below; these classes style the table itself.
    "[&_table]:w-full [&_table]:border-collapse [&_table]:text-left",
    "[&_thead]:border-b [&_thead]:border-(--border-default)",
    "[&_th]:font-sans [&_th]:text-caption [&_th]:[font-weight:var(--font-weight-semibold)] [&_th]:text-(--text-secondary) [&_th]:px-3 [&_th]:py-2 [&_th]:align-bottom",
    "[&_td]:text-body [&_td]:text-(--text-secondary) [&_td]:tabular-nums [&_td]:px-3 [&_td]:py-2 [&_td]:align-top",
    "[&_tbody_tr]:border-b [&_tbody_tr]:border-(--border-subtle) [&_tbody_tr:last-child]:border-0",
  ],
  {
    variants: {
      surface: {
        default: "",
        "shadow-border":
          "rounded-lg bg-(--bg-surface-base) p-4 shadow-(--shadow-border)",
      },
    },
    defaultVariants: { surface: "default" },
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TableProps = React.ClassAttributes<HTMLTableElement> &
  React.HTMLAttributes<HTMLTableElement> &
  ExtraProps;

/** Wraps the rendered `<table>` in a horizontal scroll port — the panel this
 *  sits in only scrolls vertically, and the report's widest table row runs
 *  past 100 characters, so without this a table would either blow out the
 *  panel width or (with `table-layout: fixed`) crush its columns illegibly. */
function Table({ children }: TableProps) {
  return (
    <div className="my-3 w-full overflow-x-auto">
      <table>{children}</table>
    </div>
  );
}

function Anchor({
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & ExtraProps) {
  const anchorProps = { ...props };
  delete anchorProps.node;
  const isExternal = /^https?:\/\//i.test(href ?? "");
  return (
    <a
      {...anchorProps}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MarkdownProseProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof markdownProseVariants> {
  /** The markdown source to render. */
  children: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a markdown document with the DS's document typography — GFM tables,
 * headings, lists, blockquotes. Used for LLM-generated artifacts (the CDB
 * proposal, an implementation plan) that need to read as a real document
 * rather than raw source.
 *
 * `surface="default"` (no padding, no background) so it composes cleanly
 * inside a container that already owns those — e.g. `ArtifactPanel`'s content
 * card. `surface="shadow-border"` is for standalone use.
 */
export function MarkdownProse({
  children,
  surface,
  className,
  ...props
}: MarkdownProseProps) {
  return (
    <div
      className={cn(markdownProseVariants({ surface }), className)}
      {...props}
    >
      <ReactMarkdown
        // `singleTilde: false` — GFM strikethrough defaults to treating a
        // single `~` as a delimiter, which collides with "~$5M" (approximate
        // value) markers used throughout the report. Require the standard
        // `~~double~~` tilde for strikethrough instead.
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={{ table: Table, a: Anchor }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
