// ---------------------------------------------------------------------------
// Preloader.tsx
// Opening curtain: counter sweeps 0→100 beside the name, then the panel
// lifts away and hands control to the hero (via onDone). Reduced motion
// skips straight to the page.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";
import { gsap, motionPref } from "../lib/motion";
import content from "../content";

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (motionPref.reduced) {
      if (root.current) root.current.style.display = "none";
      done.current();
      return;
    }

    const ctx = gsap.context(() => {
      const n = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          if (root.current) root.current.style.display = "none";
        },
      });

      tl.to(".preloader-name .reveal-inner", {
        yPercent: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.08,
      })
        .to(
          n,
          {
            v: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counter.current) counter.current.textContent = String(Math.round(n.v)).padStart(3, "0");
            },
          },
          "<0.1",
        )
        .to(".preloader-inner", { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.15")
        .add(() => done.current(), "<") // let the hero start while the curtain lifts
        .to(root.current, { yPercent: -100, duration: 1.0, ease: "power4.inOut" }, "<");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader-inner">
        <p className="preloader-name" data-nosplit>
          <span className="reveal-line">
            <span className="reveal-inner preloader-start">{content.profile.name}</span>
          </span>
          <span className="reveal-line">
            <span className="reveal-inner preloader-start preloader-role">
              {content.profile.title} — {content.contact.location}
            </span>
          </span>
        </p>
        <span className="preloader-counter" ref={counter}>
          000
        </span>
      </div>
    </div>
  );
}
