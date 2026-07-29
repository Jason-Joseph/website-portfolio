// ---------------------------------------------------------------------------
// About.tsx
// The portrait lives here now, opposite the pull-quote. On desktop the
// whole spread PINS while a scrubbed timeline reveals the quote line by
// line and the portrait de-blurs and pans — a deliberate "stop" moment —
// then releases into the stats band and skills.
// ---------------------------------------------------------------------------

import { useLayoutEffect, useRef } from "react";
import { gsap, motionPref } from "../lib/motion";
import content from "../content";

export default function About({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!ready || motionPref.reduced) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop: pin the spread and scrub the reveal through the hold.
      mm.add("(min-width: 901px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".about-grid",
            start: "top 22%",
            end: "+=70%",
            pin: true,
            scrub: 0.6,
          },
        });
        tl.from(".about-lead .reveal-inner", { yPercent: 115, stagger: 0.18, ease: "none" })
          .from(".about-portrait", { clipPath: "inset(0 0 100% 0)", ease: "none", duration: 1.2 }, 0)
          .fromTo(
            ".about-portrait img",
            { scale: 1.25, filter: "grayscale(85%) contrast(1.02)" },
            { scale: 1.08, filter: "grayscale(15%) contrast(1.04)", ease: "none", duration: 1.2 },
            0,
          )
          .from(".about-body > *", { autoAlpha: 0, y: 24, stagger: 0.15, ease: "none" }, 0.45);
      });

      // Mobile: no pin — simple entrance reveals instead.
      mm.add("(max-width: 900px)", () => {
        gsap.from(".about-lead .reveal-inner", {
          yPercent: 115,
          duration: 1.0,
          ease: "power4.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ".about-lead", start: "top 82%" },
        });
        gsap.from(".about-portrait", {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.1,
          ease: "power4.inOut",
          scrollTrigger: { trigger: ".about-portrait", start: "top 80%" },
        });
        gsap.from(".about-body > *", {
          autoAlpha: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".about-body", start: "top 85%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section className="section about" id="about" ref={root}>
      <span className="ghost-no" data-parallax="0.22" aria-hidden="true">
        02
      </span>
      <div className="container">
        <p className="label">
          <em>02</em> About
        </p>

        <div className="about-grid">
          <figure className="about-portrait">
            <span className="about-portrait-frame">
              <span className="about-portrait-window">
                <img
                  src={content.profile.photoPath}
                  alt={`Portrait of ${content.profile.name}`}
                  width={832}
                  height={1040}
                  loading="lazy"
                />
              </span>
            </span>
            <figcaption>{content.profile.name}</figcaption>
          </figure>

          <div className="about-copy">
            <h2 className="display about-lead">
              <span className="reveal-line">
                <span className="reveal-inner">I turn messy,</span>
              </span>
              <span className="reveal-line">
                <span className="reveal-inner">real-world data into</span>
              </span>
              <span className="reveal-line">
                <span className="reveal-inner">
                  insight people can <i>act on.</i>
                </span>
              </span>
            </h2>
            <div className="about-body">
              <p>{content.about.body}</p>
              <p className="about-availability">{content.contact.availability}</p>
            </div>
          </div>
        </div>

        <dl className="stats" data-reveal-group>
          {content.stats.map((s) => (
            <div className="stat" key={s.label} data-reveal>
              <dt>{s.label}</dt>
              <dd data-count>{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="skills" data-reveal-group>
          {content.skills.map((cat) => (
            <div className="skill-cat" key={cat.category} data-reveal>
              <h3>{cat.category}</h3>
              <p>{cat.items.join(" · ")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
