# Jason Joseph Tjiadi — Portfolio

A premium, editorial single-page portfolio. Dark/light theme that crossfades
on scroll, a three.js "silk" backdrop, and scroll-driven motion throughout.

**Live:** https://jason-portfolio-ecru.vercel.app

## Stack

- **Vite + React + TypeScript**
- **three.js** (via @react-three/fiber) — animated shader backdrop
- **GSAP + ScrollTrigger** — scroll-driven reveals, pinning, parallax
- **Lenis** — smooth scrolling

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # type-check + production bundle to /dist
npm run preview  # serve the production build locally
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/content.ts` | Single source of truth for all copy + data |
| `src/components/` | Section components (Hero, Projects, About, Experience, Contact…) |
| `src/three/Silk.tsx` | The animated three.js backdrop |
| `src/lib/` | Motion setup, Lenis, scroll-reveal wiring |
| `public/logos/` | Institution logos |

Deployed on Vercel (config in `vercel.json`).
