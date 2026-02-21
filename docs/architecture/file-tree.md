# structviewer File Tree Strategy

## Goal

Keep the repository predictable, scalable, and easy to navigate by giving each folder a single responsibility and enforcing placement rules.

## Canonical Tree

```txt
structviewer/
  .github/
    workflows/
  config/
  docs/
    architecture/
    design/
    idea/
    tech-stack/
  public/
    icons/
    illustrations/
    images/
  scripts/
  src/
    app/
    components/
      controls/
      layout/
      ui/
      visualization/
    features/
      heaps/
      shared/
      sorting/
      stacks/
      trees/
    lib/
      algorithms/
      constants/
      hooks/
      state/
      utils/
    styles/
    workers/
  tests/
    e2e/
    integration/
    unit/
```

## Folder Ownership Rules

- `src/features/*`: feature-specific UI + orchestration logic only.
- `src/lib/algorithms`: pure algorithm logic with no UI coupling.
- `src/components/ui`: reusable design-system-like components.
- `src/components/visualization`: rendering primitives for nodes, edges, bars, stacks.
- `src/workers`: heavy computations and async step generation.
- `tests/unit`: pure logic/component unit tests.
- `tests/integration`: cross-component/state behavior tests.
- `tests/e2e`: browser-level behavior and regression tests.

## Placement Rules

- If code is reused by 2+ features, move it to `src/lib` or `src/components`.
- Keep route-level files in `src/app` only.
- Do not place feature logic directly in `src/app`.
- Store static assets in `public`, never in `src`.
- Keep docs under `docs`, never mixed into feature folders.

## Naming Conventions

- Directories: `kebab-case`.
- React components: `PascalCase.tsx`.
- Utility modules and hooks: `camelCase.ts` and `useX.ts`.
- Constants files: `UPPER_SNAKE_CASE` exports in `constants/`.
- Tests: `*.test.ts` or `*.test.tsx`.

## Hygiene Rules

- One folder, one purpose.
- Avoid deeply nested folders unless they reduce ambiguity.
- Remove dead files in the same PR that makes them obsolete.
- Keep root-level files minimal and intentional.
- Keep `.gitkeep` only in intentionally empty scaffolding folders.
