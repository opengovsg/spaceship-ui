import type { Metadata } from "next";
import Link from "next/link";
import { getRegistry } from "@/lib/registry";
import { CommandLine } from "../_site/copy-button";

export const metadata: Metadata = { title: "Use in Spaceship Frontend" };

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-(--border-subtle) py-8 sm:grid-cols-[3rem_1fr]">
      <span className="font-serif text-title text-content-tertiary tabular-nums">{n}</span>
      <div className="min-w-0">
        <h2 className="text-title text-content">{title}</h2>
        <div className="mt-3 flex flex-col gap-3 text-body text-content-secondary">{children}</div>
      </div>
    </section>
  );
}

function Box({ title, sub, strong }: { title: string; sub: string; strong?: boolean }) {
  return (
    <div
      className={
        strong
          ? "rounded-xl bg-(--bg-surface-brand-subtle) px-4 py-3 shadow-(--shadow-border)"
          : "rounded-xl bg-(--bg-surface-primary) px-4 py-3 shadow-(--shadow-border)"
      }
    >
      <p className="text-body text-content">{title}</p>
      <p className="mt-0.5 font-mono text-caption text-content-tertiary">{sub}</p>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2 text-caption text-content-tertiary">
      <span>{label}</span>
      <span aria-hidden className="text-content-secondary">
        →
      </span>
    </div>
  );
}

const CHECK_LINES: { code: string; meaning: string; fix: string }[] = [
  { code: "DRIFT", meaning: "Someone edited the app's copy.", fix: "Move the edit into Spaceship UI, or take the library version back." },
  { code: "APP ONLY", meaning: "The app has a file the library doesn't.", fix: "Send it up to Spaceship UI, or move it out of the design-system folder." },
  { code: "LIB ONLY", meaning: "The library has a file the app hasn't installed.", fix: "Install it if the app needs it. Otherwise ignore it." },
  { code: "in sync", meaning: "Everything matches.", fix: "Nothing to do." },
];

export default function FrontendPage() {
  const { homepage } = getRegistry();
  return (
    <article className="mx-auto max-w-3xl pt-8 sm:pt-12">
      <p className="text-caption text-content-tertiary">Guide</p>
      <h1 className="mt-1 font-serif text-display text-content">Use in Spaceship Frontend</h1>
      <p className="mt-3 text-subtitle text-content-secondary">
        Spaceship Frontend doesn&apos;t own its components any more. It keeps copies of the ones in this library, and a check makes sure
        the copies never change on their own.
      </p>

      {/* How a component travels */}
      <figure className="mt-10 overflow-x-auto rounded-xl bg-(--bg-surface-subtle) p-5" aria-label="How a component travels from Spaceship UI into Spaceship Frontend">
        <div className="flex min-w-[640px] items-stretch">
          <Box strong title="Spaceship UI" sub="registry/ui/button.tsx" />
          <Arrow label="build" />
          <Box title="This site" sub="/r/button.json" />
          <Arrow label="shadcn add" />
          <Box title="Spaceship Frontend" sub="src/components/ds/ui/button.tsx" />
        </div>
        <figcaption className="mt-4 text-caption text-content-secondary">
          On every pull request, Spaceship Frontend&apos;s CI compares its copies with this library, file by file. If one is different, the
          &ldquo;Design library check&rdquo; fails.
        </figcaption>
      </figure>

      <h2 className="mt-12 text-title text-content">Where things land</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-body">
          <thead className="text-caption text-content-tertiary">
            <tr>
              <th className="py-2 pr-4 font-normal">In Spaceship UI</th>
              <th className="py-2 font-normal">In Spaceship Frontend</th>
            </tr>
          </thead>
          <tbody className="font-mono text-caption text-content">
            {[
              ["registry/ui/", "src/components/ds/ui/"],
              ["registry/patterns/", "src/components/ds/patterns/"],
              ["registry/lib/", "src/components/ds/lib/"],
              ["registry/tokens/", "src/components/ds/tokens/"],
              ["registry/icons/", "src/components/ds/icons/"],
            ].map(([a, b]) => (
              <tr key={a} className="border-t border-(--border-subtle)">
                <td className="py-2 pr-4">{a}</td>
                <td className="py-2">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12">
        <Step n={1} title="Use a component">
          <p>Every component is already installed. Import it like any other file:</p>
          <CommandLine command={`import { Button } from "#/components/ds/ui";`} />
          <p>
            Each component&apos;s page shows its exact import line. Start from the{" "}
            <Link href="/#showcase" className="text-content underline underline-offset-2">
              showcase
            </Link>
            .
          </p>
        </Step>

        <Step n={2} title="Change a component">
          <p>
            Change it here, in Spaceship UI, not inside Spaceship Frontend. Edit the file in <code className="font-mono text-caption">registry/</code>,
            update its demo in <code className="font-mono text-caption">registry/examples/</code>, then rebuild and open a pull request:
          </p>
          <CommandLine command="npm run registry" />
          <p>
            Edited it in the app by mistake? Ask Claude to run <strong className="text-content">lab design library add</strong>. It moves your
            edit up into Spaceship UI for you.
          </p>
        </Step>

        <Step n={3} title="Pull updates into Spaceship Frontend">
          <p>
            Once a change is merged here, ask Claude in Spaceship Frontend to run <strong className="text-content">lab design library update</strong>.
            It shows what changed first, then installs it. To do one by hand, from the app&apos;s folder:
          </p>
          <CommandLine command={`npx shadcn@latest add ${homepage}/r/button.json --overwrite`} />
        </Step>

        <Step n={4} title="Add something new">
          <p>
            Build it in <code className="font-mono text-caption">registry/ui/</code> (or <code className="font-mono text-caption">registry/patterns/</code>{" "}
            for a bigger piece), give it a demo, run <code className="font-mono text-caption">npm run registry</code>, and open a pull request. After it
            merges, install it into the app with the command on its page.
          </p>
        </Step>
      </div>

      <h2 className="mt-12 text-title text-content">When the check fails</h2>
      <p className="mt-3 text-body text-content-secondary">Each line of the check says what kind of difference it found:</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-body">
          <thead className="text-caption text-content-tertiary">
            <tr>
              <th className="py-2 pr-4 font-normal">It says</th>
              <th className="py-2 pr-4 font-normal">What it means</th>
              <th className="py-2 font-normal">What to do</th>
            </tr>
          </thead>
          <tbody>
            {CHECK_LINES.map((l) => (
              <tr key={l.code} className="border-t border-(--border-subtle) align-top">
                <td className="py-2 pr-4 font-mono text-caption text-content">{l.code}</td>
                <td className="py-2 pr-4 text-content-secondary">{l.meaning}</td>
                <td className="py-2 text-content-secondary">{l.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-title text-content">Rules</h2>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body text-content-secondary">
        <li>Don&apos;t edit files in <code className="font-mono text-caption">src/components/ds/</code> by hand. The check will fail.</li>
        <li>Components take app things (data, analytics, logins) as props. They never reach into the app themselves.</li>
        <li>Moving a component and changing how it looks are separate pull requests.</li>
        <li>HeroUI stays in the app only. New UI comes from Spaceship UI.</li>
      </ul>
    </article>
  );
}
