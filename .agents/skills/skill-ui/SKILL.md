---
name: skill-ui
description: "Follow the Jelly UI visual language before writing styles."
---

# Skill UI

Read this document before writing any new frontend styles that should match the project's Jelly component language.

## Required Reading Order

1. Read `.trellis/spec/frontend/index.md`
2. Read `.trellis/spec/frontend/css-design.md`
3. Read `.trellis/spec/frontend/jelly-ui-skill.md`
4. Inspect the current implementation in:
   - `frontend/assets/main.css`
   - `frontend/views/JellyComponentsDemoPage.vue`

## Core Rule

New styles should feel like they belong to the existing Jelly system, not like a separate admin template.

## Apply These Rules

1. Prefer existing Jelly components first:
   - `JellySurface`
   - `JellyButton`
   - `JellyDropdown`
   - `JellyModal`
2. Reuse existing theme tokens from `frontend/assets/main.css`
3. Keep layouts airy, rounded, layered, and luminous
4. Use Tailwind in templates first; only add CSS when the effect cannot be expressed cleanly with utilities
5. Preserve translucent surfaces, soft gradients, highlight borders, and restrained motion

## Avoid

- Flat white cards with generic gray borders
- Heavy dark shadows that fight the glass effect
- Sharp corners or cramped spacing
- Random one-off colors outside the theme tokens
- Motion that feels twitchy, abrupt, or overly playful

## Output Expectation

When adding or changing styles, explain briefly how the change follows the Jelly rules if the visual choice is non-obvious.
