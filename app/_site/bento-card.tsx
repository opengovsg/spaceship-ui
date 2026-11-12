import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "#/components/ds/lib/classnames";
import type { TileSize } from "@/lib/catalog";
import { Demo } from "./demo";

const SPAN: Record<TileSize, string> = {
  small: "",
  wide: "md:col-span-2",
  large: "md:col-span-2 md:row-span-2",
};

/** How wide a demo is laid out before it is shrunk to fit its tile. */
const DESIGN_WIDTH: Record<TileSize, number> = { small: 360, wide: 640, large: 760 };

/** A live demo in a tile, labelled bottom-left. The label opens the component's page. */
export function BentoCard({ name, label, size, kind }: { name: string; label: string; size: TileSize; kind: "component" | "pattern" }) {
  return (
    <article
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-xl bg-(--bg-surface-primary) shadow-(--shadow-border) transition-shadow duration-150 hover:shadow-(--shadow-border-hover)",
        SPAN[size],
      )}
    >
      <Demo name={name} className="min-h-0 flex-1" designWidth={DESIGN_WIDTH[size]} />
      <Link
        href={`/components/${name}`}
        className="flex items-center gap-2 px-4 pb-3 pt-1 text-caption text-content-secondary outline-none transition-colors hover:text-content focus-visible:text-content"
      >
        <span>{label}</span>
        {kind === "pattern" && <span className="rounded-full bg-(--bg-surface-secondary) px-1.5 text-content-tertiary">Pattern</span>}
        <ArrowUpRight aria-hidden className="ml-auto size-3.5 opacity-0 transition-opacity group-hover/card:opacity-100" />
      </Link>
    </article>
  );
}
