# The Signal — scroll-driven data story · Design Spec
**Date:** 2026-07-09 · **Status:** approved, ready for implementation plan

## Context

The portfolio is already strong visually (three.js silk, GSAP choreography, custom preloader, project covers with lightbox, desktop Lighthouse 98). Adding more decorative polish now has sharply diminishing returns, and for a **data analyst / BI** audience it risks reading as "designer who dabbles in data."

Jason wants recruiters to stop and be impressed, with **emphasis on visual spectacle** but carrying interactive proof and narrative too. The resolution: make the spectacle *out of real analysis*, so the showpiece is simultaneously the proof. A recruiter cannot dismiss it as decoration.

Constraint: **public datasets only** (KPay/BCA work is confidential). Chosen source is his public airline project, which has the largest scale and the crispest narrative.

## Verified data (provenance — do NOT re-derive or invent)

Source: `github.com/Jason-Joseph/Projects` → `Data Expo 2002-2003 Airline Time Data.ipynb` + repo README.

**Record count:** `11,759,899` — exact, from notebook cell 5 (`Int64Index: 11759899 entries`).

**Average total delay by day of week** (minutes) = `ArrDelay + DepDelay` from the notebook's `groupby('DayOfWeek').mean()` (cell 19):

| Day | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|---|
| Minutes | 44.4 | 42.3 | 41.1 | 44.4 | 44.9 | **39.0** | 43.7 |

- Mon–Fri are exact from the notebook (e.g. Mon = 24.776753 + 19.597453 = 44.374).
- **Sat/Sun were read off `q1_delay_by_day.png`** because the notebook cell used `.head()` and truncated rows 6–7. The reading method is validated: computed Mon–Fri values match that chart exactly.
- *Implementation note:* if the source data is still available, re-run the groupby without `.head()` to confirm Sat/Sun to one decimal. If not, the chart-read values stand (they are visually unambiguous).

**Model benchmark** (README, verbatim): Random Forest R² 0.975 / MSE 37.98; Linear Regression 0.939 / 93.84; Ridge 0.939 / 93.86; Lasso 0.842 / 242.82.

**The honest finding:** the spread between best (Sat 39.0) and worst (Fri 44.9) is ~6 minutes, about 13%. It is NOT dramatic. The section leads with that honesty deliberately — refusing to oversell is the credibility signal for a hiring manager. Any copy implying a large effect (an early mockup said "3x calmer") is false and must not ship.

## Section design

**Name:** "The Signal". **Placement:** new section between `Marquee` and `Projects`, numbered `01`.

**Four beats**, pinned for roughly one extra viewport of scroll:

1. **Scale** — counter runs to `11,759,899`. Caption: "Two years of US domestic aviation."
2. **Shape** — bars rise to real heights, values and axis fade in. Caption: "Average total delay, *by day of week*."
3. **Tension** — Friday flares warm (`#e2705f`), others dim. Caption: "Friday is the worst day to fly."
4. **Resolution** — Saturday goes cobalt (`--accent`), rest dim. Caption: "Saturday is calmest. *By six minutes.* The day barely matters. That's the finding." Footer reveals.

**Footer (beat 4):** method line — "Python, pandas. 11.7M rows cleaned and grouped. Four models benchmarked, Random Forest best at R² 0.975." — plus a quiet "See the notebook" link to the GitHub notebook. Verifiability is itself a credibility signal.

**Chart integrity:** true **zero baseline**. The bars therefore sit nearly level, which *is* the finding. Never truncate the axis to manufacture visual drama; a data-literate viewer would spot it and it would undercut the whole point.

## Technical approach

- Pure **SVG/DOM + the GSAP + ScrollTrigger already bundled**. No charting library, no new dependencies, no image weight. Data is a small hardcoded array in `content.ts` (7 values), not a fetched dataset.
- New `src/components/Signal.tsx` + styles appended to `site.css`; mounted in `App.tsx` between `Marquee` and `Projects`.
- Pin via `ScrollTrigger` with `pin: true, scrub`, following the existing `About.tsx` pinned-spread pattern (including its `gsap.matchMedia` desktop/mobile split).
- Beats are driven by explicit scrub-progress thresholds (fraction of the pinned scroll): beat 1 `0–0.23`, beat 2 `0.23–0.50`, beat 3 `0.50–0.75`, beat 4 `0.75–1.0`. The counter animates continuously across beat 1 rather than snapping.

**Section renumbering (touches several files):** Projects `01`→`02`, About `02`→`03`, Experience `03`→`04`, Contact `04`→`05`. Update the `.label` numerals and the `.ghost-no` parallax numerals in each component. Nav anchors (`#work`, `#about`, `#experience`) are unchanged.

**Reduced motion:** render the final state (beat 4) as a static chart with all captions resolved. No pin, no scrub.

**Mobile (≤900px):** no pin. The four beats play as a single entrance sequence when the section scrolls into view. Below `640px` the per-bar value labels are hidden (day labels and the caption stay); the chart height reduces to ~110px.

**Performance budget:** desktop Lighthouse must stay >= 95. The section adds no images and no libraries; the main risk is added DOM/pin work, so re-measure after implementation.

## Accepted trade-offs / open items

- **The airline project also remains a row in Projects.** Jason chose to keep it and link the notebook rather than remove the row, so that project appears twice on the page in two different treatments. Accepted. If the repetition reads badly once live, the cheap fix is dropping the airline entry from the featured rows.
- Concept C ("explorable" hover charts inside project rows) was liked but is **not in this spec** — it is a separate, smaller follow-up.
- The hero silk backdrop is deliberately **left alone**; trading a proven asset for an unproven one was rejected.

## Verification

1. `npm run build` green (typecheck + bundle).
2. Every number on screen traces to the provenance table above; no invented figures.
3. Zero baseline confirmed visually; axis starts at 0.
4. Scrub through all four beats on desktop; confirm pin releases cleanly into Projects.
5. Mobile <=900px: sequence plays without pinning, no layout overflow.
6. Reduced-motion (footer toggle): static resolved chart, all copy legible.
7. Renumbering: labels and ghost numerals read 01–05 down the page with no duplicates.
8. Lighthouse desktop re-run, compared against the current 98 baseline.
