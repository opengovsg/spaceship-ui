import Link from "next/link";
import { Button } from "#/components/ds/ui/button";
import { getCatalog, tileSize } from "@/lib/catalog";
import { BentoCard } from "./_site/bento-card";

/** Patterns lead (they show Spaceship best), then components. Dense flow fills the gaps. */
function showcaseOrder() {
  const all = getCatalog();
  const big = all.filter((e) => tileSize(e) !== "small");
  const small = all.filter((e) => tileSize(e) === "small");
  // Interleave: one big tile, then two small ones, so rows stay balanced.
  const out = [];
  while (big.length || small.length) {
    if (big.length) out.push(big.shift()!);
    out.push(...small.splice(0, 2));
  }
  return out;
}

export default function Home() {
  const entries = showcaseOrder();
  const components = entries.filter((e) => e.kind === "component").length;
  const patterns = entries.length - components;

  return (
    <>
      <section className="max-w-2xl pb-12 pt-10 sm:pt-16">
        <h1 className="font-serif text-display text-content">Spaceship UI</h1>
        <p className="mt-3 text-subtitle text-content-secondary">
          The components behind Spaceship. Try each one live, then install it into Spaceship Frontend with one command.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button asChild variant="primary">
            <Link href="#showcase">Browse components</Link>
          </Button>
          <Button asChild variant="secondary" surface="ghost">
            <Link href="/frontend">Use in Spaceship Frontend</Link>
          </Button>
        </div>
        <p className="mt-4 text-caption text-content-tertiary">
          {components} components · {patterns} patterns · one source of truth
        </p>
      </section>

      <section id="showcase" aria-label="All components" className="grid scroll-mt-20 auto-rows-[280px] grid-flow-row-dense grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((e) => (
          <BentoCard key={e.name} name={e.name} label={e.label} size={tileSize(e)} kind={e.kind} />
        ))}
      </section>
    </>
  );
}
