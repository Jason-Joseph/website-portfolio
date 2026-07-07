// ---------------------------------------------------------------------------
// Preloader.tsx
// Opening curtain: the JJT monogram draws itself on in sync with a 0→100
// progress sweep (hairline bar + counter beneath), fills solid at the top,
// then the panel lifts away and hands control to the hero (via onDone).
// Reduced motion skips straight to the page.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";
import { gsap, motionPref } from "../lib/motion";
import content from "../content";

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<SVGTextElement>(null);
  const bar = useRef<HTMLElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (motionPref.reduced) {
      if (root.current) root.current.style.display = "none";
      done.current();
      return;
    }

    // Stroke-draw plumbing. The dash length is re-measured once webfonts
    // land (Playfair can arrive mid-run); progress is tracked so the
    // offset stays consistent across a re-measure.
    const len = { v: 300 };
    const progress = { v: 0 };
    const applyStroke = () => {
      if (!mark.current) return;
      mark.current.style.strokeDasharray = `${len.v}`;
      mark.current.style.strokeDashoffset = `${len.v * (1 - progress.v / 100)}`;
    };
    const measure = () => {
      if (!mark.current) return;
      try {
        len.v = Math.max(1, Math.ceil(mark.current.getComputedTextLength()));
      } catch {
        /* keep fallback length */
      }
      applyStroke();
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => {});

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (root.current) root.current.style.display = "none";
        },
      });

      tl.to(progress, {
        v: 100,
        duration: 1.7,
        ease: "power2.inOut",
        onUpdate: () => {
          applyStroke();
          if (bar.current) bar.current.style.transform = `scaleX(${progress.v / 100})`;
          if (counter.current)
            counter.current.textContent = String(Math.round(progress.v)).padStart(3, "0");
        },
      })
        // the mark settles: glyphs fill, the brand dot pops in
        .to(mark.current, { fillOpacity: 1, duration: 0.45, ease: "power2.out" }, ">-0.05")
        .fromTo(
          ".preloader-mark-dot",
          { scale: 0, transformOrigin: "center" },
          { scale: 1, duration: 0.4, ease: "back.out(2.2)" },
          "<",
        )
        .to(".preloader-inner", { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.25")
        .add(() => done.current(), "<") // let the hero start while the curtain lifts
        .to(root.current, { yPercent: -100, duration: 1.0, ease: "power4.inOut" }, "<");
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader-inner">
        <svg className="preloader-mark" viewBox="0 0 150 86" role="presentation">
          <text ref={mark} className="preloader-mark-text" x="72" y="62" textAnchor="middle">
            JJT
          </text>
          <circle className="preloader-mark-dot" cx="126" cy="56" r="3.5" fill="#7388ff" />
        </svg>
        <div className="preloader-progress">
          <span className="preloader-bar">
            <i ref={bar} />
          </span>
          <span className="preloader-counter" ref={counter}>
            000
          </span>
        </div>
        <p className="preloader-byline">
          {content.profile.name} — {content.contact.location}
        </p>
      </div>
    </div>
  );
}
