// ---------------------------------------------------------------------------
// useReveals.ts
// One hook that wires every scroll-entrance animation on the page from
// declarative data attributes, so section components stay markup-only:
//
//   .reveal-line > .reveal-inner   masked line — inner slides up into view
//   [data-reveal]                  fades up 28px; stagger siblings that share
//                                  the same [data-reveal-group] parent
//   [data-parallax="0.15"]         drifts vertically at the given ratio
//   [data-drift="±1"]              horizontal scrub drift while in view
//   [data-count]                   numbers count up when entering view
//   [data-skew]                    container skews with scroll velocity
//
// Under prefers-reduced-motion everything is simply left visible — no
// transforms, no opacity tricks, fully readable.
// ---------------------------------------------------------------------------

import { useLayoutEffect } from "react";
import { gsap, ScrollTrigger, motionPref, themeState } from "./motion";

export function useReveals(ready: boolean) {
  useLayoutEffect(() => {
    if (!ready || motionPref.reduced) return;

    const ctx = gsap.context(() => {
      // Theme band: the page crossfades to the light primary across the
      // projects + about stretch, then back to ink. CSS vars handle the DOM;
      // themeState.target steers the silk shader palette.
      ScrollTrigger.create({
        trigger: "#work",
        endTrigger: "#about",
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (self) => {
          document.body.classList.toggle("theme-light", self.isActive);
          themeState.target = self.isActive ? 1 : 0;
        },
      });
      // Masked line reveals, batched per closest section so lines in the
      // same headline stagger together.
      document.querySelectorAll<HTMLElement>("[data-lines]").forEach((block) => {
        const inners = block.querySelectorAll(".reveal-inner");
        if (!inners.length) return;
        gsap.from(inners, {
          yPercent: 115,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.09,
          scrollTrigger: { trigger: block, start: "top 82%" },
        });
      });

      // Soft reveals: slower blur-rise for cards that should feel weighty
      // (education band). filter is cleared afterward so backdrop blur and
      // hover transitions aren't fighting a stale GSAP filter value.
      document.querySelectorAll<HTMLElement>("[data-reveal-soft-group]").forEach((group) => {
        const items = group.querySelectorAll("[data-reveal-soft]");
        if (!items.length) return;
        gsap.from(items, {
          y: 36,
          autoAlpha: 0,
          filter: "blur(10px)",
          duration: 1.4,
          ease: "power4.out",
          stagger: 0.18,
          clearProps: "filter",
          scrollTrigger: { trigger: group, start: "top 80%" },
        });
      });

      // Grouped fade-ups (cards, rows, stats).
      document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = group.querySelectorAll("[data-reveal]");
        if (!items.length) return;
        gsap.from(items, {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: group, start: "top 80%" },
        });
      });

      // Solo fade-ups.
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-group] [data-reveal])")
        .forEach((el) => {
          gsap.from(el, {
            y: 28,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        });

      // Slow vertical parallax drifts.
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const ratio = parseFloat(el.dataset.parallax || "0.12");
        gsap.fromTo(
          el,
          { y: () => ratio * 220 },
          {
            y: () => ratio * -220,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // Horizontal scrub drift — section titles glide sideways as the page
      // moves so big type is never frozen in place.
      document.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
        const dir = parseFloat(el.dataset.drift || "1");
        gsap.fromTo(
          el,
          { x: 70 * dir },
          {
            x: -70 * dir,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      // Count-up: any [data-count] whose text contains digits ticks from 0,
      // preserving prefix/suffix and thousands separators ("10,000+", "~21%").
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        const full = el.textContent ?? "";
        const m = full.match(/[\d,]+/);
        if (!m) return;
        const target = parseInt(m[0].replace(/,/g, ""), 10);
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate: () => {
            el.textContent = full.replace(m[0], Math.round(state.v).toLocaleString("en-US"));
          },
        });
      });

      // Velocity skew: [data-skew] containers shear with scroll velocity and
      // spring back — the page visibly reacts to how hard you scroll.
      const skewTargets = document.querySelectorAll<HTMLElement>("[data-skew]");
      if (skewTargets.length) {
        const clamp = gsap.utils.clamp(-2, 2);
        const proxy = { skew: 0 };
        const apply = () => skewTargets.forEach((el) => gsap.set(el, { skewY: proxy.skew }));
        ScrollTrigger.create({
          onUpdate: (self) => {
            const skew = clamp(self.getVelocity() / -600);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
              proxy.skew = skew;
              gsap.to(proxy, {
                skew: 0,
                duration: 0.9,
                ease: "power3.out",
                overwrite: true,
                onUpdate: apply,
              });
            }
          },
        });
      }

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [ready]);
}
