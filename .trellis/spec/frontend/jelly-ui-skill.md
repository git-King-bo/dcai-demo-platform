# Jelly UI Style Guide

> Project-specific UI rules for building screens that match the existing Jelly component system.

## Overview

The current frontend visual language is a soft glassmorphism system with luminous gradients, rounded geometry, and calm motion. New UI should extend this system rather than introducing a second design language.

Primary references:

- `frontend/assets/main.css`
- `frontend/views/JellyComponentsDemoPage.vue`

## Visual Principles

### 1. Soft Glass, Not Flat Panels

Surfaces should feel translucent and layered:

- Use light borders with partial opacity
- Combine blur, saturation, highlight overlays, and soft depth
- Prefer gradient-backed surfaces over flat fills
- Keep contrast readable, but avoid harsh black-and-white blocks

### 2. Rounded and Airy

The Jelly language uses generous radius and breathing room:

- Prefer `rounded-2xl`, `rounded-3xl`, or component-provided radii
- Use comfortable internal spacing such as `p-5`, `p-6`, `p-8`
- Keep sections visually separated with gap, layering, and tone shifts instead of dense dividers

### 3. Luminous Color System

Color should come from the existing token system in `frontend/assets/main.css`:

- Use theme tokens like `background`, `foreground`, `card`, `panel`, `primary`, and `theme-glow-*`
- Accent areas should feel luminous, not neon
- Favor transparent and blended color usage over fully opaque blocks

### 4. Calm Motion

Motion should feel smooth and slightly elastic:

- Prefer easing similar to `cubic-bezier(0.16, 1, 0.3, 1)`
- Use subtle lift, settle, or reveal motion
- Keep hover and press states tactile but restrained
- Respect reduced-motion behavior when adding animation

## Component-Level Rules

### Surface Patterns

When building sections, panels, cards, or grouped content:

- Prefer `JellySurface` before introducing new wrappers
- Use `tone="default"` for standard content blocks
- Use `tone="soft"` for secondary information
- Use `tone="accent"` only for hero, summary, or emphasized zones
- Use elevated variants sparingly for visual anchors

### Action Patterns

When building buttons or controls:

- Prefer `JellyButton`
- Primary actions may use stronger glow and contrast
- Secondary actions should still keep the translucent Jelly texture
- Avoid plain browser-looking controls or flat gray utility-only buttons unless intentionally minimal inside an existing Jelly container

### Overlay Patterns

For dropdowns, modals, popovers, and floating UI:

- Match the Jelly shell behavior: blur, translucent fill, rounded corners, and highlight edges
- Floating panels should feel attached to the page atmosphere
- Avoid hard-edged opaque overlays unless required for accessibility or content clarity

## Typography Rules

- Keep headings compact, confident, and slightly tight in tracking
- Use muted opacity for supporting text instead of switching to unrelated colors
- Eyebrow labels may use uppercase with loose tracking for section framing
- Avoid oversized decorative typography unless the screen already uses a hero layout

## Layout Rules

- Prefer wide breathable containers over crowded grids
- Let one area lead visually; do not make every card equally loud
- Use staggered density: one strong focal block, then quieter supporting blocks
- On mobile, preserve softness and spacing rather than shrinking everything aggressively

## Tailwind and CSS Usage

### Prefer Tailwind First

Default to Tailwind utilities inside Vue templates for:

- spacing
- layout
- typography
- sizing
- standard color application

### Add CSS Only for Jelly Effects

Use component or global CSS only when implementing:

- backdrop blur
- compound gradients
- custom layered highlights
- special reveal or hover motion
- pseudo-element-based lighting effects

If the effect already exists in `frontend/assets/main.css`, reuse it instead of recreating it.

## Do / Don't

### Do

- Build from existing Jelly primitives first
- Reuse theme tokens and glow variables
- Keep corners soft and spacing generous
- Use translucent layers and gradient depth
- Make interaction states feel tactile and premium

### Don't

- Introduce flat enterprise-style gray cards beside Jelly surfaces
- Mix unrelated visual systems on the same page
- Overuse accent gradients on every element
- Add strong borders, harsh shadows, or tiny radii
- Add custom colors that bypass the token system

## Review Checklist

Before shipping a style change, verify:

1. Does the UI look like it belongs beside `JellyComponentsDemoPage.vue`?
2. Are existing Jelly components reused where possible?
3. Are tokens from `frontend/assets/main.css` reused instead of hard-coded colors?
4. Are radius, spacing, and motion soft enough to match the system?
5. Did we avoid adding a competing visual language?

## Recommended Workflow

1. Read this guide before writing new styles
2. Inspect the nearest Jelly example already in the codebase
3. Reuse existing Jelly primitives and tokens
4. Add new CSS only when utilities are not enough
5. Sanity-check the result against the review checklist
