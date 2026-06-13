// ---------------------------------------------------------------------------
// useLenis.ts
// Smooth scrolling via Lenis, driven from GSAP's ticker so Lenis and
// ScrollTrigger share one clock (the official Lenis+GSAP integration).
// Skipped entirely under prefers-reduced-motion — native scrolling instead.
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, motionPref } from "./motion";

export function useLenis() {
  useEffect(() => {
    // The browser re-applying a stale scroll position after load fights both
    // Lenis and ScrollTrigger-pinned intros. Own it manually.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    if (motionPref.reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}
