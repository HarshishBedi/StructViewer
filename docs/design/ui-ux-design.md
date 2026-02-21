# structviewer UI/UX Design Document

## Design Direction

The interface should feel modern, focused, and calm:

- Minimal chrome, high information clarity.
- Subtle motion that supports understanding.
- Strong visual hierarchy without visual noise.

## Design Principles

- Visualize state changes, not decoration.
- Keep controls predictable and consistent across modules.
- Use animation to explain transitions, not to distract.
- Prioritize legibility over density.
- No redundant UI: do not duplicate controls, statuses, or helper hints.
- If an action is directly available, avoid extra shortcut labels or duplicate messages.

## Theme System

Use one consistent theme with CSS variables.

- Primary: cool blue for actionable controls.
- Accent: teal for highlights and active states.
- Success: green for valid operations.
- Warning: amber for edge cases.
- Error: red for invalid operations.
- Neutral background: soft gray gradient with layered panels.

Use color semantically (status meaning), not randomly.

## Typography

- Heading font: `Space Grotesk` (clear, modern, geometric).
- Body/label font: `Manrope` (high readability at small sizes).
- Monospace for values/indexes only: `JetBrains Mono`.

## Layout Strategy

Desktop layout:

- Top bar: module switcher, theme preference, reset.
- Left panel: structure controls and input actions.
- Center canvas: main visualization stage.
- Right panel: operation details and complexity hints.
- Bottom strip: timeline scrubber and playback controls.

Tablet/mobile layout:

- Stack panels into collapsible drawers.
- Keep visualization canvas as the primary visible element.
- Floating quick-action bar for common operations.

## Interaction Model

- Every action button has immediate visual response (`pressed`, `loading`, `disabled`).
- Each algorithm operation creates an entry in timeline history.
- Hover/focus states are visible and consistent.
- Invalid actions surface a clear inline reason.
- Selected node/item gets a clear ring + subtle pulse.

## Animation System

Use a small, reusable motion scale:

- `120ms`: tap/press feedback.
- `180ms`: panel and tooltip transitions.
- `240ms`: node insertion/removal transitions.
- `320ms`: complex re-layout (tree balancing, heap reheapify).

Easing:

- Standard enter: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Standard exit: `cubic-bezier(0.4, 0, 1, 1)`.

Animation rules:

- Animate transform and opacity first.
- Avoid layout thrashing properties.
- Stagger only where it improves comprehension.

## Component Rules

- Buttons
  - Primary: solid fill, one key call to action.
  - Secondary: subtle surface with border.
  - Ghost: low-emphasis utility actions.
- Inputs
  - Numeric-first where relevant.
  - Inline validation message on bad input.
- Cards/Panels
  - Soft radius, thin border, low-elevation shadow.
- Tooltips
  - Short and instructional, never verbose.

## Feedback and Indications

- Loading: subtle progress bar or skeleton.
- Success: short highlight pulse on affected elements.
- Error: inline message near action source.
- Empty states: clear prompt + one primary starter action.

## Accessibility Requirements

- WCAG AA contrast for text and controls.
- Keyboard navigable without mouse.
- Visible focus ring on all interactive controls.
- ARIA labels for controls and visualization metadata.
- Reduced-motion mode that keeps clarity without full animations.

## Design QA Checklist

- Are operation states clear in under 2 seconds?
- Are all primary actions discoverable without tutorial?
- Are animation timings consistent with the motion scale?
- Are mobile interactions as understandable as desktop interactions?
- Is there any duplicated control or repeated status message?
