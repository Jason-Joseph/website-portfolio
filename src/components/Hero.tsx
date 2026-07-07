// ---------------------------------------------------------------------------
// Hero.tsx
// Full-viewport opener: pure typography now — the oversized serif headline
// owns the whole width (masked line reveals), tagline and meta row below.
// Animates in once the preloader hands over (`ready`).
// ---------------------------------------------------------------------------

import { useLayoutEffect, useRef } from "react";
import { gsap, motionPref } from "../lib/motion";
import content from "../content";

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (motionPref.reduced) return;
    const ctx = gsap.context(() => {
      gsap.set(".hero-line .reveal-inner", { yPercent: 115 });
      gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 24 });
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (!ready || motionPref.reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".hero-line .reveal-inner", { yPercent: 0, duration: 1.2, stagger: 0.1 }, 0.1).to(
        "[data-hero-fade]",
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 },
        0.85,
      );

      // The headline sinks slightly slower than the page on exit — parallax.
      gsap.to(".hero-title", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section className="hero" id="top" ref={root}>
      <div className="container">
        <p className="hero-kicker" data-hero-fade>
          <em>{content.profile.title}</em> — {content.contact.location}
        </p>
        <h1 className="display hero-title" aria-label="Numbers made legible. Decisions made easier.">
          <span className="reveal-line hero-line">
            <span className="reveal-inner">Numbers made legible.</span>
          </span>
          <span className="reveal-line hero-line">
            <span className="reveal-inner">
              <i>Decisions made easier.</i>
            </span>
          </span>
        </h1>
        <div className="hero-sub" data-hero-fade>
          <p className="hero-tagline">{content.profile.tagline}</p>
          <p className="hero-name shimmer-text">{content.profile.name}</p>
        </div>
        <div className="hero-ctas" data-hero-fade>
          <a className="hero-cta" href={`mailto:${content.contact.email}`} data-cursor>
            Email me
          </a>
          <a
            className="hero-cta hero-cta-ghost"
            href={content.contact.linkedin}
            target="_blank"
            rel="noreferrer"
            data-cursor
          >
            LinkedIn
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </a>
          <a
            className="hero-cta hero-cta-ghost"
            href="/Jason-Joseph-Tjiadi-CV.pdf"
            download
            data-cursor
          >
            Download CV
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M5 20h14" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </a>
        </div>
      </div>

      <div className="container hero-meta" data-hero-fade>
        <span>NUS · LSE</span>
        <span className="hero-meta-mid">KPay · BCA</span>
        <a href="#work" className="hero-scroll" aria-label="Scroll to selected work">
          Scroll
          <svg width="10" height="26" viewBox="0 0 10 26" fill="none" aria-hidden="true">
            <path d="M5 0v24M1 20l4 5 4-5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </a>
      </div>
    </section>
  );
}
