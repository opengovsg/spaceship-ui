# Spaceship Design System: installed from spaceship-ui

This directory (`src/components/ds/`) holds the **Spaceship Design System**
components. They are installed copies from the
[`spaceship-ui`](https://github.com/opengovsg/spaceship-ui) library, which is the
only place components and tokens change. Follow these conventions for any work
under `src/components/ds/`.

> **Library is the source of truth:** every file here must match `spaceship-ui`'s
> `registry/` folder byte for byte. CI runs the design-library `check` and fails on
> drift. To change a component or token, change it in `spaceship-ui` (or edit here
> and send it up with the `lab-design-library` skill's `add` mode), then pull it in
> with `update` mode. Config: `design-library.json` at the repo root.
> Tokens live in `ds/tokens/` (`tokens.css` synced from Figma, plus
> `typography.css`, `surfaces.css`, and the Tailwind `@theme` map in `theme.css`).
> Shared helpers (`cn`, motion presets, `resolveColor`) live in `ds/lib/`.
> HeroUI stays app-only (`hero.ts`, wired in `src/tailwind.css`).

> **Shared library:** both app versions consume this canonical library. New reusable UI belongs here. App-specific layouts and persistence-aware components live under `src/components/shared/`.

## Architecture

| Directory                                          | Purpose                                         | Styling rule                                      |
| -------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `ds/ui/`                                           | DS components                                   | CVA + CSS custom properties (`var(--token)`) ONLY |
| `ds/patterns/`                                     | Pattern compositions                            | Composes from `#/components/ds/ui` exclusively    |
| `ds/lib/`                                          | Shared helpers (`cn`, motion, colour, parsing)  | No React components, no app imports               |
| `ds/tokens/`                                       | Token CSS and the Tailwind `@theme` map         | Edit in `spaceship-ui`, not here                  |
| `ds/icons/`                                        | Raw SVG icons used by DS components             | Imported via `?react`                             |
| `ds/ui/*.stories.tsx`, `ds/patterns/*.stories.tsx` | Storybook stories                               | No implementation logic — thin wrappers           |

**Hard rules:**

- DS components (`ds/ui/`) never import story helpers (`#/stories/helpers/ds/`) or app code — only `#/components/ds/lib/classnames` (`cn`), `#/components/ds/lib/motion` (springs/scales/staggers), `#/components/ds/lib/resolve-color` (`resolveColor`/`toAlphaZero`), Radix, `react-textarea-autosize` for measured textarea sizing (a required consumer dependency), sibling `ds/ui` files, and — for components whose job is rendering markdown (`ChatMessage`, `MarkdownProse`) — the markdown pipeline (`react-markdown`, `remark-*`).
- Patterns (`ds/patterns/`) compose exclusively from `#/components/ds/ui`.
- Stories never contain implementation logic (only `useState` for controlled demos); data/mocks live in `src/stories/helpers/ds/` (outside the DS folder, so they stay out of the library).
- Import from the barrel: `import { Button } from "#/components/ds/ui"`.

## Component conventions

- **Radix primitives** — build on `@radix-ui/react-*` when a matching primitive exists (Dialog, DropdownMenu, Tabs, Checkbox, RadioGroup, etc.) for accessibility.
- **Named exports only** — no default exports; export the component + its `*Variants` from `ds/ui/index.ts`.
- **CVA** (`class-variance-authority`) for variants; **`cn()`** for composition. Pass an **array** to the `cva()` base, not a string.
- **Never hardcode hex** — always `var(--token)` via Tailwind v4 **paren syntax**: `bg-(--bg-surface-base)`, not `bg-[var(--...)]`.
- **No `dark:` variants** — theming is `[data-theme="dark"]` on `<html>`; only semantic tokens flip.
- **`surface` variant** — every component that can appear on different backgrounds has a `surface` variant (`default` / `shadow-border` at minimum). Use `compoundVariants` for `surface × state/variant` border/shadow switching.
- **Motion** — interactive components use `framer-motion` (imported as `framer-motion`; the DS repo calls it `motion/react` — same library). Always accept a `disableMotion` prop. Spread `{...props}` **before** explicit motion props (`initial`/`whileHover`/`whileTap`/`transition`). Add `style={{ willChange: 'transform' }}` on scale animations. Keep spring damping ratio ζ = damping / (2·√stiffness) ≥ 0.7.
- **Icons** — `leadingIcon` / `trailingIcon` props + an `ICON_CLASSES` record + an `IconSlot` helper. Icon set is `lucide-react`.
- **Section order in a component block:** Types → Constants → Helpers → Hooks → CVA → Props → Component.

## Mistakes to avoid

- No Tailwind v3 bracket syntax (`bg-[var(--token)]`) — use v4 parens (`bg-(--token)`).
- No `text-[var(--font-size-*)]` — `tailwind-merge` mis-merges it. Use `[font-size:var(--font-size-sm)]` or `text-(length:--font-size-sm)`.
- No `font-[var(--font-*)]` — use `font-sans`/`font-serif`/`font-mono` (wired via `@theme`) or `[font-weight:var(--font-weight-semibold)]`.
- Never reference **primitive** tokens in components (`bg-(--orbit-blue-500)`) — use a **semantic** token.
- No inline `style={{ color: 'var(--token)' }}` for token values — use `className` with paren syntax.
- Deleted button variants — do NOT use `outline`, `neo-brutalist`, or `professional`. Canonical: variants `primary | secondary | tertiary | success | destructive`; surfaces `flat | shadow | ghost`. Text buttons use `size="default"` (36px high) or `size="sm"` (28px high), with at least 8px icon-label gaps. Icon-only buttons use `size="icon"` (36×36px) or `size="icon-sm"` (28×28px) and always ghost. Small sizes default to 14px icons; standard sizes default to 16px. `iconSize={14 | 16}` explicitly overrides either default. All sizes retain 8px corners. Legacy `md`/`lg` and `icon-md`/`icon-lg` aliases retain 36px geometry. `ghostBehavior="plain"` stays transparent in every pointer state; `"shaded"` (default) shades on hover/press. Secondary non-ghost buttons use a semantic white/dark fill, with no border or shadow; existing focus styling is unchanged. `IconButton` solid/outline and dropShadow props are deprecated compatibility aliases and render ghost.
- Interfaces extending `HTMLMotionProps<'button'>` must declare `children?: React.ReactNode` (React 19 doesn't inject it).
- Stories: no implementation logic; spread `EXCLUDE_MOTION_PROPS` (from `#/stories/helpers/ds/motion-argtypes`) into `argTypes` for motion components.

## DS enforcement checklist (run mentally before finishing)

**Components (`ds/ui/`):** semantic tokens only (no hex, no `text-white`/`bg-zinc-*`); no primitive tokens; CVA array base; has a `surface` variant; `compoundVariants` for border/shadow; `framer-motion` + `disableMotion`; `{...props}` before motion props, `willChange:'transform'` on scale, ζ ≥ 0.7; icon props pattern; named export + added to `index.ts`; no `dark:`; no imports from story helpers; story exists with a title chosen per the **Storybook title rule** below.

**Patterns (`ds/patterns/`):** composes only from `#/components/ds/ui`; layout-only styles via paren tokens; no inline hardcoded `style`; no Tailwind colour utilities; story exists with a title chosen per the **Storybook title rule** below.

## Storybook title rule

Story title is **not** determined by which directory the file lives in — `ds/patterns/` may only compose from `ds/ui/` (see Architecture table above), but several `ds/ui/` files are themselves use-case-specific (`ChatBubble`, `ApprovalCard`, …), so directory alone doesn't tell you where a story belongs. Instead:

- **Generic primitive** — something you'd find in any digital product (buttons, modals, tags, tabs, generic lists/forms): title `Components/{Name}`.
- **Use-case pattern** — only makes sense inside a specific Spaceship flow: title `Patterns/{Use case}/{Name}`, picking one of the existing use-case groups:
  - `Patterns/Chat/*` — the chat surface (`ChatPanel`, `ChatThread`, `ChatMessage`, `ChatBubble`, `ChatInputBox`, `ChatInputSlot`, `EditableTitle`)
  - `Patterns/Prototype Controls/*` — approval/clarification gating UI (`ApprovalCard`, `ClarificationCard`, `TaskList`, `FeedbackForm`)
  - `Patterns/Artifact & Preview/*` — the artifact/preview panel (`ArtifactContentRenderer`, `ArtifactSegmentedControl`, `FolderTabs`, `FolderTabsV2`, `ShareableLink`)
  - `Patterns/Agent Status/*` — agent working/streaming indicators (`Thinking`, `ShimmerText`)

  A genuinely new use case needs its own group name added here **and** to `.storybook/preview.tsx` `storySort.order` (the nested array under `"Patterns"`) — otherwise it sorts alphabetically instead of in the intended position.

## How to extend

**Add a DS component:** add it to `spaceship-ui` (or create it here and send it up with `add` mode): create `ds/ui/[name].tsx` (named export, CVA + CSS vars) → export from `ds/ui/index.ts` → add `ds/ui/{Component}.stories.tsx` titled per the **Storybook title rule** above. Use the shared `frontend-add-story` skill, applying this directory's conventions when older examples differ.

**Add a pattern:** create `ds/patterns/[Name].tsx` → export from `ds/patterns/index.ts` → add `ds/patterns/{Name}.stories.tsx` titled per the **Storybook title rule** above (almost always `Patterns/{Use case}/{Name}`).

**Change a token:** edit it in **`spaceship-ui`** (`registry/tokens/`), then pull it in with the `lab-design-library` skill's `update` mode. Do not hand-edit tokens here: CI will flag the drift.

## Storybook

- Titles: see the **Storybook title rule** above — generic primitives → `Components/{Name}`, use-case patterns → `Patterns/{Use case}/{Name}`, foundations → `Foundations/{Name}`. Order is set in `.storybook/preview.tsx` `storySort`.
- Before done: `pnpm run lint`, `pnpm run test:storybook` (renders every story), and grep changed files for hardcoded hex / Tailwind colour utilities.

### Design-review tooling (for designers)

Storybook is set up as a design-review tool. Available in the toolbar / panels:

- **Theme toggle** (Light/Dark) — flips `[data-theme]` on `<html>`; verify every component in both modes.
- **Backgrounds** — review on DS surfaces (Canvas, Base, Brand tint, Neutral, Dark).
- **Viewport** — Mobile / Tablet / Laptop / Desktop.
- **Measure / Outline** — inspect spacing and box model.
- **Accessibility** panel — axe a11y checks per story.
- **Docs** — autodocs page (props + controls) generated for every component.
- **Design** panel — embedded Figma frame (see below).

**Link a story to its Figma frame** — add a `design` parameter (via `@storybook/addon-designs`); it renders in the "Design" panel next to the component:

```ts
const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    design: { type: "figma", url: "https://www.figma.com/file/…?node-id=…" },
  },
} satisfies Meta<typeof Button>;
```

Prefer adding the Figma link at the `meta` level so it applies to all stories of the component; override per-story where a specific frame differs.

## Related skills

Design-system authoring playbooks live in spaceship-base: `frontend-implement-design-system`, `frontend-explore-design-system`, `frontend-audit-design-compliance`, `frontend-add-story`, `frontend-audit-stories`, `frontend-graduate-component`, and `frontend-apply-shadow-border`. Read the relevant skill before starting a matching task; this directory's scoped conventions take precedence over older skill examples.
