import { notFound } from "next/navigation";
import { getItem, getRegistry, hasPreview, readSource } from "@/lib/registry";
import { Preview } from "./preview";

export function generateStaticParams() {
  return getRegistry().items.map((i) => ({ name: i.name }));
}

export default async function ComponentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const item = getItem(name);
  if (!item) notFound();
  const { homepage } = getRegistry();

  return (
    <>
      <h1>{item.title}</h1>
      <p className="docs-muted">{item.type.replace("registry:", "")}</p>

      {hasPreview(item) && (
        <>
          <h2>Preview</h2>
          <Preview name={item.name} />
        </>
      )}

      <h2>Install</h2>
      <pre className="docs-code">{`npx shadcn@latest add ${homepage}/r/${item.name}.json`}</pre>

      {item.dependencies.length > 0 && (
        <>
          <h2>Uses packages</h2>
          <p className="docs-muted">{item.dependencies.join(", ")}</p>
        </>
      )}

      <h2>Source</h2>
      {item.files.map((f) => (
        <div key={f.path}>
          <p className="docs-muted">{f.target ?? f.path}</p>
          <pre className="docs-code">{readSource(f)}</pre>
        </div>
      ))}
    </>
  );
}
