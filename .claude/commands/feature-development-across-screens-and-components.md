---
name: feature-development-across-screens-and-components
description: Workflow command scaffold for feature-development-across-screens-and-components in skapa-final.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-development-across-screens-and-components

Use this workflow when working on **feature-development-across-screens-and-components** in `skapa-final`.

## Goal

Implements or updates features that require coordinated changes across multiple React components and screens, often involving navigation and theming.

## Common Files

- `src/components/*.tsx`
- `src/screens/**/*.tsx`
- `src/navigation/MainNavigator.tsx`
- `src/theme/index.ts`
- `memory/PRD.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or create components in src/components/
- Edit or create screens in src/screens/ and subfolders
- Update navigation in src/navigation/MainNavigator.tsx
- Update theming in src/theme/index.ts
- Optionally update documentation in memory/PRD.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.