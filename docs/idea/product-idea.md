# AlgoVis Product Idea

## Vision

AlgoVis is an interactive learning playground where users can build and manipulate data structures and algorithms visually, step by step, with immediate feedback and clean animations.

The product goal is to make abstract algorithm behavior feel concrete, intuitive, and memorable.

## Problem Statement

Most algorithm learning tools are either:

- Text-heavy and static.
- Too academic for beginners.
- Too simplistic for intermediate users.

AlgoVis solves this by combining visual clarity, guided interactions, and low-friction controls in one modern web app.

## Target Users

- Students preparing for interviews or exams.
- Self-taught developers learning DSA.
- Instructors who need live classroom demos.
- Curious users exploring how algorithms behave in real time.

## Core Experience

Users choose a module, perform basic operations, and watch every state transition.

## Initial Modules (V1)

- Trees
  - Binary Tree, BST basics.
  - Insert, delete, search, traverse (inorder/preorder/postorder/level order).
- Heaps
  - Min-heap and max-heap.
  - Insert, extract root, heapify up/down, build heap.
- Stacks
  - Push, pop, peek, clear.
  - Optional expression evaluation walkthrough.
- Sorting Visualizer (bonus in V1 if bandwidth allows)
  - Bubble, Selection, Insertion, Merge, Quick.
  - Adjustable speed and input size.

## Guiding Product Principles

- Clarity first: every operation should be understandable at a glance.
- Learn by doing: users control operations, speed, and input.
- Consistent mental model: similar controls and feedback across modules.
- Fast interaction loop: actions feel immediate and responsive.

## Key Features

- Step-by-step mode and autoplay mode.
- Action timeline with previous and next navigation.
- Input panel for custom values.
- Preset examples for quick starts.
- Inline explanations for each operation step.
- Keyboard shortcuts for core actions.
- Mobile-responsive layout without losing readability.

## Non-Goals (V1)

- Competitive coding platform.
- Full course platform with authentication-heavy LMS features.
- Advanced graph algorithms beyond introductory set.

## Success Criteria

- Users can complete at least one full operation flow in under 60 seconds.
- Users can replay and understand intermediate states without external help.
- UI remains smooth for typical input sizes in educational use.
