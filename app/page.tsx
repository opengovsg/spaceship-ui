import Link from "next/link";
import { GROUPS, getRegistry } from "@/lib/registry";

export default function Home() {
  const registry = getRegistry();
  return (
    <>
      <h1>{registry.name}</h1>
      <p className="docs-muted">
        Every component in one place. Open one to see it and copy its install command.
      </p>
      {GROUPS.map(({ type, label }) => {
        const items = registry.items.filter((i) => i.type === type);
        if (!items.length) return null;
        return (
          <section key={type}>
            <h2>
              {label} ({items.length})
            </h2>
            <div className="docs-grid">
              {items.map((i) => (
                <Link key={i.name} href={`/components/${i.name}`} className="docs-card">
                  {i.title}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
