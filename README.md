# spaceship-ui

Spaceship's design system: every component in one place, with a docs site to see them and a one-line install for each.

- **See them:** https://spaceship-ui.vercel.app (or `npm run dev` and open http://localhost:3000)
- **Install one into an app:** `npx shadcn@latest add https://spaceship-ui.vercel.app/r/<item>.json`
- **Change one:** edit it here in `registry/`, update its example in `registry/examples/`, run `npm run registry`, open a PR. Apps pull the change with the `lab-design-library` skill's `update` mode.

Files land in the app at `src/components/ds/...`, byte for byte. The app's CI runs `scripts/dslib.py check` and fails if its copy differs from `registry/`.

Seeded from `spaceship-frontend/src/components/ds` on 2026-11-12 (ASTRO-405). See [AGENTS.md](AGENTS.md) for the rules.
