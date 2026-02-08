# Animations, Accessibility & Performance

This document explains how decorations, animations and heavy visuals behave and how to disable or tune them for accessibility or low-end devices.

## Reduce motion
Most modern OSes allow users to request reduced motion. The frontend respects this setting — when `prefers-reduced-motion: reduce` is enabled, the site will:

- Disable decorative cursor (`TargetCursor`).
- Replace animated marquees (`FlowingMenu`) with a static list.
- Replace WebGL gallery (`CircularGallery`) with a lightweight fallback.
- Reduce or remove non-essential transitions and animations via CSS.

If you want to test reduced-motion behavior locally, toggle the setting in your OS accessibility preferences or use Chrome DevTools Rendering -> Emulate CSS media feature `prefers-reduced-motion`.

## Performance tips
- Heavy visuals (WebGL, GSAP) are lazy-loaded and disabled on small screens to reduce CPU/GPU usage and avoid jank on mobile.
- To further speed up local development, run the app in a non-minified build or disable decorations by setting `prefers-reduced-motion`.

## Where to change behavior
- `frontend/src/styles/globals.css` — global reduced-motion and focus-visible styles.
- `frontend/src/components/ui/TargetCursor.tsx` — custom cursor. Disabled on touch and when reduced motion is requested.
- `frontend/src/components/ui/FlowingMenu.tsx` — GSAP marquee. Renders a static fallback when reduced motion is requested.
- `frontend/src/components/ui/CircularGallery.tsx` — OGL gallery. Skips WebGL rendering on small screens and when reduced motion is requested.

## Dev server
Run the frontend locally:

```bash
cd frontend
pnpm dev
```

If you want me to further tune animation durations, add a UI toggle to disable animations, or add telemetry for performance, tell me which you'd prefer and I will implement it.
