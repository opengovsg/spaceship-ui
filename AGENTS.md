<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# spaceship-ui

The Spaceship design system: one library, one docs site. This repo is the only place Spaceship components and tokens change. Apps install copies with the shadcn CLI, and a `check` in each app's CI fails if a copy drifts.

Driven by the `lab-design-library` skill in `aed-design-lab` (modes: setup, add, update, check). Design and reasons: `aed-design-lab/ops-flows/sync-design-library/design.md`.

## Layout

| Path | What |
|---|---|
| `registry/ui/`, `registry/patterns/`, `registry/lib/`, `registry/tokens/`, `registry/icons/` | The components. Byte-for-byte the same as `spaceship-frontend/src/components/ds/`. |
| `registry/AGENTS.md` | DS conventions. Ships to apps too. Follow it when editing anything in `registry/`. |
| `registry/examples/<item>.tsx` | One small demo per ui/pattern item. Docs-only, never installed. |
| `registry.json` | Item list in shadcn format. Generated, do not hand-edit. |
| `public/r/*.json` | Built by `shadcn build`. Installs pull from here. |
| `app/`, `lib/` | The docs site (Next.js). |
| `scripts/dslib.py` | Copy of the lab helper. App CI runs its `check`. |

## Rules

- `registry/` files import each other as `#/components/ds/...`, the same alias the app uses, so files are identical on both sides. Never rewrite that alias.
- Icons are imported the Vite way (`icon.svg?react`). `next.config.ts` maps that to svgr.
- No app logic in `registry/`: no data hooks, analytics, routing or auth. Take it as a prop.
- Every ui and pattern item needs an example in `registry/examples/`, or it does not ship.
- Do not change how a component looks while moving it. Moving and redesigning are separate PRs.
- PRs only, never push to `main`.

## Commands

```bash
npm install
npm run registry   # rebuild registry.json, examples.generated.tsx and public/r/
npm run dev        # docs site on :3000
npm run build
```
