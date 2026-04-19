---
name: feature-or-doc-update-with-shared-component
description: Workflow command scaffold for feature-or-doc-update-with-shared-component in skapa-final.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-or-doc-update-with-shared-component

Use this workflow when working on **feature-or-doc-update-with-shared-component** in `skapa-final`.

## Goal

Updates or adds a feature that involves both a shared component and a screen, often accompanied by documentation changes.

## Common Files

- `src/components/*.tsx`
- `src/screens/*.tsx`
- `memory/PRD.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or create a component in src/components/
- Edit or update a screen in src/screens/
- Update documentation in memory/PRD.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.