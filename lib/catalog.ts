import { getRegistry, hasPreview, readSource, type RegistryItem } from "@/lib/registry";

/** One entry the site shows: a component or a pattern with a live demo. */
export type CatalogEntry = {
  name: string;
  label: string;
  kind: "component" | "pattern";
  item: RegistryItem;
};

/** Bento tile sizes. Small is 1×1, wide is 2×1, large is 2×2. */
export type TileSize = "small" | "wide" | "large";

/** Patterns that read best with more room. Everything else uses its kind's default. */
const TILE_OVERRIDES: Record<string, TileSize> = {
  "chat-panel": "large",
  "artifact-panel": "large",
  sidebar: "large",
  "two-column-layout": "large",
  flowchart: "large",
  "chat-thread": "wide",
  "chat-input-box": "wide",
  "clarification-card": "wide",
  "approval-card": "wide",
  "task-list": "wide",
  "thinking-steps": "wide",
};

/** "chat-bubble" → "ChatBubble", "Spaceship Logo" → "SpaceshipLogo", "Callout" stays. */
export function toLabel(title: string): string {
  return title
    .split(/[-\s_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

export function getCatalog(): CatalogEntry[] {
  const entries = getRegistry()
    .items.filter(hasPreview)
    .map((item) => ({
      name: item.name,
      label: toLabel(item.title),
      kind: item.type === "registry:block" ? ("pattern" as const) : ("component" as const),
      item,
    }));
  return entries.sort((a, b) => a.label.localeCompare(b.label));
}

export function tileSize(entry: CatalogEntry): TileSize {
  return TILE_OVERRIDES[entry.name] ?? (entry.kind === "pattern" ? "wide" : "small");
}

/** Sidebar and prev/next order: components A to Z, then patterns A to Z. */
export function getNavOrder(): CatalogEntry[] {
  const all = getCatalog();
  return [...all.filter((e) => e.kind === "component"), ...all.filter((e) => e.kind === "pattern")];
}

export function getNeighbours(name: string) {
  const order = getNavOrder();
  const i = order.findIndex((e) => e.name === name);
  return { prev: i > 0 ? order[i - 1] : undefined, next: i >= 0 && i < order.length - 1 ? order[i + 1] : undefined };
}

/** The import line an app uses: the item's main file and a name it really exports. */
export function importLine(item: RegistryItem, label: string): string | undefined {
  const file =
    item.files.find((f) => /(^|\/)index\.tsx?$/.test(f.path)) ??
    item.files.find((f) => /\.tsx$/.test(f.path)) ??
    item.files.find((f) => /\.ts$/.test(f.path));
  if (!file?.target) return undefined;
  const exported = [
    ...readSource(file).matchAll(/export\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9]*)/g),
    ...readSource(file).matchAll(/export\s+\{\s*([A-Z][A-Za-z0-9]*)/g),
  ].map((m) => m[1]);
  const name = exported.includes(label) ? label : exported[0];
  if (!name) return undefined;
  const mod = file.target
    .replace(/^src\//, "#/")
    .replace(/\.tsx?$/, "")
    .replace(/\/index$/, "");
  return `import { ${name} } from "${mod}";`;
}
