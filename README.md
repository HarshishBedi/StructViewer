# StructViewer

**See data structures move, not just compile.**

[![Netlify Status](https://api.netlify.com/api/v1/badges/c7c2b1f6-f2e5-46ce-bc60-e5d4334654ff/deploy-status)](https://app.netlify.com/projects/structviewer/deploys)
[![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-0055ff?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Zustand](https://img.shields.io/badge/Zustand-State%20Management-7d4f2a)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-Testing-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev/)

StructViewer turns core DSA operations into an interactive visual experience with smooth transitions, timeline playback, and instant operational feedback.

[Live Demo](https://structviewer.online/) · [Report Feedback](https://structviewer.online/)

![StructViewer Hero](./docs/mockup.png)

## Why StructViewer

Most learning tools show the final answer.
StructViewer shows the journey:

- Every operation creates a timeline step
- Every step is replayable
- Every state change is visible
- Every action includes complexity context

## Explore 6 Core Modules

- **Stacks**: Push, pop, peek, clear, presets
- **Queues**: Enqueue, dequeue, front, clear, presets
- **Heaps**: Min/max modes, insert, extract root, reset, presets
- **Binary Search Trees**: Insert, delete, search, traversals, auto-balance toggle
- **Tries**: Insert/delete/search words, prefix queries
- **Union-Find**: Resize, union, find, connected checks

## What Makes It Different

- **Timeline-first UX** for replaying every operation
- **Fluid animations** for insertion, reordering, and traversal states
- **Script Console** to execute multi-step command flows quickly
- **Keyboard-first controls** with command palette + shortcuts
- **Responsive workspace** that keeps controls, visualization, and inspector in sync

## Built For

- Students preparing for interviews and exams
- Educators running live DSA demos
- Developers who want fast visual intuition for algorithm behavior

## At a Glance

- Frontend: React + TypeScript + Vite
- Motion: Framer Motion
- State: Zustand
- Testing: Vitest

## Minimal Local Run

```bash
npm install
npm run dev
```

## Docs

- Product idea: `docs/idea/product-idea.md`
- UI/UX direction: `docs/design/ui-ux-design.md`
- Architecture notes: `docs/architecture/file-tree.md`
