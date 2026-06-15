# Copy & Visual Polish — Design Spec
**Date:** 2026-06-15

## What changes and why

The site's copy had two structural problems: (1) "raw data / messy data / raw numbers" appeared four times across hero, tagline, about lead, and about body — diluting each instance; (2) the hero tagline used "Data-driven" (cliché) and repeated "decisions" from the headline. The voice goal is warm intellectual curiosity, clean and understated.

---

## Changes

### 1. Hero headline
**File:** `src/components/Hero.tsx`

Before:
> "Turning raw data / into *clear decisions.*"

After:
> "Numbers made legible. / *Decisions made easier.*"

Also update `aria-label` to match.

---

### 2. Hero tagline
**File:** `src/content.ts` — `profile.tagline`

Before:
> "Data-driven and endlessly curious — I translate messy, real-world data into clear insight that drives decisions."

After:
> "Fintech and banking analytics across Singapore and Indonesia — turning transaction data and business signals into clarity that actually changes decisions."

---

### 3. Hero meta row — middle item
**File:** `src/components/Hero.tsx`

"Fintech & banking analytics" now duplicates the new tagline. Replace with the actual companies.

Before: `Fintech &amp; banking analytics`
After: `KPay · BCA`

---

### 4. About body — last sentence
**File:** `src/content.ts` — `about.body`

"Turning raw numbers" still echoes the old voice.

Before: `"…Day to day, that means Python, SQL, and BI tools turning raw numbers into something stakeholders can actually use."`

After: `"…Day to day, that means Python, SQL, and BI tools — and staying curious about what the numbers are actually trying to say."`

---

### 5. Velocity skew — reduce aggressiveness
**File:** `src/lib/useReveals.ts`

The project list skews on fast scrolls. Current values make it feel jarring on slower machines.

Before: `clamp(-3.5, 3.5)`, velocity divisor `-450`
After: `clamp(-2, 2)`, velocity divisor `-600`

---

## Out of scope
- No section structure changes
- No new animations
- All other copy stays as-is (about lead, projects headline, contact headline)
