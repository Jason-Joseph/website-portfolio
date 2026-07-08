// ---------------------------------------------------------------------------
// motion.ts
// Shared motion preferences + GSAP registration, one place only.
// ---------------------------------------------------------------------------

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Motion kill-switch. The animated experience is the DEFAULT for everyone:
 * Windows maps its global "Animation effects" toggle to
 * prefers-reduced-motion, which would silently flatten the whole site for a
 * large share of desktop visitors (the owner's own machine included) — so
 * the media query is deliberately not consulted. Visitors who want less
 * motion use the explicit footer toggle instead; that choice persists in
 * localStorage and is read once at mount (the toggle reloads to apply).
 */
const MOTION_KEY = "jjt-motion"; // "off" reduces; anything else = full motion

function initialReduced(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MOTION_KEY) === "off";
  } catch {
    return false;
  }
}

export const motionPref = { reduced: initialReduced() };

/** Footer toggle: persist the visitor's choice, then reload so every
 *  mount-time animation re-reads it. */
export function setMotionEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(MOTION_KEY, enabled ? "on" : "off");
  } catch {
    /* ignore */
  }
  window.location.reload();
}

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
