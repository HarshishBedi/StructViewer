# structviewer Tech Stack Document

## Objectives

The stack should optimize for:

- Smooth visual performance.
- Fast iteration speed.
- Type safety and maintainability.
- Easy deployment and scaling.

## Recommended Stack

## Frontend

- Framework: Next.js (App Router) + React + TypeScript.
- Build tool (for fast local iteration and SPA mode): Vite.
- Styling: Tailwind CSS with design tokens via CSS variables.
- Component primitives: Radix UI.
- Motion: Framer Motion for page/panel/microanimations.
- Data visualization:
  - SVG-first rendering for trees/heaps/stack diagrams.
  - D3 utilities for layout math (not full D3 DOM ownership).
- State management:
  - Zustand for app/session state.
  - Immer for predictable immutable updates.

## React Performance Toolkit

- `@tanstack/react-query`: cache and dedupe async data to avoid unnecessary refetch/render churn.
- `use-context-selector`: prevent full-tree rerenders when using React context.
- `react-window`: virtualize long lists (event timeline, operation logs, large arrays).
- `proxy-memoize` (or `reselect`): memoized derived state for expensive computed views.
- `why-did-you-render` (development only): detect avoidable rerenders during optimization passes.

Usage baseline:

- Prefer selector-based reads from Zustand (`shallow` compare where appropriate).
- Use `React.memo` only on expensive leaf components with stable props.
- Use `useMemo`/`useCallback` only for measurable hot paths.
- Keep heavy algorithm-step calculations in workers, not on the render path.

## Backend (Lightweight in V1)

- API layer: Next.js route handlers.
- Validation: Zod for runtime-safe input schemas.
- Persistence (optional V1, recommended V1.5+): PostgreSQL + Prisma.

## Performance Strategy

- Web Workers for heavy step computations on larger inputs.
- Memoized selectors for visualization state slices.
- RequestAnimationFrame-driven animation loops where needed.
- Lazy-load algorithm modules and docs panels.
- Virtualize long UI lists and logs by default.
- Profile interaction hotspots with React DevTools Profiler before and after optimization.

## Testing & Quality

- Unit tests: Vitest.
- UI tests: React Testing Library.
- End-to-end tests: Playwright.
- Linting/formatting: ESLint + Prettier.
- Pre-commit: Husky + lint-staged.

## Observability

- Error tracking: Sentry.
- Product analytics: PostHog (or equivalent event tracking).

## Deployment

- Hosting: Vercel (frontend + API).
- Database hosting: Neon/Supabase/Postgres provider.
- CI: GitHub Actions (`lint`, `test`, `build`, `e2e` on main branches).

## Suggested Project Structure

```txt
structviewer/
  docs/
    idea/
    design/
    tech-stack/
  src/
    app/
      (routes and layouts)
    components/
      ui/
      visualization/
      controls/
    features/
      trees/
      heaps/
      stacks/
      sorting/
    lib/
      algorithms/
      state/
      utils/
      constants/
    workers/
    styles/
  public/
    icons/
    illustrations/
  tests/
    unit/
    e2e/
```

## Repository Hygiene

- Canonical folder ownership and placement rules live in `docs/architecture/file-tree.md`.
- Keep root-level files minimal and avoid ad hoc directories.
- Use `.gitkeep` only for intentionally empty folders.
- Maintain a strict `.gitignore` policy to keep generated, secret, and local-only files out of version control.

## Implementation Notes

- Keep algorithm logic framework-agnostic in `src/lib/algorithms`.
- Keep renderer components pure and driven by state snapshots.
- Define shared action/event contracts early to avoid module drift.
- Build one reusable timeline engine and reuse it across all modules.
- Centralize keyboard shortcut mapping in a single command registry.

## V1 Technical Scope

- Complete Trees, Heaps, and Stacks modules end-to-end.
- Shared timeline + playback controls.
- Shared keyboard shortcuts and command palette.
- Responsive layout with accessible interactions.

## Risks and Mitigation

- Risk: animation jank on large inputs.
  - Mitigation: cap V1 input sizes and move heavy computation to workers.
- Risk: duplicated logic per module.
  - Mitigation: shared operation/event interfaces from day one.
- Risk: UI inconsistency as modules grow.
  - Mitigation: enforce design tokens and reusable primitives.
