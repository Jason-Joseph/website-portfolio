# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Singapore-based recruiters and HR screening data and BI candidates fast, roughly 30 to 60 seconds per candidate, deciding whether to forward him on. Secondary: hiring managers and data leads who click into notebooks, repos, and dashboards to judge the rigor of the work. The site must pass the fast screen first, then reward the reader who digs in (confirmed 2026-10-04).

## Product Purpose

The personal portfolio of Jason Joseph Tjiadi, a data analyst (titled "Data Enthusiast" on the site). It exists to win interviews for data and BI analyst roles in Singapore. Success: a recruiter knows within seconds who he is, what he does, and how to reach him, and a technical reader finds proof they can verify.

## Positioning

Fintech and banking analytics across Singapore and Indonesia (KPay, BCA), backed by an NUS Master's and an LSE First Class degree. He also ships working software with Claude Code, and the portfolio is itself that proof. The featured airline analysis, "The Signal", shows honest data storytelling: it reports a six-minute spread as six minutes and refuses to oversell it.

## Operating Context

Opened on phones from shared links and LinkedIn, and on desktops during recruiter screens. Links out to GitHub notebooks and R scripts, a CV PDF, live web apps (Unfold), and email.

## Capabilities and Constraints

- Stack: React 19, TypeScript, Vite, deployed on Vercel (`main` deploys to production). GSAP, Lenis, and three.js are in use today but are not binding on v2.
- `src/content.ts` is the single source of truth for all copy, figures, and projects. v2 keeps that content intact.
- Structure is open: section order, layout, and navigation may change as long as the content survives (confirmed 2026-10-04).
- Must work at 390px phone width; a real-Chrome mobile audit harness exists.
- v1 is preserved as git tag `v1`; v2 is developed on branch `v2` and tagged `v2` when it ships.

## Brand Commitments

- Name: Jason Joseph Tjiadi. Monogram: JJT.
- Voice: plain, confident, understated. Current line: "Numbers made legible. Decisions made easier."
- Data honesty is binding. The Signal's figures (11,759,899 flights; average delay minutes per weekday) are provenance-traced in `docs/superpowers/specs/2026-07-09-the-signal-design.md`. Charts keep a zero baseline, and the roughly six-minute spread is never dramatized.
- Work status and visa: the site stays silent on both (confirmed 2026-10-04).

## Evidence on Hand

- Figures: 10,000+ merchants analysed at KPay; ~21% average GPV growth supported; 20+ merchant partners at BCA; ~10% average YoY sales uplift identified at BCA; First Class honours at LSE; NUS GPA 4.6 / 5.0.
- Nine projects in `src/content.ts`, with covers in `public/projects/`: airline delay (The Signal), Superstore, Online Retail dashboard, This Portfolio Site, Unfold, Kaching, Agentic OS. Customer Churn and Vehicle Price Regression have no cover.
- Portrait `public/portrait.jpg`; logos `public/logos/` (KPay, BCA, NUS, LSE); CV `public/Jason-Joseph-Tjiadi-CV.pdf`; `public/og-image.png`.
- Absent, so never fabricate: testimonials, client logos beyond his employers, publications, awards beyond those listed.

## Product Principles

1. Recruiter in seconds, depth on demand.
2. Proof over claims: every number traceable, every project linkable.
3. The site is itself a portfolio piece; its craft is evidence.
4. Honesty is the brand: never inflate a finding.

## Accessibility & Inclusion

WCAG AA contrast; a working reduced-motion path (`prefers-reduced-motion` plus the footer toggle); a screen-reader table behind the Signal chart; 44px touch targets on touch devices.
