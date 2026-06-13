// ---------------------------------------------------------------------------
// Cursor.tsx
// Custom cursor: a crisp accent dot that tracks 1:1 plus a lagging halo
// ring that swells over anything interactive. Two-phase mount: first decide
// availability (desktop pointer only), render the elements, THEN wire the
// GSAP setters — wiring before render left the setters bound to nothing
// and the page with no visible cursor at all.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { gsap, motionPref, isTouchDevice } from "../lib/motion";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isTouchDevice() && !motionPref.reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    document.documentElement.classList.add("has-cursor");

    // Park offscreen until the first pointer event.
    gsap.set([dot.current, ring.current], { x: -100, y: -100 });

    const xDot = gsap.quickSetter(dot.current, "x", "px");
    const yDot = gsap.quickSetter(dot.current, "y", "px");
    const xRing = gsap.quickTo(ring.current, "x", { duration: 0.4, ease: "power3" });
    const yRing = gsap.quickTo(ring.current, "y", { duration: 0.4, ease: "power3" });

    const move = (e: PointerEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const hot = (e.target as HTMLElement).closest("a, button, [data-cursor]");
      ring.current?.classList.toggle("is-hot", !!hot);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
    </>
  );
}
