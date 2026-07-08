# CV Sync + Six-Phase Improvement Program — Session Record
**Date:** 2026-07-08 · **Plan:** approved via plan mode; effort-ordered (light → heavy) per Jason

## Shipped
1. **CV sync (2026-07 resume):** About = NUS *graduate*; NUS GPA 4.6/5.0, dates → Jun 2026; BCA role + "· Individual Customer Business Division"; CV published at `/Jason-Joseph-Tjiadi-CV.pdf`, Download CV CTAs in hero + contact. Availability line unchanged (soft, per Jason). No bootcamp/PPIS/MS-Office sections (site stays curated).
2. **Performance + robustness:** Silk lazy-loaded (main bundle 1.23MB → 352KB; three.js chunk behind preloader); WebGL probe + `.backdrop-fallback` gradient; footer motion toggle (localStorage `jjt-motion`).
   **Post-mortem:** first attempt honored `prefers-reduced-motion` by default → Windows "Animation effects off" flattened everything for Jason (no preloader/crossfade/wave/reveals). Corrected: motion default-ON for all; toggle is the only opt-out; theme crossfade runs even under reduced (color, not motion). Do not re-wire the media query.
3. **Copy round two:** GitHub card subtitle → "Notebooks, models, and the occasional rabbit hole." All other surfaces kept by Jason (experience stays headline-less; marquee + footer as-is).
4. **Preloader:** monogram-draw concept (chosen over dot-matrix / boot-log / refined-numeral mockups). JJT strokes on with progress, fills at 100, dot pops; hairline bar + tabular counter; byline. Timeline later tightened ~2.4s → ~1.6s. `onDone → ready` contract preserved.
5. **Motion details (all three picked):** scroll-progress hairline (2px cobalt, scrubbed); word-cascade `[data-lines]` headlines (`splitWords` → `.w` spans, italics preserved); nav condenses (padding-block 1.1rem → 0.65rem) with the glass. Reveal timing unchanged by choice.
6. **Projects (Layout A — cover thumbnail):** one chart per featured row in an 8:5 bordered thumb, slow zoom on hover, stacks above text ≤900px. Screenshots self-hosted in `public/projects/` (10 files from the Projects-repo README assets, resized ≤960px, heavy ones JPEG q82, all <150KB, lazy + alt text). **Fixed broken capstone link** — repo PDF had been renamed (`Dibimbing B14 Final Project.pdf` → `Online Retail Customer Analytics Dashboard.pdf`); description updated to match (RFM + cohort, 1.07M transactions). List entries 04/05 are now the real R projects (Churn, Vehicle Price) replacing the generic umbrella; only the first `FEATURED_PROJECTS = 3` render.

## Open
- **Claude Code / vibe-coded projects**: Jason wants them in Projects; list (names/URLs/one-liners) not yet provided.
- **LCP ~5.5s** (consistent): next lever is self-hosting the Google Fonts (render-blocking CSS + swap). Lighthouse locally noisy (49–80 by host load; 55 idle); structural wins are real: TBT 750→450ms, bundle −72%, FCP improved.
- Backlog unchanged: hairline CTA (β) redesign; dark/light "Boardroom White" toggle.
