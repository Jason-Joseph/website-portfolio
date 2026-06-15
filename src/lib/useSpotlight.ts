// ---------------------------------------------------------------------------
// useSpotlight.ts
// Cursor-aware radial glow. Any element marked [data-spotlight] tracks the
// pointer and exposes --spot-x / --spot-y (px, relative to the element).
// CSS paints a soft accent-tinted gradient at that point — see the
// .project-row / .github-card spotlight rules in site.css.
//
// Pointer-driven hover affordance (not a scroll reveal), so it stays on
// regardless of motion preference. Adapted from the 21st.dev "Spotlight
// Card" pattern, ported to this site's CSS + custom-property idiom.
// ---------------------------------------------------------------------------

import { useLayoutEffect } from "react";

export function useSpotlight(ready: boolean) {
  useLayoutEffect(() => {
    if (!ready) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-spotlight]"));
    if (!els.length) return;

    const onMove = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
    };

    els.forEach((el) => el.addEventListener("pointermove", onMove));
    return () => els.forEach((el) => el.removeEventListener("pointermove", onMove));
  }, [ready]);
}
