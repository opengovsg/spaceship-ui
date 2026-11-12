import fs from "node:fs";
import path from "node:path";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "#/components/ds/ui/button";
import { getCatalog, getNeighbours, importLine, tileSize } from "@/lib/catalog";
import { getRegistry, readSource } from "@/lib/registry";
import { CommandLine } from "../../_site/copy-button";
import { PreviewCode } from "../../_site/preview-code";

export function generateStaticParams() {
  return getCatalog().map((e) => ({ name: e.name }));
}

function entryFor(name: string) {
  return getCatalog().find((e) => e.name === name);
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  return { title: entryFor(name)?.label ?? "Not found" };
}

function exampleSource(name: string): string | undefined {
  const file = path.join(process.cwd(), "registry/examples", `${name}.tsx`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : undefined;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-12 text-title text-content">{children}</h2>;
}

// Next 16 wants URL data read behind a Suspense boundary so the page shell stays instant.
export default function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl pt-12" aria-busy />}>
      <ComponentBody params={params} />
    </Suspense>
  );
}

async function ComponentBody({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const entry = entryFor(name);
  if (!entry) notFound();
  const { item, label, kind } = entry;
  const { homepage } = getRegistry();
  const { prev, next } = getNeighbours(name);
  const size = tileSize(entry);
  const imp = importLine(item, label);

  return (
    <article className="mx-auto max-w-3xl pt-8 sm:pt-12">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-caption text-content-tertiary">{kind === "pattern" ? "Pattern" : "Component"}</p>
          <h1 className="mt-1 font-serif text-display text-content">{label}</h1>
        </div>
        <div className="flex gap-1">
          {prev ? (
            <Button asChild variant="secondary" surface="ghost" size="icon-sm" aria-label={`Previous: ${prev.label}`} title={prev.label}>
              <Link href={`/components/${prev.name}`}>
                <ArrowLeft />
              </Link>
            </Button>
          ) : null}
          {next ? (
            <Button asChild variant="secondary" surface="ghost" size="icon-sm" aria-label={`Next: ${next.label}`} title={next.label}>
              <Link href={`/components/${next.name}`}>
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <PreviewCode name={name} code={exampleSource(name)} designWidth={size === "small" ? 0 : 720} />
      </div>

      <SectionTitle>Use it in Spaceship Frontend</SectionTitle>
      <p className="mb-3 text-body text-content-secondary">It&apos;s already installed. Import it:</p>
      {imp ? <CommandLine command={imp} /> : null}
      <p className="mb-3 mt-6 text-body text-content-secondary">
        Installing into another app, or pulling a newer version? Run this from the app&apos;s folder.{" "}
        <Link href="/frontend" className="text-content underline underline-offset-2">
          How updates work
        </Link>
      </p>
      <CommandLine command={`npx shadcn@latest add ${homepage}/r/${name}.json`} />

      {(item.dependencies.length > 0 || item.registryDependencies.length > 0) && (
        <>
          <SectionTitle>What comes with it</SectionTitle>
          <dl className="grid gap-4 text-body sm:grid-cols-2">
            {item.dependencies.length > 0 && (
              <div>
                <dt className="text-caption text-content-tertiary">npm packages</dt>
                <dd className="mt-1 font-mono text-caption text-content">{item.dependencies.join(", ")}</dd>
              </div>
            )}
            {item.registryDependencies.length > 0 && (
              <div>
                <dt className="text-caption text-content-tertiary">Other Spaceship UI items</dt>
                <dd className="mt-1 flex flex-wrap gap-x-2 text-caption">
                  {item.registryDependencies.map((url) => {
                    const dep = url.split("/").pop()!.replace(/\.json$/, "");
                    const known = entryFor(dep);
                    return known ? (
                      <Link key={dep} href={`/components/${dep}`} className="text-content underline underline-offset-2">
                        {known.label}
                      </Link>
                    ) : (
                      <span key={dep} className="font-mono text-content">
                        {dep}
                      </span>
                    );
                  })}
                </dd>
              </div>
            )}
          </dl>
        </>
      )}

      <SectionTitle>Source</SectionTitle>
      <div className="flex flex-col gap-4">
        {item.files.map((f) => (
          <details key={f.path} className="group overflow-hidden rounded-xl bg-(--bg-surface-primary) shadow-(--shadow-border)">
            <summary className="cursor-pointer list-none px-4 py-3 font-mono text-caption text-content-secondary hover:text-content">
              {f.target ?? f.path}
            </summary>
            <pre className="max-h-[560px] overflow-auto border-t border-(--border-subtle) p-5 font-mono text-caption leading-relaxed text-content">
              {readSource(f)}
            </pre>
          </details>
        ))}
      </div>
    </article>
  );
}
