// ---------------------------------------------------------------------------
// motion.ts
// Shared motion preferences + GSAP registration, one place only.
// ---------------------------------------------------------------------------

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Motion kill-switch. Respects prefers-reduced-motion (Windows maps its
 * global "Animation effects" toggle to that media query), but a visitor
 * can override it either way via the footer toggle — the choice persists
 * in localStorage and wins over the OS setting. Every animation site-wide
 * reads this once at mount, so changing it requires a reload (the toggle
 * handles that).
 */
const MOTION_KEY = "jjt-motion"; // "on" | "off" | absent (follow the OS)

function initialReduced(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const override = localStorage.getItem(MOTION_KEY);
    if (override === "on") return false;
    if (override === "off") return true;
  } catch {
    /* storage blocked — fall through to the media query */
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
