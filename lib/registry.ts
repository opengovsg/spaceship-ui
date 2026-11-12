import fs from "node:fs";
import path from "node:path";

export type RegistryFile = { path: string; type: string; target?: string };
export type RegistryItem = {
  name: string;
  type: "registry:ui" | "registry:block" | "registry:hook" | "registry:lib" | "registry:style" | "registry:file";
  title: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
};
export type Registry = { name: string; homepage: string; items: RegistryItem[] };

export function getRegistry(): Registry {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "registry.json"), "utf8"));
}

export function getItem(name: string): RegistryItem | undefined {
  return getRegistry().items.find((i) => i.name === name);
}

export function readSource(file: RegistryFile): string {
  return fs.readFileSync(path.join(process.cwd(), file.path), "utf8");
}

export const GROUPS: { type: RegistryItem["type"]; label: string }[] = [
  { type: "registry:ui", label: "Components" },
  { type: "registry:block", label: "Patterns" },
  { type: "registry:hook", label: "Hooks" },
  { type: "registry:lib", label: "Helpers" },
  { type: "registry:style", label: "Tokens" },
  { type: "registry:file", label: "Files" },
];

/** Only components and patterns have a live demo. */
export const hasPreview = (item: RegistryItem) =>
  item.type === "registry:ui" || item.type === "registry:block";
