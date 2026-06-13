// ---------------------------------------------------------------------------
// motion.ts
// Shared motion preferences + GSAP registration, one place only.
// ---------------------------------------------------------------------------

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Motion kill-switch. Deliberately NOT wired to prefers-reduced-motion:
 * Windows maps its global "Animation effects" toggle to that media query,
 * which silently flattened the whole site to static for a large share of
 * desktop users — the owner wants the animated experience to be the
 * default. Flip to true (or re-wire to the media query) to disable all
 * GSAP/three.js motion in one place.
 */
export const motionPref = { reduced: false };

/**
 * Page theme state. The DOM theme is a class on <body> (`theme-light`)
 * toggled by a ScrollTrigger spanning the light editorial band; CSS vars
 * crossfade colors. `target` is read per-frame by the three.js silk layer,
 * which lerps its own uniforms toward it so the shader recolors in step
 * with the CSS transition.
 */
export const themeState = { target: 0 }; // 0 = dark, 1 = light

/** True on coarse-pointer (touch) devices — used to skip the custom cursor. */
export function isTouchDevice(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}
